export const euclideanDistance = (coord1, coord2, minDistance = 0) => {
    const deltaX = (coord1.x - coord2.x) + minDistance
    const deltaZ = (coord1.z - coord2.z) + minDistance
    return Math.sqrt(deltaX * deltaX + deltaZ * deltaZ)
}