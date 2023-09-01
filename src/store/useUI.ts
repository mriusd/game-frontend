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
    intersectionPlane: createRef()
}))