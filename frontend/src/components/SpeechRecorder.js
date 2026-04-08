import React, { useState, useRef, useEffect, useCallback } from 'react';

/* ── Format time mm:ss ───────────────────────── */
function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

/**
 * SpeechRecorder
 *
 * Props:
 *   onRecordingComplete(blob, durationSec, transcript) — called when recording stops
 *   maxDuration  — max recording seconds (default 120)
 *   disabled     — disables the button
 */
export default function SpeechRecorder({
    onRecordingComplete,
    maxDuration = 120,
    disabled = false,
}) {
    const [recording, setRecording] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [error, setError] = useState(null);
    const [liveTranscript, setLiveTranscript] = useState('');
    const [speechSupported, setSpeechSupported] = useState(true);

    /* ── Refs ───────────────────────── */
    const mediaRecorderRef   = useRef(null);
    const chunksRef          = useRef([]);
    const timerRef           = useRef(null);
    const streamRef          = useRef(null);
    const recognitionRef     = useRef(null);
    const transcriptRef      = useRef('');   // always holds the latest full transcript
    const elapsedRef         = useRef(0);    // mirror of elapsed for use inside onstop

    /* Keep elapsedRef in sync */
    useEffect(() => { elapsedRef.current = elapsed; }, [elapsed]);

    /* ── Check Web Speech API support ───────────────────────── */
    useEffect(() => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setSpeechSupported(false);
        }
    }, []);

    /* ── Start Recording ───────────────────────── */
    const startRecording = async () => {
        setError(null);
        chunksRef.current    = [];
        transcriptRef.current = '';
        setLiveTranscript('');
        setElapsed(0);
        elapsedRef.current = 0;

        try {
            /* 1. Microphone stream */
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            /* 2. MediaRecorder (for audio blob) */
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                stream.getTracks().forEach(t => t.stop());

                if (onRecordingComplete) {
                    onRecordingComplete(
                        blob,
                        elapsedRef.current,
                        transcriptRef.current.trim()
                    );
                }
            };

            recorder.start();

            /* 3. Web Speech API (live transcript) */
            const SpeechRecognition =
                window.SpeechRecognition || window.webkitSpeechRecognition;

            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognitionRef.current = recognition;

                recognition.lang            = 'en-US';
                recognition.continuous      = true;
                recognition.interimResults  = true;

                let finalTranscript = '';

                recognition.onresult = (event) => {
                    let interim = '';

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const chunk = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            finalTranscript += chunk + ' ';
                        } else {
                            interim += chunk;
                        }
                    }

                    const displayed = finalTranscript + interim;
                    transcriptRef.current = finalTranscript + interim;
                    setLiveTranscript(displayed);
                };

                recognition.onerror = (e) => {
                    /* network / aborted errors are non-fatal during recording */
                    if (e.error !== 'aborted' && e.error !== 'no-speech') {
                        console.warn('SpeechRecognition error:', e.error);
                    }
                };

                recognition.start();
            }

            /* 4. Timer */
            setRecording(true);
            timerRef.current = setInterval(() => {
                setElapsed(prev => {
                    const next = prev + 1;
                    elapsedRef.current = next;
                    if (next >= maxDuration) {
                        stopRecording();
                        return prev;
                    }
                    return next;
                });
            }, 1000);

        } catch (err) {
            setError('Microphone access denied or not available.');
            console.error(err);
        }
    };

    /* ── Stop Recording ───────────────────────── */
    const stopRecording = useCallback(() => {
        /* Stop speech recognition first */
        try { recognitionRef.current?.stop(); } catch (_) {}

        /* Stop media recorder */
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
        }

        clearInterval(timerRef.current);
        setRecording(false);
    }, []);

    /* ── Cleanup on unmount ───────────────────────── */
    useEffect(() => {
        return () => {
            clearInterval(timerRef.current);
            streamRef.current?.getTracks().forEach(t => t.stop());
            try { recognitionRef.current?.stop(); } catch (_) {}
        };
    }, []);

    const progress = (elapsed / maxDuration) * 100;

    return (
        <div className="flex flex-col items-center gap-4 p-4">

            {/* Record Button */}
            <button
                id="speech-recorder-btn"
                onClick={recording ? stopRecording : startRecording}
                disabled={disabled}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl
                    transition-all duration-200 shadow-md
                    ${disabled
                        ? 'bg-gray-300 cursor-not-allowed'
                        : recording
                            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                            : 'bg-orange-500 hover:bg-orange-600'
                    }`}
                aria-label={recording ? 'Stop recording' : 'Start recording'}
            >
                {recording ? '■' : '🎤'}
            </button>

            {/* Status */}
            <div className="text-center">
                {recording ? (
                    <>
                        <p className="text-red-500 font-semibold">● Recording...</p>
                        <p className="text-sm text-gray-500">
                            {formatTime(elapsed)} / {formatTime(maxDuration)}
                        </p>
                    </>
                ) : (
                    <p className="text-gray-500 text-sm">
                        {disabled ? 'Select a topic first' : 'Click to start recording'}
                    </p>
                )}
            </div>

            {/* Progress Bar */}
            {recording && (
                <div className="w-full max-w-xs bg-gray-200 h-2 rounded overflow-hidden">
                    <div
                        className="h-2 bg-orange-500 rounded transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Live Transcript Box */}
            {recording && (
                <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-lg p-3 min-h-[80px]">
                    <p className="text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wide">
                        Live Transcript
                    </p>
                    {liveTranscript ? (
                        <p className="text-sm text-gray-700 leading-relaxed">
                            {liveTranscript}
                        </p>
                    ) : (
                        <p className="text-sm text-gray-400 italic">
                            {speechSupported
                                ? 'Start speaking — transcript appears here...'
                                : 'Speech-to-text not supported in this browser'}
                        </p>
                    )}
                </div>
            )}

            {/* Error */}
            {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
            )}

        </div>
    );
}