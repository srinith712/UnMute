import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.email || !form.password) {
            setError('Please fill all fields');
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
        <div className="min-h-screen flex items-center justify-center bg-gray-100">

            <div className="bg-white p-6 rounded shadow w-full max-w-sm">

                {/* Title */}
                <h2 className="text-xl font-semibold text-center mb-4">
                    Login to UnMute
                </h2>

                {/* Error */}
                {error && (
                    <p className="text-red-500 text-sm mb-3 text-center">
                        {error}
                    </p>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3">

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 text-white p-2 rounded"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                </form>

                {/* Demo */}
                <div className="mt-4 text-xs text-gray-500 text-center">
                    Demo: demo@unmute.app / Demo@1234
                </div>

                {/* Register */}
                <p className="text-sm text-center mt-3">
                    Don’t have an account?{' '}
                    <Link to="/register" className="text-blue-500">
                        Register
                    </Link>
                </p>

            </div>
        </div>
    );
}