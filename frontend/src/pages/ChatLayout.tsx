import { useEffect, useState } from 'react';
import Channel from '../types/channel'; // your existing Channel.ts
import Chat from './Chat'; // your existing Chat.tsx
import axios from 'axios';


export default function ChatLayout() {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const res = await axios.get('/api/channels', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setChannels(res.data);
                setSelectedChannel(res.data[0] || null);
            } catch (err) {
                console.error('Failed to fetch channels', err);
            }
        };

        fetchChannels();
    }, []);

    return (
        <div className="flex h-full">
            <aside className="w-64 bg-gray-900 text-white p-4">
                <h2 className="text-lg font-bold mb-2">Channels</h2>
                <ul>
                    {channels.map((channel) => (
                        <li
                            key={channel.id}
                            onClick={() => setSelectedChannel(channel)}
                            className={`cursor-pointer p-2 rounded ${
                                selectedChannel?.id === channel.id ? 'bg-gray-700' : ''
                            }`}
                        >
                            #{channel.name}
                        </li>
                    ))}
                </ul>
            </aside>

            <main className="flex-1">
                {selectedChannel ? (
                    <Chat channelId={selectedChannel.id} />
                ) : (
                    <p className="text-white p-4">No channel selected</p>
                )}
            </main>
        </div>
    );
}
