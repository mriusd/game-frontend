import type { Coordinate } from "interfaces/coordinate.interface"

export const worldCoordToMatrix = (worldSize: number, coordinate: Coordinate) => {
    // minus 0.5 to center the point
    return {
        x: Math.round(coordinate.x + worldSize / 2  - 0.5),
        z: Math.round(coordinate.z + worldSize / 2  - 0.5),
    }
}