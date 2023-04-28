export const getNextPosition = (current, target) => {
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