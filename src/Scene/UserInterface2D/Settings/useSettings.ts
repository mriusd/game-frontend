import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

export interface UseSettings {
    opened: boolean
    hide: () => void
    show: () => void

    // FPS
    maxFps: number,
    minFps: number,
    stepFps: number,
    clipFps: number,
    updateClipFps: (value: number) => void
}

export const useSettings = createWithEqualityFn<UseSettings>((set, get) => ({
    opened: false,
    hide: () => { set({ opened: false })},
    show: () => set({ opened: true }),

    // FPS
    maxFps: 240,
    minFps: 30,
    stepFps: 5,
    clipFps: 240, // Initial Value
    updateClipFps: (value: number) => set({ clipFps: value })
}), shallow)