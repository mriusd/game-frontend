import * as THREE from "three"
import { useEffect, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { lerp, clamp } from "three/src/math/MathUtils"
import { CAMERA_POSITION } from "./Scene"

const EASE = 0.075
const ANGLE_STEP = Math.PI / 4 // 8 directions
const ANGLE_RANGE = Math.PI / 8 // set a range of angles to rotate towards
const MIN_ANGLE = Math.PI / 6 // Min angle on which detect rotation
// TODO: Put this in a store & make reactive
const currentAngle = { value: 0 } // Current character rotation angle
const pointerWorld = { value: 0 } // Pointer position in world coordinates

const Controller = ({ world, matrix, character }) => {
    const [ raycaster ] = useState(new THREE.Raycaster())
    const [ locationAim, setLocationAim ] = useState(new THREE.Vector3(0, 0, 0))
    const pointer = useThree(state => state.pointer)
    const camera = useThree(state => state.camera)
    const cameraPosition = new THREE.Vector3(...CAMERA_POSITION)

    useFrame(() => {
        if (!character.current) { return }

        // Move towards aim
        if (character.current.position.x !== locationAim.x && character.current.position.z !== locationAim.z) {
            character.current.position.x = lerp(character.current.position.x, locationAim.x, EASE)
            character.current.position.z = lerp(character.current.position.z, locationAim.z, EASE)

            // Make camera follow the character
            camera.position.copy(character.current.position).add(cameraPosition)

            calcPointerWorldLocation()
        }
    })

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
        setLocationAim(pointerWorld.value)
    }

    // Set character look direction
    function mouseMove() {
        calcPointerWorldLocation()

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

        const clampedTargetAngle = clamp(targetAngle, minAngle.value, maxAngle.value);
        // Rotate the object
        character.current.rotation.y = clampedTargetAngle
        // Save rotation
        currentAngle.value = clampedTargetAngle
    }

    // Render on object move and mouse move
    function calcPointerWorldLocation() {
        raycaster.setFromCamera(pointer, camera)
        const intersections = raycaster.intersectObject(world.current)
        const point = intersections[0]?.point
        if (point) {
            pointerWorld.value = point
        }
    }

    return (
        <></>
    )
}

export default Controller