import { createWithEqualityFn } from 'zustand/traditional'
import { shallow } from 'zustand/shallow';
import type { Coordinate } from 'interfaces/coordinate.interface';
import { clamp } from 'three/src/math/MathUtils';

import { useFighter } from 'Scene/Fighter/useFighter';

const ANGLE_STEP = Math.PI / 4 // 8 directions
const ANGLE_RANGE = Math.PI / 8 // Set a range of angles to rotate towards
const MIN_ANGLE = Math.PI / 6 // Min angle on which detect rotation

export interface UseControlsInterface {
    pointerCoordinate: Coordinate | null
    setPointerCoordinate: (coordinate: Coordinate) => void
    direction: number
    setDirection: (direction: number) => void
    calcDirection: () => number
}

export const useControls = createWithEqualityFn<UseControlsInterface>((set, get) => ({
    pointerCoordinate: null,
    setPointerCoordinate: (coordinate) => set({ pointerCoordinate: coordinate }),
    direction: 0,
    setDirection: (direction) => set({ direction }),
    calcDirection: () => {
        const fighterNode = useFighter.getState().fighterNode
        const pointerCoordinate = get().pointerCoordinate
        const direction = get().direction

        if (!fighterNode.current) { return }
        if (!pointerCoordinate) { return }
    
        const fighterCoordinate = fighterNode.current.position
    
        // Angle between object and mouse
        const angle = Math.atan2(
            pointerCoordinate.x - fighterCoordinate.x,
            pointerCoordinate.z - fighterCoordinate.z,
        )
    
        const targetAngle = Math.round(angle / ANGLE_STEP) * ANGLE_STEP
    
        const angleDelta = angle - direction
        const minAngle = { value: direction - ANGLE_RANGE }
        const maxAngle = { value: direction + ANGLE_RANGE }
    
        if (angleDelta > MIN_ANGLE) {
            maxAngle.value += angleDelta
        }
        else if (angleDelta < -MIN_ANGLE) {
            minAngle.value += angleDelta
        } else {
            return
        }
    
        return clamp(targetAngle, minAngle.value, maxAngle.value)
    }
}), shallow)
