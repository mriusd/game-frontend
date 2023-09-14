import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

import type { Fighter } from "interfaces/fighter.interface";

import { useCore } from "store/useCore";

export interface OtherFighterInterface {
    otherFighterList: Fighter[]
    setOtherFighterList: ( otherFighterList: Fighter[] ) => void
}

export const useOtherFighter = createWithEqualityFn<OtherFighterInterface>((set, get) => ({
    otherFighterList: [],
    setOtherFighterList: ( otherFighterList ) => {
        if (!otherFighterList) { console.error('[useOtherFighterList]: otherFighterList not provided') }
        if (!otherFighterList.length) { return }

        const updateOccupiedCoord = useCore.getState().updateOccupiedCoord
        otherFighterList.forEach((serverFighter: Fighter) => {
            if (serverFighter.isDead) {
                updateOccupiedCoord({
                    id: serverFighter.id,
                    coordinates: serverFighter.coordinates
                }, 'remove')
                return
            }
            updateOccupiedCoord({
                id: serverFighter.id,
                coordinates: serverFighter.coordinates
            }, 'add')
        })

        set({ otherFighterList })
    }
}), shallow)