export const worldCoordToMatrix = (matrix, point) => {
    // minus 0.5 to center the point
    return {
        x: Math.round(point.x + matrix.size / 2  - 0.5),
        z: Math.round(point.z + matrix.size / 2  - 0.5),
    }
}