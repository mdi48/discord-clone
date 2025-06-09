import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket;

export const useSocket = () => {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        socket =  io('http:/localhost:3808'); // backend URL. Adjust as needed.
        socketRef.current = socket;

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    return socketRef.current;
};
