import { euclideanDistance } from "./euclideanDistance"
import type { Coordinate } from "interfaces/coordinate.interface"

export const getNextPosition = (current: Coordinate, target: Coordinate) => {
    let dx = target.x - current.x
    let dz = target.z - current.z
  
    let nextX = current.x
    let nextZ = current.z
  
    if (Math.abs(dx) > Math.abs(dz)) {
      nextX += Math.sign(dx)
    } else if (Math.abs(dz) > Math.abs(dx)) {
      nextZ += Math.sign(dz)
    } else {
      nextX += Math.sign(dx)
      nextZ += Math.sign(dz)
    }
  
    return { x: nextX, z: nextZ }
}

// TODO: dont use filer
export const getNearestEmptySquareToTarget = (matrix: any, currentPosition: Coordinate, targetPosition: Coordinate) => {
  const availableNearestSquares = matrix.value.filter(_ => (
    _.x === currentPosition.x - 1 && _.z === currentPosition.z + 0 && _.av ||
    _.x === currentPosition.x + 1 && _.z === currentPosition.z + 0 && _.av ||
    _.x === currentPosition.x + 0 && _.z === currentPosition.z - 1 && _.av ||
    _.x === currentPosition.x + 0 && _.z === currentPosition.z + 1 && _.av ||
    _.x === currentPosition.x - 1 && _.z === currentPosition.z - 1 && _.av ||
    _.x === currentPosition.x - 1 && _.z === currentPosition.z + 1 && _.av ||
    _.x === currentPosition.x + 1 && _.z === currentPosition.z - 1 && _.av ||
    _.x === currentPosition.x + 1 && _.z === currentPosition.z + 1 && _.av
  ))
  if (!availableNearestSquares.length) { return null }
  return availableNearestSquares.reduce((acc, value) => {
    const newDistance = euclideanDistance(value, targetPosition)
    return {
      distance: newDistance < acc.distance ? newDistance : acc.distance,
      square: newDistance < acc.distance ? value : acc.square
    }
  }, { distance: Infinity, square: null }).square
}