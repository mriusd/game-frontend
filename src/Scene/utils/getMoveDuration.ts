import { Coordinate } from "interfaces/coordinate.interface";
import { isDiagonal } from "./isDiagonal";

export const getMoveDuration = (speed: number, coord1: Coordinate, coord2: Coordinate) => {
    const testSlow = 1.25
    const duration = 1 * 60 * 1000 / speed * testSlow // 1m * 60s * 1000ms / speed
    const coef = 1.41
    console.log('isDiagonal', isDiagonal(coord1, coord2))
    return isDiagonal(coord1, coord2) ?  duration * coef : duration
}