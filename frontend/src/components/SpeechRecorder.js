import React, { useState, useRef, useEffect, useCallback } from 'react';

/* ── Helper: format seconds ──────────────────────────────────── */
function fmtTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

/* ── Waveform bars (visual feedback while recording) ─────────── */
function WaveformBars({ active }) {
    const heights = [12, 20, 28, 36, 28, 20, 12, 20, 28, 20, 12, 28, 36, 20, 12];
    return (
        <div className="flex items-end gap-0.5 h-10">
            {heights.map((h, i) => (
                <div
                    key={i}
                    className="wave-bar w-1"
                    style={{
                        height: active ? `${h}px` : '6px',
                        animationDelay: active ? `${i * 0.07}s` : '0s',
                        animationPlayState: active ? 'running' : 'paused',
                        transition: 'height 0.3s ease',
                    }}
                />
            ))}
        </div>
    );
}

/**
 * SpeechRecorder
 * Props:
 *   onRecordingComplete(blob, durationSec) – called when recording stops
 *   maxDuration – seconds (default 120)
 *   disabled    – disable controls
 */
export default function SpeechRecorder({
    onRecordingComplete,
    maxDuration = 120,
    disabled = false,
}) {
    const [status, setStatus] = useState('idle'); // idle | recording | processing
    const [elapsed, setElapsed] = useState(0);
    const [error, setError] = useState(null);
    const [hasBlob, setHasBlob] = useState(false);

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);
    const blobRef = useRef(null);
    const streamRef = useRef(null);
    const elapsedRef = useRef(0);

    const stopTimer = useCallback(() => {
        clearInterval(timerRef.current);
        timerRef.current = null;
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        stopTimer();
    }, [stopTimer]);

    const startTimer = useCallback(() => {
        elapsedRef.current = 0;
        setElapsed(0);
        timerRef.current = setInterval(() => {
            elapsedRef.current += 1;
            setElapsed(elapsedRef.current);
            if (elapsedRef.current >= maxDuration) {
                stopRecording();
            }
        }, 1000);
    }, [maxDuration, stopRecording]);

    const startRecording = useCallback(async () => {
        setError(null);
        setHasBlob(false);
        chunksRef.current = [];

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            streamRef.current = stream;

            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm';

            const mr = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mr;

            mr.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mr.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
                blobRef.current = blob;
                streamRef.current?.getTracks().forEach(t => t.stop());
                streamRef.current = null;
                setStatus('idle');
                setHasBlob(true);
                if (onRecordingComplete) {
                    onRecordingComplete(blob, elapsedRef.current);
                }
            };

            mr.start(250);
            setStatus('recording');
            startTimer();
        } catch (err) {
            if (err.name === 'NotAllowedError') {
                setError('Microphone access denied. Please allow microphone permissions.');
            } else {
                setError('Could not access microphone. Please check your device settings.');
            }
        }
    }, [onRecordingComplete, startTimer]);

    useEffect(() => {
        return () => {
            stopTimer();
            streamRef.current?.getTracks().forEach(t => t.stop());
        };
    }, [stopTimer]);

    const isRecording = status === 'recording';
    const progressPct = (elapsed / maxDuration) * 100;
    const timeRemaining = maxDuration - elapsed;

    return (
        <div className="flex flex-col items-center gap-6 py-6">
            {/* Waveform / idle indicator */}
            <div className="relative flex flex-col items-center gap-3">
                <WaveformBars active={isRecording} />

                {/* Big record button */}
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={disabled || status === 'processing'}
                    className={`
            relative w-20 h-20 rounded-full flex items-center justify-center
            transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2
            focus:ring-offset-cream-100 disabled:opacity-50 disabled:cursor-not-allowed
            ${isRecording
                            ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.4)] focus:ring-red-300'
                            : 'bg-gradient-to-br from-orange-500 to-peach-300 hover:from-orange-600 hover:to-peach-400 shadow-orange focus:ring-orange-300 animate-glow'
                        }
          `}
                    aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                >
                    {isRecording ? (
                        /* Stop square */
                        <span className="w-7 h-7 rounded-md bg-white" />
                    ) : (
                        /* Microphone icon */
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Status label */}
            <div className="text-center">
                {isRecording ? (
                    <>
                        <p className="text-red-500 font-bold text-sm animate-pulse">🔴 Recording…</p>
                        <p className="text-ink-400 text-xs mt-0.5">
                            {fmtTime(elapsed)} / {fmtTime(maxDuration)}
                            &nbsp;·&nbsp;{fmtTime(timeRemaining)} remaining
                        </p>
                    </>
                ) : hasBlob ? (
                    <p className="text-mint-500 text-sm font-bold">✅ Recording complete — Analysis in progress…</p>
                ) : (
                    <p className="text-ink-400 text-sm">
                        {disabled ? 'Recording disabled' : 'Press the mic to start recording'}
                    </p>
                )}
            </div>

            {/* Progress bar (only while recording) */}
            {isRecording && (
                <div className="w-full max-w-xs xp-bar-track">
                    <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                            width: `${progressPct}%`,
                            background: timeRemaining < 15
                                ? 'linear-gradient(90deg,#ef4444,#FF8070)'
                                : 'linear-gradient(90deg,#FF8C42,#FFB7A5)'
                        }}
                    />
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="w-full max-w-xs px-4 py-3 rounded-2xl bg-red-50 border-2 border-red-200">
                    <p className="text-red-500 text-sm text-center">{error}</p>
                </div>
            )}
        </div>
    );
}
