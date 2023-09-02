import { createWithEqualityFn } from 'zustand/traditional'
import { shallow } from 'zustand/shallow';
import { Fighter } from 'interfaces/fighter.interface';
import { RefObject, createRef } from 'react';
import type { Coordinate } from 'interfaces/coordinate.interface';
import { getMoveDuration } from 'Scene/utils/getMoveDuration';
import Tween from 'Scene/utils/tween/tween';
import { isEqualCoord } from 'Scene/utils/isEqualCoord';

export interface UseFighterInterface {
    fighter: Fighter | null
    setFighter: (fighter: Fighter) => void
    fighterNode: RefObject<THREE.Mesh | null>
    otherFightersNode: RefObject<THREE.Mesh | null>[]
    setOtherFightersNode: (node: THREE.Mesh, action: 'add' | 'remove') => void
    isMoving: boolean
    setIsMoving: (isMoving: boolean) => void
    move: (to: Coordinate) => void
    setPosition: (to: Coordinate) => void
}

export const useFighter = createWithEqualityFn<UseFighterInterface>((set, get) => ({
    fighter: null,
    setFighter: (fighter) => set({ fighter }),
    fighterNode: createRef(),
    otherFightersNode: [],
    // TODO: Add other fighters node manager system
    setOtherFightersNode: (node, action) => { },
    isMoving: false,
    setIsMoving: (isMoving) => set({ isMoving }),
    move: (to) => {
        const $this = get()
        const ref = $this.fighterNode.current

        console.log('move', ref.position, to)
        if ($this.isMoving) { return }

        //     const nextMatrixPosition = getNearestEmptySquareToTarget(occupiedCoords, currentMatrixCoordinate, targetMatrixCoordinate)

        if (isEqualCoord(ref.position, to)) { return }

        // Used over here instead isMoving useEffect cuz it rms a little delay which looks weird
        // setAction('run')
        // 
        $this.setIsMoving(true)
        const current = { x: ref.position.x, z: ref.position.z }
        Tween.to(current, to,
            {
                duration: getMoveDuration($this.fighter.movementSpeed, current, to),
                onChange: (state: { value: Coordinate }) => void $this.setPosition(state.value),
                onComplete: () => void $this.setIsMoving(false),
            }
        )
    },
    setPosition: (to: Coordinate) => {
        const ref = get().fighterNode.current
        ref.position.x = to.x
        ref.position.z = to.z
    }
}), shallow)