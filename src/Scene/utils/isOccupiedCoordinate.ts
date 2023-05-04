
import type { Coordinate } from "interfaces/coordinate.interface"
import type { OccupiedCoordinate } from "interfaces/occupied.interface"

export const isOccupiedCoordinate = (occupiedCoordinates: OccupiedCoordinate[], coordinate: Coordinate) => {
    return occupiedCoordinates.findIndex(occupied => occupied.coordinates.x === coordinate.x && occupied.coordinates.z === coordinate.z) !== -1
}