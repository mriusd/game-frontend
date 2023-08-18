import { create } from "zustand";
import type { Fighter } from "interfaces/fighter.interface";

import { useCore } from "store/useCore";

export interface NpcInterface {
    npcList: Fighter[]
    setNpcList: ( npcList: Fighter[] ) => void
}

export const useNpc = create<NpcInterface>((set, get) => ({
    npcList: [],
    setNpcList: ( npcList: Fighter[] ) => {
        if (!npcList) { console.error('[useNpc]: npcList not provided') }
        if (!npcList.length) { return }

        const updateOccupiedCoord = useCore.getState().updateOccupiedCoord
        npcList.forEach((serverNpc: Fighter) => {
            if (serverNpc.isDead) {
                updateOccupiedCoord({
                    id: serverNpc.id,
                    coordinates: serverNpc.coordinates
                }, 'remove')
                return
            }
            updateOccupiedCoord({
                id: serverNpc.id,
                coordinates: serverNpc.coordinates
            }, 'add')
        })

        set({ npcList })
    }
}))