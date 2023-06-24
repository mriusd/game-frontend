import * as THREE from 'three'
import { useUiStore } from "store/uiStore"
import { uiUnits } from './uiUnits'

// intersaction layer (9)
// Our intersaction plane is in group with layer (-10)
// What means our Z coordinate has to be (1)
// To get -10 + 1 = 9

// Transform Raycast coord to local User Interface coords
export const getCoordInUISpace = (raycaster: THREE.Raycaster) => {
    const userInterface = useUiStore.getState().userInterface.current
    const intersectionPlane = useUiStore.getState().intersectionPlane.current
    if (!userInterface || !intersectionPlane) { return null }
    const intersection = raycaster.intersectObject(intersectionPlane)
    if (!intersection[0]) { return null }
    const matrix = new THREE.Matrix4().copy(userInterface.matrixWorld).invert()
    const point = intersection[0].point.applyMatrix4(matrix)
    point.z = uiUnits(1)
    return point
}