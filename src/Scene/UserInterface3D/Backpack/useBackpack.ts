import * as THREE from 'three'
import { create } from "zustand";
import { getMeshDimensions } from 'Scene/utils/getMeshDimensions';
import { MutableRefObject, RefObject, createRef } from 'react';
import { useCloud } from '../../../EventCloud/useCloud';
import { useUi } from '../useUI';
import { ThreeEvent } from '@react-three/fiber';

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

    // Buttons
    subscribeBackpack: () => void
    unsubscribeBackpack: () => void
    _handleKeypress: (e: KeyboardEvent) => void
}

export const useBackpack = create<BackpackStoreInterface>((set, get) => ({
    width: 0,
    height: 0,
    cellSize: 48,
    isOpened: false,
    open: () => set({ isOpened: true }),
    close: () => set({ isOpened: false }),
    toggle: () => set(state => ({ isOpened: !state.isOpened })),
    slots: createRef(),
    equipmentSlots: createRef(),
    subscribeBackpack: () => {
        const target = useUi.getState().eventsNode.current
        if (!target) { console.error('[useCommandLine]: target event node not found') }
        target.addEventListener('keypress', get()._handleKeypress)
    },
    unsubscribeBackpack() {
        const target = useUi.getState().eventsNode.current
        target.removeEventListener('keypress', get()._handleKeypress)
    },
    _handleKeypress: (e) => {
        if (e.code.toLowerCase() === 'keyv' ||e.code.toLowerCase() === 'keyi' ) {
            e.preventDefault()
            get().toggle()
        }
    }
}))