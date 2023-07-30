// @ts-expect-error 
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js'
import { useEffect, useState, useRef, useMemo, memo } from "react"
import { matrixCoordToWorld } from "./utils/matrixCoordToWorld"
import Tween from "./utils/tween/tween"
import { Coordinate } from "interfaces/coordinate.interface"
import { useSceneContext } from "store/SceneContext"
import { useAnimations } from "@react-three/drei"
import { getMoveDuration } from './utils/getMoveDuration'
import HealthBar from './components/HealthBar'
import type { Mesh } from 'three'
import type { Fighter } from 'interfaces/fighter.interface'
import Name from './components/Name'
import { setCursorPointer } from './utils/setCursorPointer'
import { useEventCloud } from 'EventCloudContext'
import { useGLTFLoaderStore } from './GLTFLoader/GLTFLoaderStore'

interface Props { npc: Fighter }
const Npc = memo(function Npc({ npc }: Props) {
    const { events, removeEvent } = useEventCloud()
    const { worldSize, html, setTarget, fighter, setHoveredItems, setSceneObject, getSceneObject } = useSceneContext()
    const [spawned, setSpawned] = useState<boolean>(false)
    const [currentMatrixPosition, setCurrentMatrixPosition] = useState<Coordinate | null>(null)
    const [targetMatrixPosition, setTargetMatrixPosition] = useState<Coordinate | null>(null)
    const [targetWorldPosition, setTargetWorldPosition] = useState<Coordinate | null>(null)
    const [currentWorldPosition, setCurrentWorldPosition] = useState<Coordinate | null>(null)
    const [direction, setDirection] = useState<number>(0)
    const nameColor = useRef<0xFFFFFF | 0xFF3300>(0xFFFFFF)

    // const gltf = useMemo(() => useGLTFLoaderStore.getState().models.current.npc, [])
    const gltf = useGLTFLoaderStore(state => state.models.current.npc)
    const model = useMemo(() => {
        if (!gltf?.scene) return undefined
        return SkeletonUtils.clone(gltf.scene) 
    }, [gltf])
    useEffect(() => {
        if (!model) { return }
        model.traverse((child: Mesh) => {
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
            } 
        })
    }, [model]) 

    const isTurned = useRef(false)
    const animationTarget = useRef()
    const { mixer, actions } = useAnimations(gltf.animations, animationTarget)
    useEffect(() => {
        if (!mixer || isTurned.current) { return }
        isTurned.current = true
        setTimeout(() => {
            actions?.jump?.setDuration(1).play()
        }, Math.random() * 1000)
    }, [ mixer, actions, model ])

    // Fill changed npc properties
    useEffect(() => {
        // console.log(`[NPC]: npc with id '${npc?.id}' updated`, npc)
        if (!npc?.isNpc) { return }
        if (npc?.isDead) {
            // console.log(`[NPC]: npc with id '${npc?.id}' is dead`)
            setSpawned(false)
            setTargetMatrixPosition(null)
            setCurrentMatrixPosition(null)
            // Remove hover on delete
            handlePointerLeave()
            return 
        }
        if (npc?.coordinates) {
            // console.log('[NPC] Set position to,', npc.id, npc.coordinates, matrixCoordToWorld(worldSize.current, {...npc.coordinates}))
            setTargetMatrixPosition({ ...npc?.coordinates })
        }
        if (npc?.direction) {
            setDirection(Math.atan2(npc.direction.dx, npc.direction.dz))
        }
    }, [ npc ])

    // Move npc
    useEffect(() => {
        if (!targetMatrixPosition) { return }
        if (!worldSize.current) { return }

        const _targetWorldPosition = matrixCoordToWorld(worldSize.current, {...targetMatrixPosition})
        setTargetWorldPosition(_targetWorldPosition)

        if (!spawned) {
            setCurrentMatrixPosition(targetMatrixPosition)
            setCurrentWorldPosition(matrixCoordToWorld(worldSize.current, {...targetMatrixPosition}))
            setSpawned(true)
            return
        }

        if (!currentWorldPosition || !_targetWorldPosition) { return }
        if (currentWorldPosition.x !== _targetWorldPosition.x 
            || currentWorldPosition.z !== _targetWorldPosition.z) {
                Tween.to(currentWorldPosition, _targetWorldPosition,
                    {
                        duration: getMoveDuration(npc.movementSpeed, currentMatrixPosition, targetMatrixPosition),
                        onChange(state: { value: Coordinate }) {
                            // console.log(state.value)
                            setCurrentWorldPosition(state.value)
                        },
                        onComplete() {
                            setCurrentMatrixPosition(targetMatrixPosition)
                            setCurrentWorldPosition(_targetWorldPosition)
                        },
                    }
                )
            }
    }, [ targetMatrixPosition, currentMatrixPosition ])

    // Save ref to object to store & rm on unmount
    useEffect(() => {
        if (animationTarget.current) {
            setSceneObject(npc.id, animationTarget.current, 'add')
        }
        return () => {
            setSceneObject(npc.id, animationTarget.current, 'remove')
        }
    }, [animationTarget.current])

    // Set target & hover
    const handlePointerEnter = () => {
        nameColor.current = 0xFF3300
        setCursorPointer(html, true)
        setHoveredItems(npc, 'add')
    }
    const handlePointerLeave = () => {
        nameColor.current = 0xFFFFFF
        setCursorPointer(html, false)
        setHoveredItems(npc, 'remove')
    }
    const handleLeftClick = () => {
        setTarget(npc, fighter.skills[0])
    }
    // const handleRightClick = (event: ThreeEvent<PointerEvent>) => {
    //     // onContextMenu
    //     console.log('Right CLick', event)
    //     setTarget(npc, fighter.skills[1])
    // }

    // TODO: This works wrong but just for test
    const attackTimeout = useRef<NodeJS.Timeout | null>(null)
    const speed = 1000
    useEffect(() => {
        // console.log('events', events)
        const skillEvents = events.filter((event: any) => event.type === 'skill')
        // console.log('skillEvents', skillEvents)
        skillEvents.forEach((skillEvent: any)  => {
            if (skillEvent.fighter?.id === npc.id) {
                // if (actions) {
                //     const attackAction = getAttackAction(actions, fighter, skillEvent.skill)
                //     // TODO: Just for test
                //     const isEmptyHand = !Object.keys(fighter.equipment).find(slotKey => (+slotKey === 6 || +slotKey === 7))
                //     if (!isEmptyHand) {
                //         renderEffect.current = true
                //     }
                //     // 
                //     attackAction?.setDuration(speed / 1000).play()
                //     clearTimeout(attackTimeout.current)
                //     attackTimeout.current = setTimeout(() => {
                //         attackAction?.stop()
                //     }, speed)
                // }
                removeEvent(skillEvent)
            } else {
                // TODO: change this on npc attack skill
                // removeEvent(skillEvent)
            }
        })
    }, [events])
    // 

    if (!spawned) {
        return <></>
    }

    return (
        <group name='npc'>
            <Name value={npc?.name} target={animationTarget} offset={.05} color={nameColor.current} />
            <HealthBar object={npc} target={animationTarget} offset={.45} />
            <primitive 
                onPointerMove={handlePointerEnter}
                onPointerLeave={handlePointerLeave}
                onPointerDown={handleLeftClick}
                ref={animationTarget}
                object={model}
                scale={.006}
                position={[currentWorldPosition.x, .4, currentWorldPosition.z]}
                rotation={[0, direction, 0]}
            >
            </primitive>
        </group>
    )
})

export default Npc