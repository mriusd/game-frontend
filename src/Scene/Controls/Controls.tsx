import React from "react"

import * as THREE from "three"
import { useFrame, useThree } from "@react-three/fiber"
import { Box } from "@react-three/drei"

import { angleToVector } from "../utils/angleToVector"

import { useBackpack } from "Scene/UserInterface3D/Backpack/useBackpack"
import { useCore } from "Scene/useCore"
import { useUi } from "Scene/UserInterface3D/useUI"
import { useFighter } from "Scene/Fighter/useFighter"
import { useCloud } from "EventCloud/useCloud"
import { useControls } from "./useControls"

const color = new THREE.Color()

const Controls = React.memo(function Controls() {
    const eventsNode = useUi(state => state.eventsNode)
    const move = useFighter(state => state.move)
    const [isOccupiedCoordinate] = useCore(state => [state.isOccupiedCoordinate])
    const canvas = useThree(state => state.gl.domElement)
    const isHolding = React.useRef(false)
    const updateFighterDirection = useCloud(state => state.updateFighterDirection)
    const [calcDirection, setPointerCoordinate, setDirection] = useControls(state => [state.calcDirection, state.setPointerCoordinate, state.setDirection])
    
    const intersectionPlane = React.useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))
    const intersection = React.useRef(new THREE.Vector3())

    const [worldCoordToMatrix, matrixCoordToWorld] = useCore(state => [state.worldCoordToMatrix, state.matrixCoordToWorld])
    const boxRef = React.useRef<THREE.Mesh>()

    useFrame(({ raycaster, camera, pointer }) => {
        if (useCore.getState().hoveredItems.length) { return }
        if (useBackpack.getState().isOpened) { return }

        raycaster.setFromCamera(pointer, camera)
        const intersected = raycaster.ray.intersectPlane(intersectionPlane.current, intersection.current)
        if (intersected) { setPointerCoordinate(intersected) }

        if (isHolding.current) {
            move(useControls.getState().pointerCoordinate)
        }

        updatePointerHelper()
    })

    React.useEffect(() => {
        if (!eventsNode.current) { return }
        eventsNode.current.addEventListener("mousedown", mouseDown)
        eventsNode.current.addEventListener("mousemove", mouseMove)
        eventsNode.current.addEventListener("mouseup", mouseUp)
        return () => {
            eventsNode.current.removeEventListener("mousedown", mouseDown)
            eventsNode.current.removeEventListener("mousemove", mouseMove)
            eventsNode.current.removeEventListener("mouseup", mouseUp)
        }
    }, [eventsNode.current])
    const mouseDown = React.useCallback((e: MouseEvent) => {
        if (e.target !== canvas) { return }
        if (useCore.getState().hoveredItems.length) { return }
        if (useBackpack.getState().isOpened) { return }

        isHolding.current = true
        move(useControls.getState().pointerCoordinate)
    }, [])
    const mouseMove = React.useCallback(() => {
        if (useFighter.getState().isMoving) { return }
        if (useCore.getState().hoveredItems.length) { return }
        const direction = calcDirection()
        if (!direction) { return }
        setDirection(direction)
        const { x, z } = angleToVector(direction)
        updateFighterDirection({ dx: x, dz: z })
    }, [])
    const updatePointerHelper = React.useCallback(() => {
        const coordinate = useControls.getState().pointerCoordinate
        if (!coordinate) { return }
        const matrixPointerCoordinate = worldCoordToMatrix(coordinate)
        const pointerCoordinate = matrixCoordToWorld(matrixPointerCoordinate)
        const color = isOccupiedCoordinate(matrixPointerCoordinate) ? 0xFF0000 : 0x00FF00
        
        const isItems = !!useCore.getState().hoveredItems.length
        boxRef.current.position.set(pointerCoordinate.x, 0.001, pointerCoordinate.z)
        if (isItems) {
            // @ts-expect-error
            boxRef.current.material.color.setHex(0x000000)
        } else {
            // @ts-expect-error
            boxRef.current.material.color.setHex(color)
        }

        // // @ts-expect-error
        // boxRef.current.material.opacity = isItems ? 0 : .5
    }, [])

    const mouseUp = React.useCallback(() => { isHolding.current = false }, [])

    return (
        <group>
            <Box ref={boxRef} args={[1, .01, 1]}>
                <meshBasicMaterial transparent={true} />
            </Box>
        </group>
    )

})

export default Controls