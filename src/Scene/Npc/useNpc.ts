import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

import type { Fighter } from "interfaces/fighter.interface";
import { useCore } from "Scene/useCore";

export interface NpcInterface {
    npcList: Fighter[]
    setNpcList: ( npcList: Fighter[] ) => void
}

// TODO: Update OccupiedCoords more reliably way
export const useNpc = createWithEqualityFn<NpcInterface>((set, get) => ({
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
}), shallow)