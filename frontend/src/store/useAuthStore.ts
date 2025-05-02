import { create } from 'zustand';

interface AuthState {
    user: null | { id: string; username: string };
    login: (user: AuthState['user']) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    login: (user) => set({ user }),
    logout: () => set({ user: null }),
}));
