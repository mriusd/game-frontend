import { Fighter } from "interfaces/fighter.interface"
import FighterModel from "./FighterModel"
import { useGLTFLoaderStore } from "Scene/GLTFLoader/GLTFLoaderStore"
import { useMemo, useRef, useState, useEffect, memo } from "react"
import HealthBar from "Scene/components/HealthBar"
import { Box, useAnimations } from "@react-three/drei"
import type { Coordinate } from "interfaces/coordinate.interface"
import { useSceneContext } from "store/SceneContext"
import { matrixCoordToWorld } from "Scene/utils/matrixCoordToWorld"
import Tween from "Scene/utils/tween/tween"
import { getMoveDuration } from "Scene/utils/getMoveDuration"
import { getRunAction, getStandAction, getAttackAction } from "./utils/getAction"
import { useEventCloud } from "EventCloudContext"
import TwistingSlash from "./Skills/TwistingSlash/TwistingSlash"

interface Props { fighter: Fighter }
const OtherFighter = memo(function OtherFighter({ fighter }: Props) {

    const gltf = useMemo(() => useGLTFLoaderStore.getState().models.current.fighter_man, [])

    const animationTarget = useRef()
    const { mixer, actions } = useAnimations(gltf.animations, animationTarget)

    // Just for test
    // TODO: must be removed
    const { events, removeEvent } = useEventCloud()
    const { worldSize } = useSceneContext()
    const [spawned, setSpawned] = useState<boolean>(false)
    const [currentMatrixPosition, setCurrentMatrixPosition] = useState<Coordinate | null>(null)
    const [targetMatrixPosition, setTargetMatrixPosition] = useState<Coordinate | null>(null)
    const [targetWorldPosition, setTargetWorldPosition] = useState<Coordinate | null>(null)
    const [currentWorldPosition, setCurrentWorldPosition] = useState<Coordinate | null>(null)
    const [direction, setDirection] = useState<number>(0)
    // 
    const ENTER_TO_ISSTAYING_DELAY = 10 //ms
    const isMoving = useRef<boolean>(false)
    const isStaying = useRef<boolean>(true)

    // Fill changed npc properties
    useEffect(() => {
        if (fighter.coordinates) {
            // console.log('[NPC] Set position to,', npc.id, npc.coordinates, matrixCoordToWorld(worldSize.current, {...npc.coordinates}))
            setTargetMatrixPosition({ ...fighter?.coordinates })
        }
        if (fighter.direction) {
            setDirection(Math.atan2(fighter.direction.dx, fighter.direction.dz))
        }
    }, [fighter])


    // TODO: Fix, just for test
    const renderEffect = useRef(false)
    // 
    // TODO: This works wrong but just for test
    const attackTimeout = useRef<NodeJS.Timeout | null>(null)
    const speed = 1000
    useEffect(() => {
        if (!fighter) { return }
        events.forEach(currentEvent => {
            if (currentEvent.type === 'skill' && currentEvent?.fighter?.id === fighter.id) {
                if (actions) {
                    const attackAction = getAttackAction(actions, fighter, currentEvent.skill)
                    // TODO: Just for test
                    const isEmptyHand = !Object.keys(fighter.equipment).find(slotKey => (+slotKey === 6 || +slotKey === 7))
                    if (!isEmptyHand) {
                        renderEffect.current = true
                    }
                    // 
                    attackAction?.setDuration(speed / 1000).play()
                    clearTimeout(attackTimeout.current)
                    attackTimeout.current = setTimeout(() => {
                        attackAction?.stop()
                    }, speed)
                }
                removeEvent(currentEvent)
            }
        })
        // console.log('Fighter events', events)
    }, [events])
    // 

    // Move npc
    useEffect(() => {
        if (!targetMatrixPosition) { return }
        if (!worldSize.current) { return }
        if (isMoving.current) { return }

        const _targetWorldPosition = matrixCoordToWorld(worldSize.current, { ...targetMatrixPosition })
        setTargetWorldPosition(_targetWorldPosition)

        if (!spawned) {
            setCurrentMatrixPosition(targetMatrixPosition)
            setCurrentWorldPosition(matrixCoordToWorld(worldSize.current, { ...targetMatrixPosition }))
            setSpawned(true)
            return
        }

        if (!currentWorldPosition || !_targetWorldPosition) { return }
        if (currentWorldPosition.x !== _targetWorldPosition.x
            || currentWorldPosition.z !== _targetWorldPosition.z) {
            isMoving.current = true
            Tween.to(currentWorldPosition, _targetWorldPosition,
                {
                    duration: getMoveDuration(fighter.movementSpeed, currentMatrixPosition, targetMatrixPosition),
                    onChange(state: { value: Coordinate }) {
                        // console.log(state.value)
                        setCurrentWorldPosition(state.value)
                    },
                    onComplete() {
                        setCurrentMatrixPosition(targetMatrixPosition)
                        setCurrentWorldPosition(_targetWorldPosition)
                        isMoving.current = false
                    },
                }
            )
        }
    }, [targetMatrixPosition, currentMatrixPosition])

    
    // Add delay to prevent freeze on "checkpoint" when synchronising with server
    // On delayed mooving "true" we render fighter in the same position as server
    // Otherwise we render if fighter < 2 cells away from server
    const timeout = useRef<any>(0)
    useEffect(() => {
        // console.log(`Player ${fighter.id},`, `isMoving ${isMoving.current},`, `isStaying ${isStaying.current}`)
        clearTimeout(timeout.current)

        if (isMoving.current) {
            isStaying.current = false
            return
        }

        timeout.current = setTimeout(() => {
            isStaying.current = true
        }, ENTER_TO_ISSTAYING_DELAY) // delay
    }, [ isMoving.current ])

    // Toggle movement animation
    useEffect(() => {
        if (!actions || !fighter) { return }
        // console.log('[Fighter]: Toggle isMoving animation', mixer, actions)
        // console.log(actions)
        const { action: runAction, lastAction: lastRunAction } = getRunAction(actions, fighter)
        const { action: standAction, lastAction: lastStandAction } = getStandAction(actions, fighter)
        
        // TODO: do this another way
        // change after ill rewrite fighter
        // Reset old animations
        lastRunAction?.stop()
        lastStandAction?.stop()

        if (isStaying.current) {
            runAction?.fadeOut(.1).stop()
            standAction?.play()
        } else {
            standAction?.fadeOut(.1).stop()
            runAction?.setDuration(60 / fighter.movementSpeed * 3).play()
        }
    }, [ isStaying.current, actions, fighter ])

    if (!spawned) {
        return <></>
    }

    return (
        <group name="other-fighter">
            <HealthBar object={fighter} target={animationTarget} offset={.7} />
            <FighterModel
                ref={animationTarget}
                model={gltf.scene}
                fighter={fighter}
                position={[currentWorldPosition.x, 0, currentWorldPosition.z]}
                rotation={[0, direction, 0]}
            >
                <TwistingSlash renderEffect={renderEffect} onEffectComplete={() => renderEffect.current = false}/>
            </FighterModel>
        </group>
    )
})

export default OtherFighter