import { RefObject, createRef } from "react";
import { create } from "zustand";

export interface UiStoreInterface {
    // HTML element which used for additional event styling, scene parent
    eventsNode: RefObject<HTMLDivElement | null>

    // Set cursor state
    setCursor: (property: 'pointer' | 'grabbing' | 'default') => void
}

export const useUiStore = create<UiStoreInterface>((set, get) => ({
    eventsNode: createRef(),
    setCursor: (property) => {
        const eventsNode = useUiStore.getState().eventsNode.current
        if (!eventsNode) { return }
        if (property === 'default') {
            eventsNode.style.removeProperty('cursor')
            return
        }
        eventsNode.style.cursor = property
    }
}))