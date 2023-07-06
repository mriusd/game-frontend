import * as THREE from 'three'
import { RefObject, createRef } from "react";
import { create } from "zustand";

export type EventType = 'mousemove'

export interface HandlerInterface {
    id: string
    type: EventType
    handler: () => void
}

export interface HTMLEventsInterface {
    _handlers: Array<HandlerInterface>
    add: (id: string, type: EventType, handler: () => void) => void
    remove: (id: string) => void
    listen: (node: HTMLElement | HTMLDivElement/*, type: EventType | Array<EventType>*/) => void
    stopListen: (node: HTMLElement | HTMLDivElement) => void
    _listener: () => void
}

export const useHTMLEvents = create<HTMLEventsInterface>((set, get) => ({
    _handlers: [],
    add: (id, type, handler) => {
        set((state) => {
            if (state._handlers.findIndex(item => item.id === id) !== -1) {
                return ({ _handlers: state._handlers })
            }
            return ({ _handlers: [ ...state._handlers, { id, type, handler } ] })
        })
    },
    remove: (id) => {
        set((state) => {
            const index = state._handlers.findIndex(item => item.id === id)
            if (index !== -1) {
                const _handlers = [ ...state._handlers.slice(0, index), ...state._handlers.slice(index+1) ]
                return ({ _handlers })
            }
            return ({ _handlers: state._handlers })
        })
    },
    listen: (node) => {
        node.addEventListener('mousemove', get()._listener)
    },
    stopListen: (node) => {
        node.removeEventListener('mousemove', get()._listener)
    },
    _listener: () => {
        // TODO: Separate different events on different Handlers, like: _mousemoveHandlers, _clickHandlers...
        const handlers = get()._handlers
        handlers.forEach(_ => {
            if (_.type === 'mousemove') {
                _.handler()
            }                    
        })
    }
}))