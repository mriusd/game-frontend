import { euclideanDistance } from "./euclideanDistance"
import type { Coordinate } from "interfaces/coordinate.interface"
import type { OccupiedCoordinate } from "interfaces/occupied.interface"
import { isOccupiedCoordinate } from "./isOccupiedCoordinate"

export const getNearestEmptySquareToTarget = (occupiedCoordinates: OccupiedCoordinate[], currentMatrixCoordinate: Coordinate, targetMatrixCoordinate: Coordinate) => {
  const nearestSquares = [
    { x: currentMatrixCoordinate.x - 1, z: currentMatrixCoordinate.z + 0 },
    { x: currentMatrixCoordinate.x + 1, z: currentMatrixCoordinate.z + 0 },
    { x: currentMatrixCoordinate.x + 0, z: currentMatrixCoordinate.z - 1 },
    { x: currentMatrixCoordinate.x + 0, z: currentMatrixCoordinate.z + 1 },
    { x: currentMatrixCoordinate.x - 1, z: currentMatrixCoordinate.z - 1 },
    { x: currentMatrixCoordinate.x - 1, z: currentMatrixCoordinate.z + 1 },
    { x: currentMatrixCoordinate.x + 1, z: currentMatrixCoordinate.z - 1 },
    { x: currentMatrixCoordinate.x + 1, z: currentMatrixCoordinate.z + 1 }
  ]
  const availableNearestSquares = nearestSquares.filter(coordinate => !isOccupiedCoordinate(occupiedCoordinates, coordinate))
  if (!availableNearestSquares.length) { return null }
  return availableNearestSquares.reduce((acc, value) => {
    const newDistance = euclideanDistance(value, targetMatrixCoordinate)
    return {
      distance: newDistance < acc.distance ? newDistance : acc.distance,
      square: newDistance < acc.distance ? value : acc.square
    }
  }, { distance: Infinity, square: null }).square
}