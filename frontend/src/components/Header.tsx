import { useAuthStore } from "../stores/useAuthStore";

export default function Header() {
    const { user, logout } = useAuthStore();

    return (
        <header className="p-4 bg-gray-900 text-white flex justify-between items-center">
            <h1 className="text-xl font-bold">Neocord</h1>
            {user ? (
                <div className="flex items-center gap-4">
                    <span>Welcome, {user.username}</span>
                    <button onClick={logout} className="bg-red-500 px-3 py-1 rounded">
                        Logout
                    </button>
                </div>
            ): (
                <span>Please log in.</span>
            )}
        </header>
    )
}
