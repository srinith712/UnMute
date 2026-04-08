import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import GDRoom from '../components/GDRoom';
import { gdAPI } from '../services/api';

/* ── Room Card ───────────────────────── */
function RoomCard({ room, onJoin }) {
    const isFull = room.participants >= room.maxParticipants;

    return (
        <div className="border rounded p-4 space-y-2">
            <h4 className="font-semibold">{room.name}</h4>

            <p className="text-sm text-gray-500">
                {room.topic}
            </p>

            <p className="text-xs text-gray-400">
                {room.participants}/{room.maxParticipants} • {room.duration} min
            </p>

            <button
                onClick={() => onJoin(room)}
                disabled={isFull}
                className={`w-full mt-2 p-2 rounded text-white
          ${isFull ? 'bg-gray-400' : 'bg-blue-500'}
        `}
            >
                {isFull ? 'Room Full' : 'Join'}
            </button>
        </div>
    );
}

/* ── Create Room Modal ───────────────────────── */
function CreateRoomModal({ onClose, onCreate }) {
    const [name, setName] = useState('');
    const [topic, setTopic] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !topic) return;

        onCreate(name, topic);
        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30">
            <div className="bg-white p-4 rounded w-80">

                <h3 className="font-semibold mb-3">Create Room</h3>

                <form onSubmit={handleSubmit} className="space-y-3">

                    <input
                        placeholder="Room name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full border p-2 rounded"
                    />

                    <input
                        placeholder="Topic"
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        className="w-full border p-2 rounded"
                    />

                    <div className="flex gap-2">
                        <button type="button" onClick={onClose} className="flex-1 border p-2 rounded">
                            Cancel
                        </button>

                        <button type="submit" className="flex-1 bg-blue-500 text-white rounded">
                            Create
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

/* ── Demo Rooms ───────────────────────── */
const DEMO_ROOMS = [
    { id: '1', name: 'AI Discussion', topic: 'AI future', participants: 3, maxParticipants: 8, duration: 30 },
    { id: '2', name: 'Placement Prep', topic: 'Interview tips', participants: 5, maxParticipants: 8, duration: 45 },
];

/* ── Main Page ───────────────────────── */
export default function GroupDiscussion() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [activeRoom, setActiveRoom] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [loading, setLoading] = useState(true);

    /* ── Fetch Rooms ───────────────────────── */
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await gdAPI.getRooms();
                setRooms(res.data?.rooms || DEMO_ROOMS);
            } catch (err) {
                console.error("Rooms error:", err);
                setRooms(DEMO_ROOMS);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    /* ── Join Room ───────────────────────── */
    const handleJoin = async (room) => {
        try {
            await gdAPI.joinRoom(room.id);
        } catch (err) {
            console.error("Join error:", err);
        }

        setActiveRoom(room);
    };

    /* ── Leave Room ───────────────────────── */
    const handleLeave = () => {
        setActiveRoom(null);
    };

    /* ── Create Room ───────────────────────── */
    const handleCreate = async (name, topic) => {
        const newRoom = {
            id: Date.now().toString(),
            name,
            topic,
            participants: 1,
            maxParticipants: 8,
            duration: 30,
        };

        setRooms(prev => [newRoom, ...prev]);
        setActiveRoom(newRoom);
    };

    return (
        <div className="flex">

            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1">

                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <main className="p-4 space-y-4">

                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Group Discussion</h2>

                        {!activeRoom && (
                            <button
                                onClick={() => setShowCreate(true)}
                                className="bg-blue-500 text-white px-3 py-1 rounded"
                            >
                                New Room
                            </button>
                        )}
                    </div>

                    {/* Active Room */}
                    {activeRoom ? (
                        <>
                            <button onClick={handleLeave} className="text-sm text-blue-500">
                                ← Back
                            </button>

                            <GDRoom
                                roomId={activeRoom.id}
                                roomName={activeRoom.name}
                                topic={activeRoom.topic}
                                onLeave={handleLeave}
                            />
                        </>
                    ) : (
                        <>
                            {/* Rooms */}
                            {loading ? (
                                <p>Loading rooms...</p>
                            ) : (
                                <div className="grid gap-3">
                                    {rooms.map(room => (
                                        <RoomCard
                                            key={room.id}
                                            room={room}
                                            onJoin={handleJoin}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                </main>
            </div>

            {/* Modal */}
            {showCreate && (
                <CreateRoomModal
                    onClose={() => setShowCreate(false)}
                    onCreate={handleCreate}
                />
            )}

        </div>
    );
}