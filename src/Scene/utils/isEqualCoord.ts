import type { Coordinate } from "interfaces/coordinate.interface";

export const isEqualCoord = (coordinate1: Coordinate, coordinate2: Coordinate) => {
    return (Math.abs(coordinate1.x - coordinate2.x) < .1) && (Math.abs(coordinate1.z - coordinate2.z) < .1)
}