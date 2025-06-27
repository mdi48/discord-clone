import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Message  from "../types/message";

const socket = io("http://localhost:3808"); // Adjust the URL as needed


export default function Server() {
    const { channelId } = useParams();
    const [messages, setMessages] = useState<Message[]>([]);
    const messageInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (channelId) {
            socket.emit('join', channelId);
            socket.on('message', (msg) => {
                setMessages((prevMessages) => [...prevMessages, msg]);
            });

            return () => {
                socket.off('message'); // Clean up the event listener
            };
        }
    }, [channelId]);

    const sendMessage = () => {
        const content = messageInput.current?.value.trim();
        const userId = localStorage.getItem('userId'); // could also be from auth store
        if (channelId && content && userId) {
            socket.emit('message', { channelId, content, userId });
            messageInput.current!.value = ''; // Clear the input after sending
        }
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
                    {messages.map((msg, i) => (
                        <div className="mb-2" key={i}>
                            <strong>{msg.user.id}:</strong> {msg.content}
                        </div>
                    ))}
                    <div className="mb-2">
                        <strong>User2:</strong> This is a test message.
                    </div>
                </div>
                <form className="mt-4 flex gap-2">
                    <input ref={messageInput} type="text" placeholder="Type a message..." className="flex-1 border p-2 rounded" />
                    <button type="submit" onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded">Send</button>
                </form>
            </main>
        </div>
    );
}
