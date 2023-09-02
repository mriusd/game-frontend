import * as THREE from 'three'
import { useEffect, useRef, useMemo, memo, useCallback } from "react"
import Tween from "../utils/tween/tween"
import { Coordinate } from "interfaces/coordinate.interface"
import { getMoveDuration } from '../utils/getMoveDuration'
import HealthBar from '../components/HealthBar'
import type { Fighter } from 'interfaces/fighter.interface'
import Name from '../components/Name'
import { getShaderedNpc } from "./utils/getShaderedNpc"
import { useCore } from "store/useCore"
import { isEqualCoord } from 'Scene/utils/isEqualCoord'
import HeatBox from 'Scene/components/HeatBox'

import { useActions } from './hooks/useActions'
import { useSkillEvent } from './hooks/useSkillEvent'
import { usePointerEvents } from './hooks/usePointerEvents'

interface Props { npc: Fighter }
const Npc = memo(function Npc({ npc }: Props) {
    // Used to set spawn coord without tweening from x:0,z:0
    const spawned = useRef<boolean>(false)
    const matrixCoordToWorld = useCore(state => state.matrixCoordToWorld)

    const npcRef = useRef<THREE.Mesh | null>(null)
    const { model, animations } = useMemo(() => getShaderedNpc(npc), [])

    const isMoving = useRef<boolean>(false)
    const { setAction, action } = useActions(animations, npcRef)

    const {
        nameColor,
        handlePointerEnter,
        handlePointerLeave,
        handleLeftClick
    } = usePointerEvents(npc)

    // Fill changed npc properties
    useEffect(() => {
        if (!npcRef.current) { return }
        // console.log(`[NPC]: npc with id '${npc?.id}' updated`, npc)
        if (npc?.isDead) {
            spawned.current = false
            setAction('die')
            handlePointerLeave()
            return 
        }
        if (npc?.coordinates) {
            if (!spawned.current) return void (spawned.current = true), setNpcPosition(matrixCoordToWorld(npc?.coordinates), npcRef.current), setAction('stand') 
            moveNpc(matrixCoordToWorld(npc?.coordinates), npcRef.current)
        }
        if (npc?.direction) {
            npcRef.current.rotation.y = Math.atan2(npc.direction.dx, npc.direction.dz)
        }
    }, [ npc ])

    const moveNpc = useCallback((to: Coordinate, ref: THREE.Mesh) => {
        if (isMoving.current) { return }

        if (isEqualCoord(ref.position, to)) { return }

        // Used over here instead isMoving useEffect cuz it rms a little delay which looks weird
        setAction('run')
        // 
        isMoving.current = true
        const current = { x: ref.position.x, z: ref.position.z }
        Tween.to(current, to,
            {
                duration: getMoveDuration(npc.movementSpeed, current, to),
                onChange: (state: { value: Coordinate }) => void setNpcPosition(state.value, ref),
                onComplete: () => void (isMoving.current = false),
            }
        )
    }, [])
    const setNpcPosition = useCallback((to: Coordinate, ref: THREE.Mesh) => {
        ref.position.x = to.x
        ref.position.z = to.z
    }, [])

    // Add delay to prevent animation from stop between different chained tweens
    const timeout = useRef<any>(0)
    useEffect(() => {
        clearTimeout(timeout.current)
        if (isMoving.current) return
        timeout.current = setTimeout(() => void action.current === 'run' && setAction('stand'), 50)
    }, [isMoving.current])


    useSkillEvent(npc, (event, removeEvent) => {
        setAction('attack')
        removeEvent(event)
    })

    return (
        <group 
            name='npc'
        >
            {
                !npc.isDead ? (<>
                    <Name value={npc?.name} target={npcRef} offset={.2} color={nameColor.current} />
                    <HealthBar object={npc} target={npcRef} offset={.5} />
                </>)
                : <></>
            }
            <primitive 
                ref={npcRef}
                object={model}
                onPointerMove={handlePointerEnter}
                onPointerLeave={handlePointerLeave}
                onPointerDown={handleLeftClick}
            />
        </group>
    )
})

export default Npc