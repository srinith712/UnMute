import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const validate = () => {
        if (!form.name.trim()) return 'Please enter your full name.';
        if (!form.email) return 'Please enter a valid email address.';
        if (form.password.length < 6) return 'Password must be at least 6 characters.';
        if (form.password !== form.confirm) return 'Passwords do not match.';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validate();
        if (validationError) { setError(validationError); return; }

        setLoading(true);
        setError('');
        const res = await register(form.name, form.email, form.password);
        setLoading(false);
        if (res.success) {
            navigate('/dashboard');
        } else {
            setError(res.message);
        }
    };

    /* Password strength */
    const strength = form.password.length === 0 ? 0
        : form.password.length < 6 ? 1
            : form.password.length < 10 ? 2
                : 3;
    const strengthLabels = ['', 'Weak 😬', 'Good 👍', 'Strong 💪'];
    const strengthColors = ['', '#FF8070', '#FF8C42', '#7DC090'];

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
             style={{ background: 'linear-gradient(160deg, #FFF8E7 0%, #EDE0F5 50%, #D6ECFF 100%)' }}>

            {/* Decorative blobs */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-lavender-200/60 blur-[80px]" />
                <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-sky-200/60 blur-[80px]" />
            </div>

            <div className="w-full max-w-md relative z-10 animate-slide-up">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-500 to-lavender-300
                          flex items-center justify-center shadow-purple mb-4 animate-float">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                        </svg>
                    </div>
                    <h1 className="font-extrabold text-3xl text-ink-900 tracking-tight">Join UnMute</h1>
                    <p className="text-ink-400 text-sm mt-1 font-medium">Start your communication journey ✨</p>
                </div>

                <div className="card p-8">
                    <h2 className="page-title text-xl mb-1">Create your account</h2>
                    <p className="text-ink-400 text-sm mb-6">Free forever • Takes less than a minute</p>

                    {error && (
                        <div className="mb-4 px-4 py-3 rounded-2xl bg-red-50 border-2 border-red-200">
                            <p className="text-red-500 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="label-text">Full Name</label>
                            <input
                                id="name" name="name" type="text" autoComplete="name"
                                className="input-field" placeholder="Alex Johnson"
                                value={form.name} onChange={handleChange} required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="label-text">Email Address</label>
                            <input
                                id="email" name="email" type="email" autoComplete="email"
                                className="input-field" placeholder="alex@example.com"
                                value={form.email} onChange={handleChange} required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="label-text">Password</label>
                            <input
                                id="password" name="password" type="password" autoComplete="new-password"
                                className="input-field" placeholder="Min. 6 characters"
                                value={form.password} onChange={handleChange} required
                            />
                            {form.password && (
                                <div className="mt-1.5 flex items-center gap-2">
                                    <div className="flex-1 h-1.5 rounded-full bg-cream-300 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-300"
                                            style={{ width: `${(strength / 3) * 100}%`, background: strengthColors[strength] }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-bold" style={{ color: strengthColors[strength] }}>
                                        {strengthLabels[strength]}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirm" className="label-text">Confirm Password</label>
                            <input
                                id="confirm" name="confirm" type="password" autoComplete="new-password"
                                className={`input-field ${form.confirm && form.confirm !== form.password
                                        ? 'border-red-400 focus:border-red-500'
                                        : ''
                                    }`}
                                placeholder="Re-enter password"
                                value={form.confirm} onChange={handleChange} required
                            />
                            {form.confirm && form.confirm !== form.password && (
                                <p className="text-red-500 text-xs mt-1">Passwords don't match</p>
                            )}
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2
                   disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 rounded-full border-2 border-white/50 border-t-white animate-spin" />
                                    Creating account…
                                </span>
                            ) : '🎉 Create Account →'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-ink-400 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-purple-500 hover:text-purple-600 font-bold transition-colors">
                            Sign in →
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
