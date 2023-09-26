import * as THREE from "three"
import { memo, useCallback } from "react"
import { useRef, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Box } from "@react-three/drei"
import { useBackpack } from "Scene/UserInterface3D/Backpack/useBackpack"
import { angleToVector } from "../utils/angleToVector"

import { useCore } from "Scene/useCore"
import { useUi } from "Scene/UserInterface3D/useUI"
import { useFighter } from "Scene/Fighter/useFighter"
import { useCloud } from "EventCloud/useCloud"
import { useControls } from "./useControls"

// TODO: Remove Raycaster, calc vai GEOMETRY instead

const Controller = memo(function Controller() {
    const eventsNode = useUi(state => state.eventsNode)
    const move = useFighter(state => state.move)
    const [isOccupiedCoordinate, groundObject] = useCore(state => [state.isOccupiedCoordinate, state.groundObject])
    const canvas = useThree(state => state.gl.domElement)
    const isHolding = useRef(false)
    const updateFighterDirection = useCloud(state => state.updateFighterDirection)
    const [calcDirection, setPointerCoordinate, setDirection] = useControls(state => [state.calcDirection, state.setPointerCoordinate, state.setDirection])
    
    const [worldCoordToMatrix, matrixCoordToWorld] = useCore(state => [state.worldCoordToMatrix, state.matrixCoordToWorld])
    const boxRef = useRef<THREE.Mesh>()

    // TODO: Make Raycaster Cheaper
    useFrame(({ raycaster }) => {
        if (useCore.getState().hoveredItems.length) { return }
        if (useBackpack.getState().isOpened) { return }

        const intersected = calcPointerCoordinate(raycaster)
        if (intersected) { setPointerCoordinate(intersected) }

        if (isHolding.current) {
            // mouseMove()
            move(useControls.getState().pointerCoordinate)
        }
    })
    // 
    const calcPointerCoordinate = useCallback((raycaster: THREE.Raycaster) => {
        if (!groundObject.current) { return null }

        const intersections = raycaster.intersectObject(groundObject.current)
        const point = intersections[0]?.point
        if (!point) { return null }

        return point
    }, [])

    useEffect(() => {
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
    const mouseDown = useCallback((e: MouseEvent) => {
        if (e.target !== canvas) { return }
        isHolding.current = true
        
        if (useCore.getState().hoveredItems.length) { return }
        if (useBackpack.getState().isOpened) { return }

        move(useControls.getState().pointerCoordinate)
    }, [])
    const mouseMove = useCallback(() => {
        // Indicates Pointer Position (For Dev Purpose)
        updatePointerHelper()

        const direction = calcDirection()
        if (!direction) { return }
        setDirection(direction)
        const { x, z } = angleToVector(direction)
        updateFighterDirection({ dx: x, dz: z })

        function updatePointerHelper() {
            const coordinate = useControls.getState().pointerCoordinate
            if (!coordinate) { return }
            const pointerCoordinate = matrixCoordToWorld(worldCoordToMatrix(coordinate))
            const color = isOccupiedCoordinate(pointerCoordinate) ? 0xFF0000 : 0x00FF00
            
            const isItems = !!useCore.getState().hoveredItems.length
            boxRef.current.position.set(pointerCoordinate.x, 0.001, pointerCoordinate.z)
            // @ts-expect-error
            boxRef.current.material.color = isItems ? 0x000000 : color
            // @ts-expect-error
            boxRef.current.material.opacity = isItems ? 0 : .5
        }
    }, [])
    const mouseUp = useCallback(() => { isHolding.current = false }, [])

    return (
        <group>
            <Box ref={boxRef} args={[1, .01, 1]}>
                <meshBasicMaterial /*color={occupiedColor} opacity={occupiedOpacity}*/ transparent={true} />
            </Box>
        </group>
    )

})

export default Controller