import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import wsService from '../services/websocket';

/* ── Timestamp helper ─────────────────────────────────────────── */
function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/* ── Single message bubble ────────────────────────────────────── */
function MessageBubble({ msg, isOwn }) {
    return (
        <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            {!isOwn && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-lavender-300
                        flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {msg.sender?.[0]?.toUpperCase() || '?'}
                </div>
            )}

            <div className={`max-w-xs ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                {!isOwn && (
                    <span className="text-ink-400 text-[10px] px-1 font-medium">{msg.sender}</span>
                )}
                <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${isOwn
                        ? 'bg-gradient-to-br from-orange-500 to-peach-300 text-white rounded-br-sm'
                        : 'bg-cream-100 text-ink-800 border-2 border-cream-200 rounded-bl-sm'
                    }`}>
                    {msg.type === 'system' ? (
                        <span className="italic text-ink-400 text-xs">{msg.text}</span>
                    ) : msg.text}
                </div>
                <span className="text-ink-300 text-[9px] px-1">{formatTime(msg.ts)}</span>
            </div>
        </div>
    );
}

/* ── Participant pill ─────────────────────────────────────────── */
function ParticipantPill({ name, speaking }) {
    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold
                     transition-all duration-300 border-2 flex-shrink-0
                     ${speaking
                ? 'bg-mint-100 text-mint-500 border-mint-300'
                : 'bg-cream-100 text-ink-500 border-cream-200'
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${speaking ? 'bg-mint-400 animate-pulse' : 'bg-cream-400'}`} />
            {name}
        </div>
    );
}

/**
 * GDRoom
 * Props:
 *   roomId    – string
 *   roomName  – string
 *   topic     – string
 *   onLeave   – called when user leaves
 */
export default function GDRoom({ roomId, roomName, topic, onLeave }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [inputText, setInputText] = useState('');
    const [connStatus, setConnStatus] = useState('connecting');
    const messagesEndRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

    useEffect(() => {
        if (!roomId) return;
        wsService.connect(roomId);

        const unsubs = [
            wsService.on('connected', () => {
                setConnStatus('open');
                addSystemMessage('You connected to the room.');
                wsService.send('JOIN', { username: user?.name || 'Anonymous' });
            }),
            wsService.on('disconnected', () => {
                setConnStatus('closed');
                addSystemMessage('Disconnected from room.');
            }),
            wsService.on('reconnecting', ({ attempt }) => {
                setConnStatus('reconnecting');
                addSystemMessage(`Reconnecting… (attempt ${attempt})`);
            }),
            wsService.on('USER_JOINED', ({ payload }) => {
                if (payload?.username !== user?.name) {
                    addSystemMessage(`${payload?.username || 'Someone'} joined the room.`);
                }
                setParticipants(prev => {
                    if (prev.find(p => p.name === payload?.username)) return prev;
                    return [...prev, { name: payload?.username, speaking: false }];
                });
            }),
            wsService.on('USER_LEFT', ({ payload }) => {
                addSystemMessage(`${payload?.username || 'Someone'} left the room.`);
                setParticipants(prev => prev.filter(p => p.name !== payload?.username));
            }),
            wsService.on('CHAT_MESSAGE', ({ payload }) => {
                setMessages(prev => [...prev, {
                    id: Date.now() + Math.random(),
                    sender: payload?.username || 'Unknown',
                    text: payload?.message || '',
                    ts: payload?.ts || Date.now(),
                    type: 'chat',
                }]);
            }),
            wsService.on('PARTICIPANTS_LIST', ({ payload }) => {
                setParticipants(payload?.participants || []);
            }),
        ];

        return () => {
            unsubs.forEach(fn => fn());
            wsService.disconnect();
        };
    }, [roomId, user?.name]);

    function addSystemMessage(text) {
        setMessages(prev => [...prev, {
            id: Date.now() + Math.random(), sender: 'System', text, ts: Date.now(), type: 'system',
        }]);
    }

    const sendMessage = (e) => {
        e.preventDefault();
        const text = inputText.trim();
        if (!text) return;
        wsService.send('CHAT_MESSAGE', { message: text, username: user?.name || 'Me' });
        setMessages(prev => [...prev, {
            id: Date.now(), sender: user?.name || 'Me', text, ts: Date.now(), type: 'chat',
        }]);
        setInputText('');
    };

    const handleLeave = () => {
        wsService.send('LEAVE', { username: user?.name });
        wsService.disconnect();
        onLeave?.();
    };

    const statusBadge = {
        open:         'badge-mint',
        connecting:   'badge-orange',
        reconnecting: 'badge-orange',
        closed:       'bg-red-50 text-red-500 border border-red-200',
    };

    return (
        <div className="card flex flex-col h-[600px] animate-fade-in p-0 overflow-hidden">
            {/* Room Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b-2 border-cream-200 flex-shrink-0">
                <div>
                    <h3 className="section-title text-base">{roomName || 'GD Room'}</h3>
                    <p className="section-sub">💬 {topic || 'Open Discussion'}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`badge ${statusBadge[connStatus]}`}>
                        {connStatus === 'open' && <span className="w-1.5 h-1.5 rounded-full bg-mint-400 animate-pulse mr-1 inline-block" />}
                        {connStatus.charAt(0).toUpperCase() + connStatus.slice(1)}
                    </span>
                    <button onClick={handleLeave} className="btn-danger text-xs px-3 py-1.5">
                        Leave
                    </button>
                </div>
            </div>

            {/* Participants strip */}
            {participants.length > 0 && (
                <div className="flex items-center gap-2 px-5 py-2.5 border-b-2 border-cream-200
                        overflow-x-auto flex-shrink-0 bg-cream-50">
                    {participants.map(p => (
                        <ParticipantPill key={p.name} name={p.name} speaking={p.speaking} />
                    ))}
                </div>
            )}

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-cream-50">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="text-4xl mb-3">💬</div>
                        <p className="text-ink-400 text-sm font-medium">No messages yet.</p>
                        <p className="text-ink-300 text-xs mt-1">Start the discussion!</p>
                    </div>
                )}
                {messages.map(msg => (
                    <MessageBubble
                        key={msg.id}
                        msg={msg}
                        isOwn={msg.sender === user?.name}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <form
                onSubmit={sendMessage}
                className="flex items-center gap-2 px-4 py-3 border-t-2 border-cream-200 flex-shrink-0 bg-white"
            >
                <input
                    className="input-field flex-1 py-2.5"
                    placeholder="Type your message…"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    disabled={connStatus !== 'open'}
                />
                <button
                    type="submit"
                    disabled={!inputText.trim() || connStatus !== 'open'}
                    className="btn-primary px-4 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </form>
        </div>
    );
}
