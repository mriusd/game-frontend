import * as THREE from 'three'
import { create } from "zustand";
import { getMeshDimensions } from 'Scene/utils/getMeshDimensions';

export interface BackpackStoreInterface {
    // Backpack settings
    width: number
    height: number
    cellSize: number

    // Open/close functionality
    isOpened: boolean
    open: () => void
    close: () => void
    toggle: () => void

    // Slots plane, where objects are placed
    slotsPlane: THREE.Mesh | null
    setSlotsPlane: (plane: THREE.Mesh) => void
    planeBoundingBox: { width: number; height: number; depth: number } | null
}

export const useBackpackStore = create<BackpackStoreInterface>((set, get) => ({
    width: 8,
    height: 8,
    cellSize: 1,
    isOpened: false,
    open: () => set({ isOpened: true }),
    close: () => set({ isOpened: false }),
    toggle: () => set(state => ({ isOpened: !state.isOpened })),
    slotsPlane: null,
    planeBoundingBox: null,
    setSlotsPlane: (plane) => set(() => ({ slotsPlane: plane, planeBoundingBox: getMeshDimensions(plane) })),
}))