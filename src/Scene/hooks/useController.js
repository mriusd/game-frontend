import * as THREE from "three"
import { clamp } from "three/src/math/MathUtils"
import { useEffect, useRef, useContext } from "react"
import { worldCoordToMatrix } from "../utils/worldCoordToMatrix"
import { useThree } from "@react-three/fiber"
import { SceneContext } from "../store/SceneContextProvider"

const ANGLE_STEP = Math.PI / 4 // 8 directions
const ANGLE_RANGE = Math.PI / 8 // Set a range of angles to rotate towards
const MIN_ANGLE = Math.PI / 6 // Min angle on which detect rotation

export const useController = (world, currentWorldPosition) => {
    const direction = useRef(0)
    const focusedMatrixPosition = useRef(null)
    const focusedWorldPosition = useRef(null)
    const pointerWorldPosition = useRef(null)

    const { worldSize } = useContext(SceneContext)
    const raycaster = useRef(new THREE.Raycaster())
    const pointer = useThree(state => state.pointer)
    const camera = useThree(state => state.camera)

    useEffect(() => {
        console.log('------HOOOK-----', currentWorldPosition)
        if (!currentWorldPosition) { return }
        pointerWorldPosition.current = calcPointerWorldPosition() || pointerWorldPosition.current
    }, [currentWorldPosition])

    function calcPointerWorldPosition() {
        raycaster.current.setFromCamera(pointer, camera)
        const intersections = raycaster.current.intersectObject(world.current)
        const point = intersections[0]?.point
        // console.log('point', {...point, z: point.z - 0.5})
        return point ? {...point} : null
    }

    useEffect(() => {
        window.addEventListener("mousedown", mouseDown)
        window.addEventListener("mousemove", mouseMove)
        return () => {
            window.removeEventListener("mousedown", mouseDown)
            window.removeEventListener("mousemove", mouseMove)
        }
    }, [])

    // Set world mouse position
    function mouseDown() {
        console.log({ ...pointerWorldPosition.current, z: pointerWorldPosition.current.z - 0.5 }, worldCoordToMatrix(worldSize.current, pointerWorldPosition.current))
        focusedMatrixPosition.current = worldCoordToMatrix(worldSize.current, pointerWorldPosition.current)
        focusedWorldPosition.current = pointerWorldPosition.current
    }

    // Calc character rotation angle (direction)
    function mouseMove() {
        pointerWorldPosition.current = calcPointerWorldPosition() || pointerWorldPosition.current

        if (!currentWorldPosition) { return }

        // Angle between object and mouse
        const angle = Math.atan2(
            pointerWorldPosition.current.z - currentWorldPosition.z,
            pointerWorldPosition.current.x - currentWorldPosition.x
        )

        const targetAngle = Math.round(angle / ANGLE_STEP) * ANGLE_STEP

        const angleDelta = angle - direction.current
        const minAngle = { value: direction.current - ANGLE_RANGE }
        const maxAngle = { value: direction.current + ANGLE_RANGE }

        if (angleDelta > MIN_ANGLE) {
            maxAngle.value += angleDelta
        }
        else if (angleDelta < -MIN_ANGLE) {
            minAngle.value += angleDelta
        } else {
            return
        }

        console.log('--------------->>>>>>>>>', direction.current)
        direction.current = clamp(targetAngle, minAngle.value, maxAngle.value)
    }


    return {
        direction,
        focusedMatrixPosition,
        focusedWorldPosition,
        pointerWorldPosition
    }
}