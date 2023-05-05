import * as THREE from "three"
import type { Coordinate } from "interfaces/coordinate.interface"
import { clamp } from "three/src/math/MathUtils"

export const worldCoordToMatrix = (worldSize: number, coordinate: Coordinate) => {
    const sqsize = (worldSize - 1) / 2
    return {
        x: Math.min(Math.max(Math.floor(coordinate.x + sqsize), 0), worldSize-1),
        z: Math.min(Math.max(Math.floor(coordinate.z + sqsize), 0), worldSize-1)
    }
}