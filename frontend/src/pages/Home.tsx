import { useAuth } from  '../context/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const { user }  = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if(user) {
            navigate('/chat');
        } else {
            navigate('/login');
        }
    }, [user, navigate]);

    return null; // No UI needed, just redirecting
}
