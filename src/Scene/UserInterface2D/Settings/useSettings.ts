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

    // DPR
    setDPR: (value: number) => void
    maxDPR: number,
    minDPR: number,
    stepDPR: number,
    clipDPR: number,

    // Shadows
    enableShadows: boolean
    updateShadows: (value: boolean) => void

    // Postprocessing
    enablePostprocessing: boolean
    updatePostprocessing: (value: boolean) => void

    // Hide small objects
    hideSmallObjects: boolean
    setHideSmallObjects: (value: boolean) => void
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
    updateClipFps: (value: number) => { 
        localStorage.setItem('settings_clipFps', value+'')
        set({ clipFps: value }) 
    },

    // DPR
    maxDPR: 2,
    minDPR: .1,
    stepDPR: .1,
    clipDPR: 2, // Initial Value
    setDPR: (value: number) => { 
        localStorage.setItem('settings_clipDPR', value+'')
        set({ clipDPR: value }) 
    },

    // Shadows
    enableShadows: true,
    updateShadows: (value: boolean) => { 
        localStorage.setItem('settings_enableShadows', value+'')
        set({ enableShadows: value }) 
    },

    // Postprocessing
    enablePostprocessing: false,
    updatePostprocessing: (value: boolean) => { 
        localStorage.setItem('settings_enablePostprocessing', value+'')
        set({ enablePostprocessing: value })
    },

    // Hide small objects
    hideSmallObjects: false,
    setHideSmallObjects: (value: boolean) => { 
        localStorage.setItem('settings_hideSmallObjects', value+'')
        set({ hideSmallObjects: value }) 
    },
}), shallow)