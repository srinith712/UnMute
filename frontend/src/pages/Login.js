import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) {
            setError('Please enter your email and password.');
            return;
        }
        setLoading(true);
        setError('');
        const res = await login(form.email, form.password);
        setLoading(false);
        if (res.success) {
            navigate('/dashboard');
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
             style={{ background: 'linear-gradient(160deg, #FFF8E7 0%, #FFE5DC 50%, #EDE0F5 100%)' }}>

            {/* Decorative blobs */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-peach-200/60 blur-[80px]" />
                <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-lavender-200/60 blur-[80px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-sky-200/40 blur-[100px]" />
            </div>

            <div className="w-full max-w-md relative z-10 animate-slide-up">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-orange-500 to-peach-300
                          flex items-center justify-center shadow-orange mb-4 animate-float">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                        </svg>
                    </div>
                    <h1 className="font-extrabold text-3xl text-ink-900 tracking-tight">UnMute</h1>
                    <p className="text-ink-400 text-sm mt-1 font-medium">Turn Your Voice On 🎤</p>
                </div>

                {/* Card */}
                <div className="card p-8">
                    <h2 className="page-title text-xl mb-1">Welcome back 👋</h2>
                    <p className="text-ink-400 text-sm mb-6">Sign in to continue practicing</p>

                    {error && (
                        <div className="mb-4 px-4 py-3 rounded-2xl bg-red-50 border-2 border-red-200">
                            <p className="text-red-500 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="label-text">Email address</label>
                            <input
                                id="email" name="email" type="email" autoComplete="email"
                                className="input-field"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="label-text">Password</label>
                            <input
                                id="password" name="password" type="password" autoComplete="current-password"
                                className="input-field"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2
                   disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 rounded-full border-2 border-white/50 border-t-white animate-spin" />
                                    Signing in…
                                </span>
                            ) : '🚀 Sign In'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-5">
                        <span className="flex-1 h-px bg-cream-300" />
                        <span className="text-ink-300 text-xs font-medium">or</span>
                        <span className="flex-1 h-px bg-cream-300" />
                    </div>

                    {/* Demo credentials */}
                    <div className="p-3 rounded-2xl bg-purple-50 border-2 border-purple-100 mb-4">
                        <p className="text-purple-600 text-xs font-bold mb-1">🧪 Demo Credentials</p>
                        <p className="text-ink-500 text-xs">Email: <span className="font-bold text-ink-800">demo@unmute.app</span></p>
                        <p className="text-ink-500 text-xs">Password: <span className="font-bold text-ink-800">Demo@1234</span></p>
                    </div>

                    <p className="text-center text-sm text-ink-400">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-purple-500 hover:text-purple-600 font-bold transition-colors">
                            Sign up free →
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}