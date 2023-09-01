import { createWithEqualityFn } from 'zustand/traditional'
import { shallow } from 'zustand/shallow';
import { Fighter } from 'interfaces/fighter.interface';
import { RefObject, createRef } from 'react';

export interface UseFighterInterface {
    fighter: Fighter | null
    setFighter: (fighter: Fighter) => void
    fighterNode: RefObject<THREE.Mesh | null>
    otherFightersNode: RefObject<THREE.Mesh | null>[]
    setOtherFightersNode: (node: THREE.Mesh, action: 'add' | 'remove') => void
}

export const useFighter = createWithEqualityFn<UseFighterInterface>((set, get) => ({
    fighter: null,
    setFighter: (fighter) => set({ fighter }),
    fighterNode: createRef(),
    otherFightersNode: [],
    // TODO: Add other fighters node manager system
    setOtherFightersNode: (node, action) => {

    }
}), shallow)