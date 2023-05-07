import * as THREE from "three"
import { clamp } from "three/src/math/MathUtils"
import { RefObject, useState, memo } from "react" 
import { useRef, useEffect } from "react"
import { Object3D } from "three"
import { useSceneContext } from "store/SceneContext"
import { useFrame, useThree } from "@react-three/fiber"
import { worldCoordToMatrix } from "Scene/utils/worldCoordToMatrix"
import { Coordinate } from "interfaces/coordinate.interface"

const ANGLE_STEP = Math.PI / 4 // 8 directions
const ANGLE_RANGE = Math.PI / 8 // Set a range of angles to rotate towards
const MIN_ANGLE = Math.PI / 6 // Min angle on which detect rotation

const saveDirection = { value: 0 }
const savePointerWorldCoordinate = { value: null }
const saveCurrentWorldCoordinate = { value: null }
const saveIsMoving = { value: false }

interface Props { world: RefObject<Object3D | null> }
const Controller = memo(function Controller({ world }: Props) {
    const center = new THREE.Vector3()
    const { 
        worldSize, 
        currentWorldCoordinate,
        nextWorldCoordinate,

        isMoving,

        controller: {
            setDirection,
            setFocusedMatrixCoordinate,
            setFocusedWorldCoordinate,
            setPointerWorldCoordinate,
            pointerWorldCoordinate
        }
    } = useSceneContext()
    const raycaster = useRef(new THREE.Raycaster())
    const pointer = useThree(state => state.pointer)
    const camera = useThree(state => state.camera)
    const [isHolding, setIsHolding] = useState(false)


    useFrame(() => {
        if (isHolding) {
            if (!world.current) { return }
            if (!savePointerWorldCoordinate.value) { return }
            const coordinate = calcPointerCoordinate()
            if (!coordinate) { return }
            setFocusedMatrixCoordinate(worldCoordToMatrix(worldSize.current, savePointerWorldCoordinate.value))
            setFocusedWorldCoordinate(savePointerWorldCoordinate.value)
        }
    })

    useEffect(() => {
        saveCurrentWorldCoordinate.value = currentWorldCoordinate

        const coordinate = calcPointerCoordinate()
        if (!coordinate) { return }
        savePointerWorldCoordinate.value = coordinate
        setPointerWorldCoordinate(savePointerWorldCoordinate.value)
    }, [currentWorldCoordinate])

    useEffect(() => {
        saveIsMoving.value = isMoving
    }, [isMoving])

    function calcPointerCoordinate() {
        if (!world.current) { return null }

        raycaster.current.setFromCamera(pointer, camera)
        const intersections = raycaster.current.intersectObject(world.current)
        const point = intersections[0]?.point
        if (!point) { return null }
        return point
    }

    useEffect(() => {
        const scene = document.querySelector(".scene")
        if (!scene) { return }
        scene.addEventListener("mousedown", mouseDown)
        scene.addEventListener("mousemove", mouseMove)
        scene.addEventListener("mouseup", mouseUp)
        return () => {
            scene.removeEventListener("mousedown", mouseDown)
            scene.removeEventListener("mousemove", mouseMove)
            scene.removeEventListener("mouseup", mouseUp)
        }
    }, [])

    // Calc direction on character move, depending on next position
    useEffect(() => {
        calcDirection(nextWorldCoordinate)
    }, [nextWorldCoordinate])

    // Set world mouse position
    function mouseDown() {
        setIsHolding(true)
        if (!world.current) { return }
        if (!savePointerWorldCoordinate.value) { return }
        if (!saveCurrentWorldCoordinate.value) { return }
        const coordinate = calcPointerCoordinate()
        if (!coordinate) { return }
        setFocusedMatrixCoordinate(worldCoordToMatrix(worldSize.current, savePointerWorldCoordinate.value))
        setFocusedWorldCoordinate(savePointerWorldCoordinate.value)
    }

    // Calc character rotation angle (direction)
    function mouseMove() {
        const coordinate = calcPointerCoordinate()
        if ( !coordinate ) { return }
        if (!saveCurrentWorldCoordinate.value) { return }
        savePointerWorldCoordinate.value = coordinate
        setPointerWorldCoordinate(savePointerWorldCoordinate.value)
        // console.log(savePointerWorldCoordinate.value, worldCoordToMatrix(worldSize.current, savePointerWorldCoordinate.value))

        if (saveIsMoving.value) { return }
        calcDirection(savePointerWorldCoordinate.value)
    }

    function calcDirection(worldCoordinate: Coordinate) {
        if (!worldCoordinate) { return }
        if (!saveCurrentWorldCoordinate.value) { return }

        // Angle between object and mouse
        const angle = Math.atan2(
            worldCoordinate.x - saveCurrentWorldCoordinate.value.x,
            worldCoordinate.z - saveCurrentWorldCoordinate.value.z,
        )

        const targetAngle = Math.round(angle / ANGLE_STEP) * ANGLE_STEP

        const angleDelta = angle - saveDirection.value
        const minAngle = { value: saveDirection.value - ANGLE_RANGE }
        const maxAngle = { value: saveDirection.value + ANGLE_RANGE }

        if (angleDelta > MIN_ANGLE) {
            maxAngle.value += angleDelta
        }
        else if (angleDelta < -MIN_ANGLE) {
            minAngle.value += angleDelta
        } else {
            return
        }
        saveDirection.value = clamp(targetAngle, minAngle.value, maxAngle.value)
        setDirection(saveDirection.value)
    }

    function mouseUp() {
        setIsHolding(false)
    }

    return <></>
})

export default Controller