import { euclideanDistance } from "./euclideanDistance"
import type { Coordinate } from "interfaces/coordinate.interface"
import type { OccupiedCoordinate } from "interfaces/occupied.interface"
import { isOccupiedCoordinate } from "./isOccupiedCoordinate"
import type { Fighter } from "interfaces/fighter.interface"
import type { Skill } from "interfaces/skill.interface"

export const getNearestEmptySquareToTarget = (occupiedCoordinates: OccupiedCoordinate[], currentMatrixCoordinate: Coordinate, targetMatrixCoordinate: Coordinate, attack: { target: Fighter, skill: Skill } | null) => {
  if (targetMatrixCoordinate.x === currentMatrixCoordinate.x && targetMatrixCoordinate.z === currentMatrixCoordinate.z) { return null }
  const minDistance = attack ? attack.skill.activeDistance : 0
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
  const data = availableNearestSquares.reduce((acc, value) => {
    const newDistance = euclideanDistance(value, targetMatrixCoordinate)
    return {
      distance: newDistance < acc.distance ? newDistance : acc.distance,
      square: newDistance < acc.distance ? value : acc.square
    }
  }, { distance: Infinity, square: null })

  if (data.distance <= minDistance + 0.5) { return null }

  return data.square
}