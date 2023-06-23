import { create } from "zustand";
import type { Backpack } from "interfaces/backpack.interface";

// -------------------
// I use this layer for EventCloud to prevent lots of react rerenders
// -------------------

export interface EventStoreInterface {
    backpack: Backpack | null
    updateBackpack: (backpack: Backpack) => void
}

export const useEventStore = create<EventStoreInterface>((set, get) => ({
    // Backpack
    backpack: null,
    updateBackpack: (backpack) => {
        set(() => ({ backpack: backpack }))
    }
}))