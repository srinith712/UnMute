import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import wsService from '../services/websocket';

/* ── Time formatter ───────────────────────────────────────── */
function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/* ── Message Bubble ───────────────────────────────────────── */
function MessageBubble({ msg, isOwn }) {
    return (
        <div className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>

            {!isOwn && (
                <div className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">
                    {msg.sender?.[0]?.toUpperCase() || '?'}
                </div>
            )}

            <div className="max-w-xs flex flex-col">
                {!isOwn && (
                    <span className="text-xs text-gray-400">{msg.sender}</span>
                )}

                <div className={`px-3 py-2 rounded-lg text-sm
          ${isOwn
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                    {msg.type === 'system'
                        ? <span className="italic text-xs">{msg.text}</span>
                        : msg.text}
                </div>

                <span className="text-[10px] text-gray-400">
                    {formatTime(msg.ts)}
                </span>
            </div>
        </div>
    );
}

/* ── Participant Pill ───────────────────────────────────────── */
function ParticipantPill({ name }) {
    return (
        <div className="px-3 py-1 rounded-full text-xs bg-gray-100 border">
            {name}
        </div>
    );
}

/* ── Main Component ───────────────────────────────────────── */
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

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    /* ── WebSocket Setup ───────────────────────────────────────── */
    useEffect(() => {
        if (!roomId) return;

        wsService.connect(roomId);

        const unsubs = [
            wsService.on('connected', () => {
                setConnStatus('open');
                addSystemMessage('Connected to the room');
                wsService.send('JOIN', { username: user?.name || 'Guest' });
            }),

            wsService.on('disconnected', () => {
                setConnStatus('closed');
                addSystemMessage('Disconnected');
            }),

            wsService.on('reconnecting', () => {
                setConnStatus('reconnecting');
                addSystemMessage('Reconnecting...');
            }),

            wsService.on('USER_JOINED', ({ payload }) => {
                const name = payload?.username || 'User';

                if (name !== user?.name) {
                    addSystemMessage(`${name} joined`);
                }

                setParticipants(prev => {
                    if (prev.find(p => p.name === name)) return prev;
                    return [...prev, { name }];
                });
            }),

            wsService.on('USER_LEFT', ({ payload }) => {
                const name = payload?.username || 'User';
                addSystemMessage(`${name} left`);
                setParticipants(prev => prev.filter(p => p.name !== name));
            }),

            wsService.on('CHAT_MESSAGE', ({ payload }) => {
                setMessages(prev => [...prev, {
                    id: Date.now() + Math.random(),
                    sender: payload?.username || 'User',
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
            unsubs.forEach(fn => fn && fn());
            wsService.disconnect();
        };

    }, [roomId, user?.name]);

    /* ── Helpers ───────────────────────────────────────── */
    function addSystemMessage(text) {
        setMessages(prev => [...prev, {
            id: Date.now() + Math.random(),
            sender: 'System',
            text,
            ts: Date.now(),
            type: 'system',
        }]);
    }

    /* ── Send Message ───────────────────────────────────────── */
    const sendMessage = (e) => {
        e.preventDefault();

        const text = inputText.trim();
        if (!text) return;

        wsService.send('CHAT_MESSAGE', {
            message: text,
            username: user?.name || 'Me'
        });

        setMessages(prev => [...prev, {
            id: Date.now(),
            sender: user?.name || 'Me',
            text,
            ts: Date.now(),
            type: 'chat',
        }]);

        setInputText('');
    };

    /* ── Leave Room ───────────────────────────────────────── */
    const handleLeave = () => {
        wsService.send('LEAVE', { username: user?.name });
        wsService.disconnect();
        if (onLeave) onLeave();
    };

    /* ── UI ───────────────────────────────────────── */
    return (
        <div className="border rounded-lg flex flex-col h-[600px]">

            {/* Header */}
            <div className="flex justify-between p-3 border-b">
                <div>
                    <h3 className="font-semibold">{roomName || 'Discussion Room'}</h3>
                    <p className="text-xs text-gray-500">{topic || 'Open topic'}</p>
                </div>

                <button onClick={handleLeave} className="text-red-500 text-sm">
                    Leave
                </button>
            </div>

            {/* Participants */}
            {participants.length > 0 && (
                <div className="flex gap-2 p-2 border-b overflow-x-auto">
                    {participants.map(p => (
                        <ParticipantPill key={p.name} name={p.name} />
                    ))}
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.length === 0 && (
                    <p className="text-center text-gray-400 text-sm">
                        No messages yet. Start chatting!
                    </p>
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

            {/* Input */}
            <form onSubmit={sendMessage} className="flex gap-2 p-2 border-t">
                <input
                    className="flex-1 border rounded px-2 py-1"
                    placeholder="Type message..."
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    disabled={connStatus !== 'open'}
                />

                <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="bg-orange-500 text-white px-3 rounded"
                >
                    Send
                </button>
            </form>
        </div>
    );
}