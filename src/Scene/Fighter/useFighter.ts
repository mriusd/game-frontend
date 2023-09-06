import { createWithEqualityFn } from 'zustand/traditional'
import { shallow } from 'zustand/shallow';
import { Fighter } from 'interfaces/fighter.interface';
import { RefObject, createRef } from 'react';
import type { Coordinate } from 'interfaces/coordinate.interface';
import { getMoveDuration } from 'Scene/utils/getMoveDuration';
import Tween from 'Scene/utils/tween/tween';
import { isEqualCoord } from 'Scene/utils/isEqualCoord';
import { getNearestEmptySquareToTarget } from 'Scene/utils/getNextPosition';

import { useCore } from 'store/useCore';
import { useEvents } from 'store/EventStore';

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
        const $core = useCore.getState()
        const $this = get()
        const ref = $this.fighterNode.current

        if ($this.isMoving) { return }
        if (isEqualCoord(ref.position, to)) { return }
        console.log('move', ref.position, to)

        const nextMatrixPosition = getNearestEmptySquareToTarget($core.occupiedCoords, $this.fighter.coordinates, $core.worldCoordToMatrix(to))
        // console.log('nextMatrixPos', nextMatrixPosition)
        if (!nextMatrixPosition) { return }
        const next = $core.matrixCoordToWorld(nextMatrixPosition)
        // Used over here instead isMoving useEffect cuz it rms a little delay which looks weird
        // setAction('run')
        // 
        $this.setIsMoving(true)

        useEvents.getState().moveFighter(nextMatrixPosition)
        const current = { x: ref.position.x, z: ref.position.z }
        // console.log('current, next', current, next)
        Tween.to(current, next,
            {
                duration: getMoveDuration($this.fighter.movementSpeed, current, next),
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