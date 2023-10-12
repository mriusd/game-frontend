export const angleToVector = (angle: number) => {
    return {
        x: Math.round(Math.sin(angle)),
        z: Math.round(Math.cos(angle))
    }
}