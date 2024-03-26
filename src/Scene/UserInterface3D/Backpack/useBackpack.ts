import * as THREE from 'three'
import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import { RefObject, createRef } from 'react';
import { useUi } from '../useUI';

export interface BackpackStoreInterface {
    // Backpack slots
    cellSize: number

    // Open/close functionality
    isOpened: boolean
    open: () => void
    close: () => void
    toggle: () => void

    // Vault
    isOpenedVault: boolean
    openVault: () => void
    closeVault: () => void
    toggleVault: () => void

    // Shop
    isOpenedShop: boolean
    openShop: () => void
    closeShop: () => void
    toggleShop: () => void

    // Slots plane, stores Backpack data in <userData>, used by backpack drag system
    slots: RefObject<{[key: number]: THREE.Mesh}>
    equipmentSlots: RefObject<{[key: number]: THREE.Mesh}>

    // Buttons
    subscribeBackpack: () => void
    unsubscribeBackpack: () => void
    _handleKeypress: (e: KeyboardEvent) => void
}

export const useBackpack = createWithEqualityFn<BackpackStoreInterface>((set, get) => ({
    cellSize: 48,

    isOpened: false,
    open: () => set({ isOpened: true }),
    close: () => set({ isOpened: false, isOpenedVault: false }),
    toggle: () => set(state => ({ 
        isOpened: !state.isOpened, 
        isOpenedVault: state.isOpened ? false : state.isOpenedVault,
        isOpenedShop: state.isOpened ? false : state.isOpenedShop 
    })),

    isOpenedVault: false,
    openVault: () => set({ isOpenedVault: true }),
    closeVault: () => set({ isOpenedVault: false }),
    toggleVault: () => set(state => ({ isOpenedVault: !state.isOpenedVault })),

    isOpenedShop: false,
    openShop: () => set({ isOpenedShop: true }),
    closeShop: () => set({ isOpenedShop: false }),
    toggleShop: () => set(state => ({ isOpenedShop: !state.isOpenedShop })),

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
}), shallow)