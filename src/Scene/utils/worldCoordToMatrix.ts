import * as THREE from "three"
import type { Coordinate } from "interfaces/coordinate.interface"
import { clamp } from "three/src/math/MathUtils"

export const worldCoordToMatrix = (worldSize: number, coordinate: Coordinate) => {
    const sqsize = (worldSize - 1) / 2
    return {
        x: Math.min(Math.max(Math.round(coordinate.x + sqsize), 0), worldSize-1),
        z: Math.min(Math.max(Math.round(coordinate.z + sqsize), 0), worldSize-1)
    }
}

// export const worldCoordToMatrix = (worldSize: number, coordinate: THREE.Vector3, cameraPosition: THREE.Vector3, objectPosition: THREE.Vector3) => {
//     // Calculate the direction from the camera to the object
//     const direction = objectPosition.clone().sub(cameraPosition).normalize()
  
//     // Project the coordinate onto the plane that passes through the object and is perpendicular to the direction
//     const projectedCoordinate = coordinate.clone().sub(objectPosition).projectOnPlane(direction).add(objectPosition)
  
//     // Calculate the adjusted coordinate
//     const adjustedCoordinate = {
//       x: projectedCoordinate.x,
//       z: projectedCoordinate.z,
//     }
  
//     // Calculate the matrix index based on adjusted world coordinate and cell size
//     const matrixCoordinate = (worldCoord: number) => Math.floor(worldCoord / 1)
  
//     // Clamp the matrix index to the valid range
//     const clamp = (value: number) => Math.min(Math.max(value, 0), worldSize - 1)
  
//     return {
//       x: clamp(matrixCoordinate(adjustedCoordinate.x)),
//       z: clamp(matrixCoordinate(adjustedCoordinate.z)),
//     }
//   }


// export const worldCoordToMatrix = (worldSize: number, coordinate: Coordinate) => {
//     const adjustedCoordinate = {
//       x: coordinate.x / 1,
//       z: (worldSize - 1) - coordinate.z / 1
//     }
  
//     const clamp = (value: number) => Math.min(Math.max(value, 0), worldSize - 1)
  
//     return {
//       x: clamp(Math.floor(adjustedCoordinate.x)),
//       z: clamp(Math.floor(adjustedCoordinate.z)),
//     }
//   }

// export const worldCoordToMatrix = (worldSize: number, coordinate: THREE.Vector3, cameraPosition: THREE.Vector3, objectPosition: THREE.Vector3) => {
//     const planeNormal = new THREE.Vector3(0, 1, 0)
//     const relativeCameraPosition = cameraPosition.clone().sub(objectPosition)
//     const direction = relativeCameraPosition.normalize()
//     const projectedCoordinate = coordinate.clone().sub(objectPosition).projectOnPlane(planeNormal).add(objectPosition)
  
//     const adjustedCoordinate = {
//       x: projectedCoordinate.x / 1,
//       z: projectedCoordinate.z / 1
//     }
  
//     const clamp = (value: number) => Math.min(Math.max(value, 0), worldSize - 1)
  
//     return {
//       x: clamp(Math.floor(adjustedCoordinate.x)),
//       z: clamp(Math.floor(adjustedCoordinate.z)),
//     }
//   }
  