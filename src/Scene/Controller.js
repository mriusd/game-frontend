import * as THREE from "three"
import { useEffect, useState, useContext } from "react"
import { SceneContext } from "./store/SceneContextProvider"
import { useThree, useFrame } from "@react-three/fiber"
import { clamp } from "three/src/math/MathUtils"
import { worldCoordToMatrix } from "./utils/worldCoordToMatrix"

const ANGLE_STEP = Math.PI / 4 // 8 directions
const ANGLE_RANGE = Math.PI / 8 // set a range of angles to rotate towards
const MIN_ANGLE = Math.PI / 6 // Min angle on which detect rotation
// TODO: Put this in a store & make reactive
const currentAngle = { value: 0 } // Current character rotation angle
const pointerWorld = { value: 0 } // Pointer position in world coordinates

const Controller = ({ world, character }) => {
    const [raycaster] = useState(new THREE.Raycaster())
    const { matrix, setPosition, setDirection } = useContext(SceneContext)
    const pointer = useThree(state => state.pointer)
    const camera = useThree(state => state.camera)

    // TODO: optimize this (CPU), render only on mousemove & character move
    useFrame(() => {
        calcPointerWorldLocation()
    })

    // Render on object move and mouse move
    function calcPointerWorldLocation() {
        raycaster.setFromCamera(pointer, camera)
        const intersections = raycaster.intersectObject(world.current)
        const point = intersections[0]?.point
        if (point) {
            pointerWorld.value = point
        }
    }

    useEffect(() => {
        window.addEventListener("mousedown", mouseDown)
        window.addEventListener("mousemove", mouseMove)
        return () => {
            window.removeEventListener("mousedown", mouseDown)
            window.removeEventListener("mousemove", mouseMove)
        }
    }, [])

    // Set world mouse position to move character
    function mouseDown() {
        console.log(pointerWorld.value, worldCoordToMatrix(matrix, pointerWorld.value))
        setPosition(worldCoordToMatrix(matrix, pointerWorld.value))
    }

    // Calc character rotation angle (direction)
    function mouseMove() {
        if (!character.current) { return }
        // Angle between object and mouse
        const angle = Math.atan2(
            pointerWorld.value.z - character.current.position.z,
            pointerWorld.value.x - character.current.position.x
        )

        const targetAngle = Math.round(angle / ANGLE_STEP) * ANGLE_STEP

        const angleDelta = angle - currentAngle.value
        const minAngle = { value: currentAngle.value - ANGLE_RANGE }
        const maxAngle = { value: currentAngle.value + ANGLE_RANGE }
        if (angleDelta > MIN_ANGLE) {
            maxAngle.value += angleDelta
        }
        else if (angleDelta < -MIN_ANGLE) {
            minAngle.value += angleDelta
        } else {
            return
        }

        const clampedTargetAngle = clamp(targetAngle, minAngle.value, maxAngle.value)

        // Save rotation angle, then rotate character in Character component
        currentAngle.value = clampedTargetAngle
        setDirection(currentAngle.value)
    }

    return (
        <></>
    )
}

export default Controller