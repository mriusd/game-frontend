import { useEffect, useState, useRef, useMemo, memo } from "react"
import Tween from "../utils/tween/tween"
import { Coordinate } from "interfaces/coordinate.interface"
import { useSceneContext } from "store/SceneContext"
import { Box, useAnimations } from "@react-three/drei"
import { getMoveDuration } from '../utils/getMoveDuration'
import HealthBar from '../components/HealthBar'
import type { Fighter } from 'interfaces/fighter.interface'
import Name from '../components/Name'
import { setCursorPointer } from '../utils/setCursorPointer'
import { getShaderedNpc } from "./utils/getShaderedNpc"
import { shallow } from "zustand/shallow"
import { useCore } from "store/useCore"
import { isEqualCoord } from "./utils/isEqualCoord"

interface Props { npc: Fighter }
const Npc = memo(function Npc({ npc }: Props) {
    // const { html, setTarget, fighter, setHoveredItems, setSceneObject } = useSceneContext()
    const matrixCoordToWorld = useCore(state => state.matrixCoordToWorld)


    const currentWorldPosition = useRef<Coordinate | null>(null)
    const targetWorldPosition = useRef<Coordinate | null>(null)
    const isMoving = useRef<boolean>(false)


    const npcRef = useRef<THREE.Mesh | null>(null)
    const nameColor = useRef<0xFFFFFF | 0xFF3300>(0xFFFFFF)
    const { model, animations } = useMemo(() => getShaderedNpc(npc), [npc])
    const { mixer, actions } = useAnimations(animations, npcRef)

    // Fill changed npc properties
    useEffect(() => {
        if (!npcRef.current) { return }
        // console.log(`[NPC]: npc with id '${npc?.id}' updated`, npc)
        if (npc?.isDead) {

            // Remove hover on delete
            handlePointerLeave()
            return 
        }
        if (npc?.coordinates) {
            targetWorldPosition.current = matrixCoordToWorld(npc?.coordinates)
            if (!currentWorldPosition.current) {
                currentWorldPosition.current = targetWorldPosition.current
            }
        }
        if (npc?.direction) {
            npcRef.current.rotation.y = Math.atan2(npc.direction.dx, npc.direction.dz)
        }
    }, [ npc ])

    // Move npc
    useEffect(() => {
        if (!npcRef.current) { return }
        if (!targetWorldPosition.current || !currentWorldPosition.current) { return }
        if (isMoving.current) { return }
        // console.log('targetWorldPosition.current', currentWorldPosition.current, targetWorldPosition.current, npcRef.current.position)

        const isEqual = isEqualCoord(currentWorldPosition.current, targetWorldPosition.current)
        if (isEqual) { return }

        // console.log('Not Equal')


        isMoving.current = true
        // const currentWorldPosition = { x: npcRef.current.position.x, z: npcRef.current.position.z }
        // console.log('currentWorldPosition', currentWorldPosition, npcRef.current.position)
        Tween.to(currentWorldPosition.current, targetWorldPosition.current,
            {
                duration: getMoveDuration(npc.movementSpeed, currentWorldPosition.current, targetWorldPosition.current),
                onChange(state: { value: Coordinate }) {
                    if (!npcRef.current) { return }
                    currentWorldPosition.current.x = state.value.x
                    currentWorldPosition.current.z = state.value.z
                    npcRef.current.position.x = state.value.x
                    npcRef.current.position.z = state.value.z
                },
                onComplete() {
                    if (!npcRef.current) { return }
                    currentWorldPosition.current.x = targetWorldPosition.current.x
                    currentWorldPosition.current.z = targetWorldPosition.current.z
                    isMoving.current = false
                },
            }
        )
    }, [ targetWorldPosition.current ])

    // useEffect(() => {
    //     if (!npcRef.current) { return }
    //     npcRef.current.position.x = currentWorldPosition.current.x
    //     npcRef.current.position.z = currentWorldPosition.current.z
    // }, [currentWorldPosition.current])
    console.log(npcRef.current)

    // Save ref to object to store & rm on unmount
    // useEffect(() => {
    //     if (npcRef.current) {
    //         setSceneObject(npc.id, npcRef.current, 'add')
    //     }
    //     return () => {
    //         setSceneObject(npc.id, npcRef.current, 'remove')
    //     }
    // }, [npcRef.current])

    // Set target & hover
    const handlePointerEnter = () => {
        nameColor.current = 0xFF3300
        // setCursorPointer(html, true)
        // setHoveredItems(npc, 'add')
    }
    const handlePointerLeave = () => {
        nameColor.current = 0xFFFFFF
        // setCursorPointer(html, false)
        // setHoveredItems(npc, 'remove')
    }
    const handleLeftClick = () => {
        // setTarget(npc, fighter.skills[0])
    }
    // const handleRightClick = (event: ThreeEvent<PointerEvent>) => {
    //     // onContextMenu
    //     console.log('Right CLick', event)
    //     setTarget(npc, fighter.skills[1])
    // }

    return (
        // <group name='npc'>
        //     {/* <Name value={npc?.name} target={npcRef} offset={.05} color={nameColor.current} /> */}
        //     {/* <HealthBar object={npc} target={npcRef} offset={.45} /> */}
        //     <primitive 
        //         onPointerMove={handlePointerEnter}
        //         onPointerLeave={handlePointerLeave}
        //         onPointerDown={handleLeftClick}
        //         ref={npcRef}
        //         object={model}
        //     >
        //     </primitive>
        // </group>
        <Box args={[1, 1, 1]} ref={npcRef} />
    )
})

export default Npc