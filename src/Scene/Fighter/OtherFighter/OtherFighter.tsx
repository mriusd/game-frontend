import * as THREE from 'three'
import React from "react"

import type { Fighter } from 'interfaces/fighter.interface'
import type { WorldCoordinate } from 'interfaces/coordinate.interface'

import Tween from 'Scene/utils/tween/tween'
import HealthBar from 'Scene/components/HealthBar'
import Name from 'Scene/components/Name'
import FighterModel from '../components/FighterModel/FighterModel'
import LastMessage from '../components/LastMessage'

import { useCore } from "Scene/useCore"

import { useActions } from './hooks/useActions'
import { usePointerEvents } from './hooks/usePointerEvents'
import { useFighterSkin } from '../hooks/useFighterSkin'
import { useEquipmentChange } from '../hooks/useEquipmentChange'

import { useEvent } from 'Scene/hooks/useEvent'
import { useSkillEffects } from '../hooks/useSkillEffects/useSkillEffects'

import { getMoveDuration } from 'Scene/utils/getMoveDuration'
import { isEqualCoord } from 'Scene/utils/isEqualCoord'

import { Box } from '@react-three/drei'

interface Props { fighter: Fighter }
const OtherFighter = React.memo(function OtherFighter({ fighter }: Props) {
    // Used to set spawn coord without tweening from x:0,z:0
    const spawned = React.useRef<boolean>(false)
    const matrixCoordToWorld = useCore(state => state.matrixCoordToWorld)

    const fighterRef = React.useRef<THREE.Mesh | null>(null)
    const { model, animations } = useFighterSkin('man')

    // const isMoving = React.useRef<boolean>(false)
    const [isMoving, setIsMoving] = React.useState(false)
    const { setAction, action } = useActions(animations, fighterRef)

    const {
        nameColor,
        handlePointerEnter,
        handlePointerLeave,
        handleLeftClick
    } = usePointerEvents(fighter)

    const { effects, play: playSkillEffect } = useSkillEffects()

    // Fill changed fighter properties
    React.useEffect(() => {
        if (!fighterRef.current) { return }
        // console.log(`[NPC]: npc with id '${npc?.id}' updated`, npc)
        if (fighter?.isDead) {
            spawned.current = false
            setAction('die', fighter)
            // handlePointerLeave()
            return 
        }
        if (fighter?.coordinates) {
            if (!spawned.current) return void (spawned.current = true), setPosition(matrixCoordToWorld(fighter?.coordinates), fighterRef.current), setAction('stand', fighter) 
            move(matrixCoordToWorld(fighter?.coordinates), fighterRef.current)
        }
        if (fighter?.direction) {
            fighterRef.current.rotation.y = Math.atan2(fighter.direction.dx, fighter.direction.dz)
        }
    }, [ fighter ])

    const actionTimeout = React.useRef<any>(0)
    const move = React.useCallback((to: WorldCoordinate, ref: THREE.Mesh) => {
        if (isMoving) { return }

        if (isEqualCoord(ref.position, to)) { return }

        clearTimeout(actionTimeout.current)
        setAction('run', fighter)
        // isMoving.current = true
        setIsMoving(true)
        const current = { x: ref.position.x, z: ref.position.z }
        Tween.to(current, to,
            {
                duration: getMoveDuration(fighter.movementSpeed, current, to),
                onChange: (state: { value: WorldCoordinate }) => void setPosition(state.value, ref),
                onComplete: () =>  { 
                    // isMoving.current = false
                    setIsMoving(false)
                    actionTimeout.current = setTimeout(() => { action.current.includes('run') && setAction('stand', fighter) }, 50) 
                } 
            }
        )
    }, [isMoving])
    const setPosition = React.useCallback((to: WorldCoordinate, ref: THREE.Mesh) => {
        ref.position.x = to.x
        ref.position.z = to.z
    }, [])

    // Change Animations On Equipment Change
    useEquipmentChange(fighter, (changes) => {
        if (changes.changedSlots.includes(6) || changes.changedSlots.includes(7)) {
            if (action.current.includes('stand')) { setAction('stand', fighter) }
        }
    })

    // Animate Skills on Server Event
    useEvent(fighter, 'skill', (event, removeEvent) => {
        playSkillEffect(event)
        setAction('attack', fighter)
        removeEvent(event)
    })

    return (
        <group name="other-fighter">
            {
                !fighter.isDead ? (<>
                    <Name value={fighter.name} target={fighterRef} offset={-1.8} />
                    <HealthBar object={fighter} target={fighterRef} offset={-1.6} />
                    <LastMessage offset={-1.5} fighter={fighter} target={fighterRef} />
                </>)
                : <></>
            }
            <FighterModel
                ref={fighterRef}
                model={model}
                fighter={fighter}
                onPointerMove={handlePointerEnter}
                onPointerLeave={handlePointerLeave}
                onPointerDown={handleLeftClick}
                isMove={isMoving}
            >
                {/* TODO: Add HeatBox in 3d tool */}
                <Box visible={false} args={[2.5,15,2.5]}/>
                {effects.map((_, i) => <primitive object={_} key={i} />)}
            </FighterModel>
        </group>
    )
})

export default OtherFighter