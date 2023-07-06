import * as THREE from 'three'
import { create } from "zustand";
import { getMeshDimensions } from 'Scene/utils/getMeshDimensions';
import { RefObject, createRef } from 'react';
import { useEventStore } from './EventStore';

export interface BackpackStoreInterface {
    // Backpack slots
    width: number
    height: number
    cellSize: number

    // Open/close functionality
    isOpened: boolean
    open: () => void
    close: () => void
    toggle: () => void

    // Slots plane, stores Backpack data in <userData>, used by backpack drag system
    slots: RefObject<{[key: number]: THREE.Mesh}>
    equipmentSlots: RefObject<{[key: number]: THREE.Mesh}>
}

export const useBackpackStore = create<BackpackStoreInterface>((set, get) => ({
    width: 0,
    height: 0,
    cellSize: 48,
    isOpened: false,
    open: () => set({ isOpened: true }),
    close: () => set({ isOpened: false }),
    toggle: () => set(state => ({ isOpened: !state.isOpened })),
    slots: createRef(),
    equipmentSlots: createRef(),
}))