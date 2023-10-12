import type { Coordinate } from "interfaces/coordinate.interface"

export const euclideanDistance = (coord1: Coordinate, coord2: Coordinate) => {
    const deltaX = (coord1.x - coord2.x)
    const deltaZ = (coord1.z - coord2.z)
    return Math.sqrt(deltaX * deltaX + deltaZ * deltaZ)
}