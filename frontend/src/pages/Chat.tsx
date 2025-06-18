import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { Message } from '../types/message';


const socket = io('http://localhost:3808'); // Adjust the URL as needed

export default function Chat() {
    const { user, token } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [content, setContent] = useState('');
    const channelId = '1'; // Replace with dynamic channel ID as needed



    useEffect(() => {
        socket.emit('join', channelId);

        fetch(`/api/channels/${channelId}/messages`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => res.json())
        .then(setMessages);

        const handleMessage = (msg: Message) => setMessages((prev) => [...prev, msg]);
        socket.on('message', handleMessage);

        return () => {
            socket.off('message', handleMessage); // Clean up the event listener
        }
    }, [token, channelId]);

    if (!user) {
        return <div className="flex items-center justify-center h-screen">Please log in to access the chat.</div>;
    }

    const sendMessage = () => {
        socket.emit('message', {
            channelId,
            content,
            userId: user.id,
        });
        setContent(''); // Clear input after sending
    };

    return (
        <div className="flex h-screen">
            {/* Server Sidebar */}
            <aside className="w-64 bg-gray-900 text-white p-4">
                <h3 className="font-bold mb-4">Channels</h3>
                <ul>
                    <li># General</li>
                    <li># Memes</li>
                </ul>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-4 bg-gray-100">
                <h2 className="text-xl font-bold mb-2">Channel: {channelId}</h2>
                <div className="h-[70vh] bg-white shadow-inner p-2 overflow-y-auto">
                    {messages.map((msg) => (
                        <div className="mb-2" key={msg.id}>
                            <strong>{msg.user.username}:</strong> {msg.content}
                        </div>
                    ))}
                </div>
                <form className="mt-4 flex gap-2">
                    <input value={content} onChange={(e) => setContent(e.target.value)} placeholder="Type a message..." className="flex-1 border p-2 rounded" />
                    <button type="submit" onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded">Send</button>
                </form>
            </main>
        </div>
    )
}
