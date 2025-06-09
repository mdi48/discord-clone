import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

type SocketStore = {
    socket: Socket | null;
    connect: () => void;
};

export const useSocketStore = create<SocketStore>((set) => ({
    socket: null,
    connect: () => {
        const socket = io('http://localhost:3808'); // Adjust the URL as needed
        set({ socket });
    },
}));
