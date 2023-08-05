import { RefObject, createRef } from "react";
import { create } from "zustand";

export interface CommandLineInterface {
    value: string
    opened: boolean
    commandLineRef: RefObject<HTMLDivElement | null>
    eventNode: null | HTMLElement
    hide: () => void
    show: () => void
    subscribeCommandLine: (target: HTMLElement) => void
    unsubscribeCommandLine: () => void
    _handleKeypress: (e: KeyboardEvent) => void
}

export const useCommandLine = create<CommandLineInterface>((set, get) => ({
    value: '',
    opened: false,
    commandLineRef: createRef(),
    eventNode: null,
    hide: () => { set({ opened: false }); get().eventNode?.focus(); },
    show: () => set({ opened: true }),
    subscribeCommandLine: (target) => {
        if (!target) { console.error('[useCommandLine]: target event node not found') }
        set({ eventNode: target })
        target.addEventListener('keypress', get()._handleKeypress)
    },
    unsubscribeCommandLine() {
        const target = get().eventNode
        target.removeEventListener('keypress', get()._handleKeypress)
        set({ eventNode: null })
    },
    _handleKeypress: (e) => {
        if (e.code.toLowerCase() === 'enter') {
            if ( !get().opened ) {
                e.preventDefault()
                set({ opened: true })
                return
            }
        }
    }
}))