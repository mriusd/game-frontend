import { euclideanDistance } from "./euclideanDistance"
import type { Coordinate } from "interfaces/coordinate.interface"
import type { OccupiedCoordinate } from "interfaces/occupied.interface"
import { isOccupiedCoordinate } from "./isOccupiedCoordinate"
import type { Fighter } from "interfaces/fighter.interface"
import type { Skill } from "interfaces/skill.interface"

const getAvailableNearestSquares = (occupiedCoordinates: OccupiedCoordinate[], currentMatrixCoordinate: Coordinate) => {
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
  return nearestSquares.filter(coordinate => !isOccupiedCoordinate(occupiedCoordinates, coordinate))
}

export const getNearestEmptySquareToTarget = (occupiedCoordinates: OccupiedCoordinate[], currentMatrixCoordinate: Coordinate, targetMatrixCoordinate: Coordinate, attack: { target: Fighter, skill: Skill } | null) => {
  if (targetMatrixCoordinate.x === currentMatrixCoordinate.x && targetMatrixCoordinate.z === currentMatrixCoordinate.z) { return null }

  const currentDistance = euclideanDistance(currentMatrixCoordinate, targetMatrixCoordinate)
  const availableNearestSquares = getAvailableNearestSquares(occupiedCoordinates, currentMatrixCoordinate)
  const sortedSquares = availableNearestSquares.map(square => ({
    square,
    distance: euclideanDistance(square, targetMatrixCoordinate)
  })).sort((a, b) => a.distance - b.distance)

  if (currentDistance <= sortedSquares[0].distance) { return null }

  const data = {
    distance: sortedSquares[0].distance,
    square: sortedSquares[0].square
  }

  return data.square
}
