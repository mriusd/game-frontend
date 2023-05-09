import { euclideanDistance } from "./euclideanDistance"
import type { Coordinate } from "interfaces/coordinate.interface"
import type { OccupiedCoordinate } from "interfaces/occupied.interface"
import { isOccupiedCoordinate } from "./isOccupiedCoordinate"

const getAvailableNearestSquares = (occupiedCoordinates: OccupiedCoordinate[], currentMatrixCoordinate: Coordinate, md:number = 0) => {
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

export const getNearestEmptySquareToTarget = (occupiedCoordinates: OccupiedCoordinate[], currentMatrixCoordinate: Coordinate, targetMatrixCoordinate: Coordinate) => {
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

export const getTargetSquareWithAttackDistance = (occupiedCoordinates: OccupiedCoordinate[], currentMatrixCoordinate: Coordinate, targetMatrixCoordinate: Coordinate, minDistance: number = 0) => {
  const currentDistance = euclideanDistance(currentMatrixCoordinate, targetMatrixCoordinate)
  
  if (currentDistance <= minDistance) { return null }
  
  const availableNearestSquares = getAvailableNearestSquares(occupiedCoordinates, currentMatrixCoordinate)
  const sortedSquares = availableNearestSquares.map(square => ({
    square,
    distance: euclideanDistance(square, targetMatrixCoordinate)
  })).sort((a, b) => a.distance - b.distance)

  if (currentDistance <= sortedSquares[0].distance) { return null }

  if (sortedSquares[0].distance > minDistance) { 
    return getTargetSquareWithAttackDistance(occupiedCoordinates, sortedSquares[0].square, targetMatrixCoordinate, minDistance)
  }

  const data = {
    distance: sortedSquares[0].distance,
    square: sortedSquares[0].square
  }

  return data.square
}
