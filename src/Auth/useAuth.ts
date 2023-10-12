import { create } from "zustand";

export interface AuthInterface {
    opened: boolean
    show: () => void
    hide: () => void
}

export const useAuth = create<AuthInterface>((set, get) => ({
    opened: true,
    show: () => set({ opened: true }),
    hide: () => set({ opened: false }),
}))