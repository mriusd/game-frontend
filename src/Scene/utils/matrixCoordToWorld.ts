import type { Coordinate } from "interfaces/coordinate.interface"

export const matrixCoordToWorld = (worldSize: number, coordinate: Coordinate) => {
    const sqsize = (worldSize - 1) / 2
    return {
        x: coordinate.x - sqsize,
        z: coordinate.z - sqsize,
    }
}