import * as THREE from 'three'
import { create } from "zustand";
import { getMeshDimensions } from 'Scene/utils/getMeshDimensions';

export interface CharStatsStoreInterface {
    // Backpack slots
    width: number
    height: number

    // Open/close functionality
    isOpened: boolean
    open: () => void
    close: () => void
    toggle: () => void
}

export const useCharStats = create<CharStatsStoreInterface>((set, get) => ({
    width: 100,
    height: 300,
    isOpened: false,
    open: () => set({ isOpened: true }),
    close: () => set({ isOpened: false }),
    toggle: () => set(state => ({ isOpened: !state.isOpened })),
}))