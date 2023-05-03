import * as THREE from "three"
import { clamp } from "three/src/math/MathUtils"
import type { RefObject } from "react" 
import { useRef, useEffect } from "react"
import { Object3D } from "three"
import { useSceneContext } from "store/SceneContext"
import { useFrame, useThree } from "@react-three/fiber"
import { worldCoordToMatrix } from "Scene/utils/worldCoordToMatrix"

const ANGLE_STEP = Math.PI / 4 // 8 directions
const ANGLE_RANGE = Math.PI / 8 // Set a range of angles to rotate towards
const MIN_ANGLE = Math.PI / 6 // Min angle on which detect rotation

interface Props { world: RefObject<Object3D | null> }
const Controller = ({ world }: Props) => {
    const { 
        worldSize, 
        currentWorldCoordinate,
        controller: {
            direction,
            focusedMatrixCoordinate,
            focusedWorldCoordinate,
            pointerWorldCoordinate
        }
    } = useSceneContext()
    const raycaster = useRef(new THREE.Raycaster())
    const pointer = useThree(state => state.pointer)
    const camera = useThree(state => state.camera)

    useEffect(() => {
        if (!currentWorldCoordinate) { return }
        // @ts-expect-error
        pointerWorldCoordinate.current = calcpointerWorldCoordinate() || pointerWorldCoordinate.current
    }, [currentWorldCoordinate])
    // useFrame(() => {
    //     // @ts-expect-error
    //     pointerWorldCoordinate.current = calcpointerWorldCoordinate() || pointerWorldCoordinate.current
    // })

    // useFrame(() => {
    //     console.log(currentWorldCoordinate)
    // })

    function calcpointerWorldCoordinate() {
        if (!world.current) { return }
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
        if (!world.current) { return }
        if (!pointerWorldCoordinate.current) { return }
        console.log({ ...pointerWorldCoordinate.current, z: pointerWorldCoordinate.current.z - 0.5 }, worldCoordToMatrix(worldSize.current!, pointerWorldCoordinate.current))
        // @ts-expect-error
        focusedMatrixCoordinate.current = worldCoordToMatrix(worldSize.current!, pointerWorldCoordinate.current!)
        // @ts-expect-error
        focusedWorldCoordinate.current = pointerWorldCoordinate.current
    }

    // Calc character rotation angle (direction)
    function mouseMove() {
        console.log('mousemove')

        // @ts-expect-error
        pointerWorldCoordinate.current = calcpointerWorldCoordinate() || pointerWorldCoordinate.current
        
        if (!pointerWorldCoordinate.current) { return }
        if (!currentWorldCoordinate) { return }
        if (direction.current === null) { return }

        // Angle between object and mouse
        const angle = Math.atan2(
            pointerWorldCoordinate.current.z - currentWorldCoordinate.z,
            pointerWorldCoordinate.current.x - currentWorldCoordinate.x
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

        // @ts-expect-error
        direction.current = clamp(targetAngle, minAngle.value, maxAngle.value)
    }

    return <></>
}

export default Controller