import * as THREE from 'three'
import { RefObject, createRef } from "react";
import { create } from "zustand";

export interface UiStoreInterface {
    // HTML element which used for additional event styling, scene parent
    eventsNode: RefObject<HTMLDivElement | null>

    // Set cursor state
    setCursor: (property: 'pointer' | 'grabbing' | 'default') => void

    // User Interface 3d Object
    userInterface: RefObject<THREE.Group | null>
    // Plane which we raycasts, based on which all mouse events in ui
    intersectionPlane: RefObject<THREE.Mesh | null>

    pressedKeys: Array<String>
    _keyDownHandler: (enent: KeyboardEvent) => void
    _keyUpHandler: (enent: KeyboardEvent) => void
    _updatePressedKeys: (key: string, action: 'add' | 'remove') => void
    subscribePressedKeys: () => void
    unsubscribePressedKeys: () => void
}

export const useUi = create<UiStoreInterface>((set, get) => ({
    eventsNode: createRef(),
    setCursor: (property) => {
        const eventsNode = useUi.getState().eventsNode.current
        if (!eventsNode) { return }
        if (property === 'default') {
            eventsNode.style.removeProperty('cursor')
            return
        }
        eventsNode.style.cursor = property
    },
    userInterface: createRef(),
    intersectionPlane: createRef(),

    pressedKeys: [],
    _keyDownHandler: event => {
        const key = event.code.toLowerCase()
        get()._updatePressedKeys(key, 'add')
    },
    _keyUpHandler: event => {
        const key = event.code.toLowerCase()
        get()._updatePressedKeys(key, 'remove')
    },
        _updatePressedKeys: (key, action) => {
        const pressedKeys = get().pressedKeys
        if (action === 'add') {
            if (!pressedKeys.includes(key)) {
                pressedKeys.push(key)
            }
        } else if (action === 'remove') {
            const index = pressedKeys.indexOf(key)
            if (index !== -1) {
                pressedKeys.splice(index, 1)
            }
        }
    },
    subscribePressedKeys: () => {
        const $this = get()
        if (!$this.eventsNode.current) { return }
        $this.eventsNode.current.addEventListener('keydown', $this._keyDownHandler)
        $this.eventsNode.current.addEventListener('keyup', $this._keyUpHandler)
    },
    unsubscribePressedKeys: () => {
        const $this = get()
        if (!$this.eventsNode.current) { return }
        $this.eventsNode.current.removeEventListener('keydown', $this._keyDownHandler)
        $this.eventsNode.current.removeEventListener('keyup', $this._keyUpHandler)
    },

}))