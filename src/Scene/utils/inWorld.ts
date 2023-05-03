import type { Coordinate } from "interfaces/coordinate.interface"

export const inWorld = (worldSize: number, { x, z }: Coordinate) => {
    return x >= 0 && x < worldSize && z >= 0 && z < worldSize
}