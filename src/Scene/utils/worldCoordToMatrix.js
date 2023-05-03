export const worldCoordToMatrix = (worldSize, point) => {
    // minus 0.5 to center the point
    return {
        x: Math.round(point.x + worldSize / 2  - 0.5),
        z: Math.round(point.z + worldSize / 2  - 0.5),
    }
}