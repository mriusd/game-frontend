export const inWorld = (worldSize, { x, z }) => {
    return x >= 0 && x < worldSize && z >= 0 && z < worldSize
}