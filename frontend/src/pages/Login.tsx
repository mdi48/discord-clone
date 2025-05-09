// TO-DO: Create basic forms for this and Register.tsx
// This is a placeholder for the login page
// These forms will be connected to the backend for authentication

export default function Login() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-3xl font-bold mb-4">Login</h1>
            <form method="post" action="/login" className="bg-white p-6 rounded shadow-md w-96">
                <input type="text" placeholder="Username" required className="mb-4 p-2 border rounded w-full" />
                <input type="password" placeholder="Password" required className="mb-4 p-2 border rounded w-full" />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Login</button>
            </form>
        </div>
    )
}
