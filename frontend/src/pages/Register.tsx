import React, { useState, FormEvent, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register: React.FC = () => {
    const authContext = useContext(AuthContext);
    const navigate = useNavigate();

    if (!authContext) {
        throw new Error('Register must be used within an AuthProvider');
    }

    const { login } = authContext;

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                const { error } = await res.json();
                setError(error || 'Registration failed');
                return;
            }

            const data = await res.json();
            login(data.token, data.user); // Assuming the backend returns a token and user object
            navigate('/chat'); // Using chat as home page for now
        } catch (err) {
            console.error('Registration error:', err);
            setError('An error occurred during registration');
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Register</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    className="w-full border px-3 py-2 rounded"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder='Username'
                    required
                />
                <input
                    className='w-full border px-3 py-2 rounded'
                    type='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='Password'
                    required
                />
                <button
                    className='w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600'
                    type='submit'
                >
                    Register
                </button>
            </form>
        </div>
    );
};

export default Register;
