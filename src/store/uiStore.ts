import { create } from "zustand";


export interface UiStoreInterface {
    isBackpackOpened: boolean
    openBackpack: () => void
    closeBackpack: () => void
    toggleBackpack: () => void
}

export const useUiStore = create<UiStoreInterface>((set, get) => ({
    // Backpack
    isBackpackOpened: false,
    openBackpack: () => set({ isBackpackOpened: true }),
    closeBackpack: () => set({ isBackpackOpened: false }),
    toggleBackpack: () => set(state => ({ isBackpackOpened: !state.isBackpackOpened })),
}))