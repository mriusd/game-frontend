import { Coordinate } from "interfaces/coordinate.interface";
import { isDiagonal } from "./isDiagonal";

export const getMoveDuration = (speed: number, coord1: Coordinate, coord2: Coordinate) => {
    const duration = 1 * 60 * 1000 / speed // 1m * 60s * 1000ms / speed
    const coef = 1.41
    return isDiagonal(coord1, coord2) ?  duration * coef : duration
}