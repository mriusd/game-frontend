import * as THREE from 'three'
import React from "react"

import type { Fighter } from 'interfaces/fighter.interface'
import type { WorldCoordinate } from 'interfaces/coordinate.interface'

import Tween from 'Scene/utils/tween/tween'
import HealthBar from 'Scene/components/HealthBar'
import Name from 'Scene/components/Name'
import FighterModel from '../components/FighterModel'
import LastMessage from '../components/LastMessage'

import { useCore } from "Scene/useCore"

import { useActions } from './hooks/useActions'
import { usePointerEvents } from './hooks/usePointerEvents'
import { useShaderedFighter } from '../utils/getFighterModel'

import { getMoveDuration } from 'Scene/utils/getMoveDuration'
import { isEqualCoord } from 'Scene/utils/isEqualCoord'

interface Props { fighter: Fighter }
const OtherFighter = React.memo(function OtherFighter({ fighter }: Props) {
    // Used to set spawn coord without tweening from x:0,z:0
    const spawned = React.useRef<boolean>(false)
    const matrixCoordToWorld = useCore(state => state.matrixCoordToWorld)

    const fighterRef = React.useRef<THREE.Mesh | null>(null)
    const { model, animations } = useShaderedFighter('man')

    const isMoving = React.useRef<boolean>(false)
    const { setAction, action } = useActions(animations, fighterRef)

    // Fill changed fighter properties
    React.useEffect(() => {
        if (!fighterRef.current) { return }
        // console.log(`[NPC]: npc with id '${npc?.id}' updated`, npc)
        if (fighter?.isDead) {
            spawned.current = false
            setAction('die')
            // handlePointerLeave()
            return 
        }
        if (fighter?.coordinates) {
            if (!spawned.current) return void (spawned.current = true), setPosition(matrixCoordToWorld(fighter?.coordinates), fighterRef.current), setAction('stand') 
            move(matrixCoordToWorld(fighter?.coordinates), fighterRef.current)
        }
        if (fighter?.direction) {
            fighterRef.current.rotation.y = Math.atan2(fighter.direction.dx, fighter.direction.dz)
        }
    }, [ fighter ])

    const move = React.useCallback((to: WorldCoordinate, ref: THREE.Mesh) => {
        if (isMoving.current) { return }

        if (isEqualCoord(ref.position, to)) { return }

        // Used over here instead isMoving useEffect cuz it rms a little delay which looks weird
        // setAction('run')
        // 
        isMoving.current = true
        const current = { x: ref.position.x, z: ref.position.z }
        Tween.to(current, to,
            {
                duration: getMoveDuration(fighter.movementSpeed, current, to),
                onChange: (state: { value: WorldCoordinate }) => void setPosition(state.value, ref),
                onComplete: () => void (isMoving.current = false),
            }
        )
    }, [])
    const setPosition = React.useCallback((to: WorldCoordinate, ref: THREE.Mesh) => {
        ref.position.x = to.x
        ref.position.z = to.z
    }, [])

    return (
        <group name="other-fighter">
            {
                !fighter.isDead ? (<>
                    <Name value={fighter.name} target={fighterRef} offset={.4} />
                    <HealthBar object={fighter} target={fighterRef} offset={.7} />
                    <LastMessage offset={.8} fighter={fighter} target={fighterRef} />
                </>)
                : <></>
            }
            <FighterModel
                ref={fighterRef}
                model={model}
                fighter={fighter}
            >
                {/* <TwistingSlash renderEffect={renderEffect} onEffectComplete={() => renderEffect.current = false}/> */}
            </FighterModel>
        </group>
    )
})

export default OtherFighter