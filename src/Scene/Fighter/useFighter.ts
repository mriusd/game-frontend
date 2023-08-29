import { createWithEqualityFn } from 'zustand/traditional'
import { shallow } from 'zustand/shallow';
import { Fighter } from 'interfaces/fighter.interface';

export interface UseFighterInterface {
    fighter: Fighter | null
    setFighter: (fighter: Fighter) => void
}

export const useFighter = createWithEqualityFn<UseFighterInterface>((set, get) => ({
    fighter: null,
    setFighter: (fighter) => set({ fighter })
}), shallow)