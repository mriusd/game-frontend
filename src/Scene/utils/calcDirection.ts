import { Coordinate } from "interfaces/coordinate.interface"
import { Direction } from "interfaces/direction.interface"

export const calcDirection = (currentCoordinate: Coordinate, targetCoordinate: Coordinate): Direction => {
    const direction = {
        dx: targetCoordinate.x - currentCoordinate.x,
        dz: targetCoordinate.z - currentCoordinate.z
    }
    // Normalize the direction vector
    // const magnitude = Math.sqrt(direction.dx * direction.dx + direction.dz * direction.dz)
    // if (magnitude > 0) {
    //     direction.dx /= magnitude
    //     direction.dz /= magnitude
    // }
    // console.log('direction', direction)

    return direction
}