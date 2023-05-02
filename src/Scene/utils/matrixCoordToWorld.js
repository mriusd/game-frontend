export const matrixCoordToWorld = (worldSize, point) => {
    return {
        x: Math.round(point.x - worldSize / 2 ),
        z: Math.round(point.z - worldSize / 2 ),
    }
}