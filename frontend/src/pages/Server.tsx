import { useParams } from "react-router-dom";

export default function Server() {
    const { id, channelId } = useParams();

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
                    {/* Chat messages will go here */}
                    <div className="mb-2">
                        <strong>User1:</strong> Hello, world!
                    </div>
                    <div className="mb-2">
                        <strong>User2:</strong> This is a test message.
                    </div>
                </div>
                <form className="mt-4 flex gap-2">
                    <input type="text" placeholder="Type a message..." className="flex-1 border p-2 rounded" />
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Send</button>
                </form>
            </main>
        </div>
    );
}
