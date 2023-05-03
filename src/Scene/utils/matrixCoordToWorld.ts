import type { Coordinate } from "interfaces/coordinate.interface"

export const matrixCoordToWorld = (worldSize: number, coordinate: Coordinate) => {
    return {
        x: Math.round(coordinate.x - worldSize / 2 ),
        z: Math.round(coordinate.z - worldSize / 2 ),
    }
}