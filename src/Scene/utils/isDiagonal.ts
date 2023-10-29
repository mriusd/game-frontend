import { Coordinate } from "interfaces/coordinate.interface";

export const isDiagonal = (coord1: Coordinate, coord2: Coordinate) => {
    return Math.round(Math.abs(Math.abs(coord1.x) - Math.abs(coord2.x))) === Math.round(Math.abs(Math.abs(coord1.z) - Math.abs(coord2.z)))
}