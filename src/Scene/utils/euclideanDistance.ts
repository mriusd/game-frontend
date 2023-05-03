import type { Coordinate } from "interfaces/coordinate.interface"

export const euclideanDistance = (coord1: Coordinate, coord2: Coordinate, minDistance: number = 0) => {
    const deltaX = (coord1.x - coord2.x) + minDistance
    const deltaZ = (coord1.z - coord2.z) + minDistance
    return Math.sqrt(deltaX * deltaX + deltaZ * deltaZ)
}