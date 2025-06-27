import { useSocketStore } from "../../stores/socketStore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Message from '../../types/message';
import User from '../../types/user';


interface Props {
    user: User | null;
}



export default function Chat({ user }: Props) {
    const { id: channelId } = useParams<{ id: string }>();
    const socket = useSocketStore((state) => state.socket);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");

    useEffect(() => { // getting messages from the backend and listening for new messages
        if (!socket || !channelId) return;

        const fetchMessages = async () => {
            const res = await axios.get(`/api/channels/${channelId}/messages`);
            setMessages(res.data);
        };
        fetchMessages(); // Fetch initial messages when component mounts


        socket.emit('join', channelId);
        const handleMessage = (message: Message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        };


        socket.on('message', handleMessage); // Listen for new messages

        return () => {
            socket.off('message', handleMessage); // Clean up the event listener
        };
    }, [socket, channelId]);

    const sendMessage = () => {
        if (!input.trim() || !channelId || !user || !socket) return; // Ensure input and channelId are available

        socket.emit('message', {
            channelId,
            content: input,
            userId: user.id
        });

        setInput(''); // Clear the input after sending
    };

    return (
        <div>
            <div>
                {messages.map((msg, i) => (
                    <div key={i}>
                        <strong>{msg.user.username}: </strong>{msg.content}
                    </div>
                ))}
            </div>
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
};
