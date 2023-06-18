import * as THREE from "three"
import { clamp } from "three/src/math/MathUtils"
import { RefObject, useState, memo, useMemo } from "react" 
import { useRef, useEffect } from "react"
import { Object3D } from "three"
import { useSceneContext } from "store/SceneContext"
import { useFrame, useThree } from "@react-three/fiber"
import { worldCoordToMatrix } from "Scene/utils/worldCoordToMatrix"
import { matrixCoordToWorld } from "./utils/matrixCoordToWorld"
import { Coordinate } from "interfaces/coordinate.interface"
import { Box } from "@react-three/drei"
import { isOccupiedCoordinate } from "./utils/isOccupiedCoordinate"
import { useUiStore } from "store/uiStore"

const ANGLE_STEP = Math.PI / 4 // 8 directions
const ANGLE_RANGE = Math.PI / 8 // Set a range of angles to rotate towards
const MIN_ANGLE = Math.PI / 6 // Min angle on which detect rotation

const saveDirection = { value: 0 }
const savePointerWorldCoordinate = { value: null }
const saveCurrentWorldCoordinate = { value: null }
const saveIsMoving = { value: false }
const saveHoveredItems = { value: [] }

interface Props { world: RefObject<Object3D | null> }
const Controller = memo(function Controller({ world }: Props) {
    const center = new THREE.Vector3()
    const { 
        html,
        worldSize, 
        currentWorldCoordinate,
        nextWorldCoordinate,

        isMoving,
        hoveredItems,

        controller: {
            setDirection,
            setFocusedMatrixCoordinate,
            setFocusedWorldCoordinate,
            setPointerWorldCoordinate,
            pointerWorldCoordinate,
        },
        occupiedCoords
    } = useSceneContext()
    const raycaster = useRef(new THREE.Raycaster())
    const pointer = useThree(state => state.pointer)
    const camera = useThree(state => state.camera)
    const [isHolding, setIsHolding] = useState(false)

    const [testWorldCoordinates, setTestWorldCoordinates] = useState<Coordinate>({ x: 0, z: 0 })
    const [testMatrixCoordinates, setTestMatrixCoordinates] = useState<Coordinate>({ x: 0, z: 0 })
    const isOccupiedColorForTest = useMemo(() => {
        // console.log(occupiedCoords, testMatrixCoordinates)
        const colorOccupied = isOccupiedCoordinate(occupiedCoords, testMatrixCoordinates) ? 0xFF0000 : 0x00FF00
        return hoveredItems.length ? 0x000000 : colorOccupied
    }, [ testMatrixCoordinates, occupiedCoords, hoveredItems ])


    useFrame(() => {
        if (isHolding) {
            if (!world.current) { return }
            if (!savePointerWorldCoordinate.value) { return }
            const coordinate = calcPointerCoordinate()
            if (!coordinate) { return }
            if (saveHoveredItems.value?.length) { return }
            if (useUiStore.getState().isBackpackOpened) { return }
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
    useEffect(() => {
        saveHoveredItems.value = hoveredItems
    }, [hoveredItems])

    function calcPointerCoordinate() {
        if (!world.current) { return null }

        raycaster.current.setFromCamera(pointer, camera)
        const intersections = raycaster.current.intersectObject(world.current)
        const point = intersections[0]?.point
        if (!point) { return null }

        // for testing
        setTestMatrixCoordinates(worldCoordToMatrix(worldSize.current, point))
        setTestWorldCoordinates(matrixCoordToWorld(worldSize.current, worldCoordToMatrix(worldSize.current, point)))
        // 

        if (saveHoveredItems.value?.length) { return null }
        if (useUiStore.getState().isBackpackOpened) { return }

        return point
    }

    useEffect(() => {
        if (!html) { return }
        html.addEventListener("mousedown", mouseDown)
        html.addEventListener("mousemove", mouseMove)
        html.addEventListener("mouseup", mouseUp)
        return () => {
            html.removeEventListener("mousedown", mouseDown)
            html.removeEventListener("mousemove", mouseMove)
            html.removeEventListener("mouseup", mouseUp)
        }
    }, [html])

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
        if (saveHoveredItems.value?.length) { return }
        setFocusedMatrixCoordinate(worldCoordToMatrix(worldSize.current, savePointerWorldCoordinate.value))
        setFocusedWorldCoordinate(savePointerWorldCoordinate.value)
    }

    // Calc character rotation angle (direction)
    function mouseMove() {
        const coordinate = calcPointerCoordinate()
        // if ( !coordinate ) { return } 
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

    return (
        <group>
            <Box position={[testWorldCoordinates.x, 0, testWorldCoordinates.z]} args={[1, .01, 1]}>
                <meshBasicMaterial color={isOccupiedColorForTest} opacity={.5} transparent={true} />
            </Box>
        </group>
    )

})

export default Controller