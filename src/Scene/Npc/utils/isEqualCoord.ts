import type { Coordinate } from "interfaces/coordinate.interface";

export const isEqualCoord = (coordinate1: Coordinate, coordinate2: Coordinate) => {
    return (coordinate1.x - coordinate2.x < .5) && (coordinate1.z - coordinate2.z < .5)
}