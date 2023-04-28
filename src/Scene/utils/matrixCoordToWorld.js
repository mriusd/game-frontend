export const matrixCoordToWorld = (matrix, point) => {
    return {
        x: Math.round(point.x - matrix.size / 2 ),
        z: Math.round(point.z - matrix.size / 2 ),
    }
}