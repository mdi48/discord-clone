// TO-DO: Create basic forms for this and Register.tsx
// This is a placeholder for the login page
// These forms will be connected to the backend for authentication
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';



export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (res.ok) {
            login(data.token, data.user); // Assuming the backend returns a token and user object
            navigate('/chat'); // Use /chat as the home page
        } else {
            alert(data.error); // Show error message from backend
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-3xl font-bold mb-4">Login</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required className="mb-4 p-2 border rounded w-full" />
                <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="mb-4 p-2 border rounded w-full" />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Login</button>
            </form>
            <p className="mt-4">
                Don't have an account? <Link to="/register" className="text-blue-500 hover:underline">Register</Link>
            </p>
        </div>
    );
}
