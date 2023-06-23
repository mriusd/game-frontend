import * as THREE from 'three'
import { create } from "zustand";
import { getMeshDimensions } from 'Scene/utils/getMeshDimensions';
import { RefObject, createRef } from 'react';

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

    // Slots plane, used for coordinates as a placeholder; hover/focus events...
    slots: RefObject<{[key: number]: THREE.Mesh}>
}

export const useBackpackStore = create<BackpackStoreInterface>((set, get) => ({
    width: 8,
    height: 8,
    cellSize: 1,
    isOpened: false,
    open: () => set({ isOpened: true }),
    close: () => set({ isOpened: false }),
    toggle: () => set(state => ({ isOpened: !state.isOpened })),
    slots: createRef()
}))