import { useEffect } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { useSocketStore } from "../stores/socketStore";
import { Link } from "react-router-dom";

export default function Home() {
    const user = useAuthStore((state) => state.user);

    const connect = useSocketStore((state) => state.connect);

    useEffect(() => {
        connect();
    }, [connect]);

    if (!user) {
        return <div>Please log in.</div>;
    }


    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold">Welcome, {user.username}</h2>
            <p className="mt-2">Your servers:</p>
            <ul className="mt-2">
                <li>
                    <Link to="servers/1/channels/1" className="text=blue-500 hover:underline">
                        Example Server
                    {/* Dynamically fetch list of servers from the backend and display them later */}
                    </Link>
                </li>
            </ul>
        </div>
    );
}
