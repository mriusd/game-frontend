import * as THREE from 'three'
import { useUiStore } from "store/uiStore"

export const getCoordInUISpace = (raycaster: THREE.Raycaster) => {
    const userInterface = useUiStore.getState().userInterface.current
    const intersectionPlane = useUiStore.getState().intersectionPlane.current
    if (!userInterface || !intersectionPlane) { return null }
    const intersection = raycaster.intersectObject(intersectionPlane)
    if (!intersection[0]) { return null }
    // const matrix = new THREE.Matrix4().copy(userInterface.matrixWorld).invert()
    const point = intersection[0].point
    point.z = 0
    return point
}