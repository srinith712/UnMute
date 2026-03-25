import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import GDRoom from '../components/GDRoom';
import { gdAPI } from '../services/api';

/* ── Room card ─────────────────────────────────────────────── */
function RoomCard({ room, onJoin }) {
    const isFull = room.participants >= room.maxParticipants;
    return (
        <div className="card hover:shadow-md transition p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h4 className="text-gray-800 font-semibold text-sm">{room.name}</h4>
                    <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{room.topic}</p>
                </div>
                <span className={`badge flex-shrink-0 ${isFull
                        ? 'bg-red-50 text-red-500 border border-red-200'
                        : 'badge-mint'
                    }`}>
                    {room.participants}/{room.maxParticipants}
                </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-ink-400">
                <span>👥 {room.participants} online</span>
                <span>·</span>
                <span>⏱ {room.duration || 30} min</span>
                <span>·</span>
                <span className="capitalize">{room.level || 'All levels'}</span>
            </div>

            <button
                onClick={() => onJoin(room)}
                disabled={isFull}
                className="btn-primary w-full text-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {isFull ? '🔒 Room Full' : 'Join Room →'}
            </button>
        </div>
    );
}

/* ── Create room modal ─────────────────────────────────────── */
function CreateRoomModal({ onClose, onCreate }) {
    const [form, setForm] = useState({ name: '', topic: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.topic) return;
        setLoading(true);
        await onCreate(form.name, form.topic);
        setLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-sm">
            <div className="card w-full max-w-sm p-6 animate-slide-up">
                <h3 className="section-title mb-4">✨ Create a Room</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label-text">Room Name</label>
                        <input
                            className="input-field" placeholder="e.g. Tech Trends Discussion"
                            value={form.name}
                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                            required
                        />
                    </div>
                    <div>
                        <label className="label-text">Discussion Topic</label>
                        <input
                            className="input-field" placeholder="e.g. AI impact on jobs in 2025"
                            value={form.topic}
                            onChange={e => setForm(p => ({ ...p, topic: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary flex-1">
                            {loading ? 'Creating…' : '🚀 Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const DEMO_ROOMS = [
    { id: 'room-1', name: 'AI & Future of Work',     topic: 'Discuss how AI is reshaping industries and career paths.',                      participants: 4, maxParticipants: 8, duration: 30, level: 'All levels' },
    { id: 'room-2', name: 'Campus Placement Prep',   topic: 'Share tips and experiences from campus recruitment drives.',                     participants: 6, maxParticipants: 8, duration: 45, level: 'Beginners'  },
    { id: 'room-3', name: 'Climate Change Debate',   topic: 'Should developing nations prioritize economic growth over climate action?',       participants: 3, maxParticipants: 6, duration: 20, level: 'Advanced'   },
    { id: 'room-4', name: 'Startup Culture',         topic: 'Is startup culture overrated? Pros and cons of working in startups.',            participants: 8, maxParticipants: 8, duration: 30, level: 'All levels' },
];

export default function GroupDiscussion() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeRoom, setActiveRoom] = useState(null);
    const [showCreate, setShowCreate] = useState(false);

    useEffect(() => {
        gdAPI.getRooms()
            .then(res => setRooms(res.data?.rooms || DEMO_ROOMS))
            .catch(() => setRooms(DEMO_ROOMS))
            .finally(() => setLoading(false));
    }, []);

    const handleJoin = async (room) => {
        try { await gdAPI.joinRoom(room.id); } catch { /* join anyway for demo */ }
        setActiveRoom(room);
    };

    const handleLeave = () => {
        setActiveRoom(null);
        gdAPI.getRooms()
            .then(res => setRooms(res.data?.rooms || DEMO_ROOMS))
            .catch(() => { });
    };

    const handleCreate = async (name, topic) => {
        try {
            const res = await gdAPI.createRoom(name, topic);
            const newRoom = res.data?.room || { id: `room-${Date.now()}`, name, topic, participants: 1, maxParticipants: 8, duration: 30 };
            setRooms(p => [newRoom, ...p]);
            setActiveRoom(newRoom);
        } catch {
            const newRoom = { id: `room-${Date.now()}`, name, topic, participants: 1, maxParticipants: 8, duration: 30 };
            setRooms(p => [newRoom, ...p]);
            setActiveRoom(newRoom);
        }
    };

    return (
        <div className="layout-root">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="layout-main">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <main className="layout-content">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <h2 className="page-title">💬 Group Discussion</h2>
                            <p className="page-subtitle mt-1">Join live rooms and practice structured debate.</p>
                        </div>
                        {!activeRoom && (
                            <button onClick={() => setShowCreate(true)} className="btn-primary">
                                + New Room
                            </button>
                        )}
                    </div>

                    {activeRoom ? (
                        /* Active room view */
                        <div className="animate-fade-in">
                            <div className="flex items-center gap-2 mb-4">
                                <button onClick={handleLeave} className="text-ink-400 hover:text-ink-900 text-sm flex items-center gap-1 transition-colors font-medium">
                                    ← Back to Rooms
                                </button>
                            </div>
                            <GDRoom
                                roomId={activeRoom.id}
                                roomName={activeRoom.name}
                                topic={activeRoom.topic}
                                onLeave={handleLeave}
                            />
                        </div>
                    ) : (
                        <>
                            {/* How it works */}
                            <div className="card p-5">
                                <h3 className="section-title mb-4">📋 How it works</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {[
                                        { step: '01', emoji: '🚪', title: 'Join or create a room',  desc: 'Pick a topic that interests you or start your own.' },
                                        { step: '02', emoji: '💬', title: 'Discuss in real-time',   desc: 'Chat with other participants via WebSocket messaging.' },
                                        { step: '03', emoji: '🤖', title: 'Get evaluated',           desc: 'AI analyses your communication and gives feedback.' },
                                    ].map(s => (
                                        <div key={s.step} className="flex gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                            <span className="text-purple-500 font-bold text-base flex-shrink-0">{s.step}</span>
                                            <div>
                                                <p className="text-gray-700 text-xs font-semibold">{s.emoji} {s.title}</p>
                                                <p className="text-gray-500 text-xs mt-0.5">{s.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Rooms grid */}
                            {loading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="card h-48 animate-pulse bg-cream-100" />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {rooms.map(room => (
                                        <RoomCard key={room.id} room={room} onJoin={handleJoin} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            {showCreate && (
                <CreateRoomModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
            )}
        </div>
    );
}
