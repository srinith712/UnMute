import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirm: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const validate = () => {
        if (!form.name) return 'Enter name';
        if (!form.email) return 'Enter email';
        if (form.password.length < 6) return 'Password must be 6+ chars';
        if (form.password !== form.confirm) return 'Passwords not match';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const err = validate();
        if (err) {
            setError(err);
            return;
        }

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

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">

            <div className="bg-white p-6 rounded shadow w-full max-w-sm">

                <h2 className="text-xl font-semibold text-center mb-4">
                    Create Account
                </h2>

                {error && (
                    <p className="text-red-500 text-sm mb-3 text-center">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">

                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />

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

                    <input
                        type="password"
                        name="confirm"
                        placeholder="Confirm Password"
                        value={form.confirm}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 text-white p-2 rounded"
                    >
                        {loading ? 'Creating...' : 'Register'}
                    </button>

                </form>

                <p className="text-sm text-center mt-3">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-500">
                        Login
                    </Link>
                </p>

            </div>
        </div>
    );
}