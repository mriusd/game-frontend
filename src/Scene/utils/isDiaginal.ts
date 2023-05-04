import { Coordinate } from "interfaces/coordinate.interface";

export const isDiagonal = (coord1: Coordinate, coord2: Coordinate) => {
    return Math.abs(coord1.x - coord2.x) === Math.abs(coord1.z - coord2.z)
}