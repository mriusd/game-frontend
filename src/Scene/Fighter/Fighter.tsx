import * as THREE from "three"
import { useEffect, useState, useRef, memo, useMemo, useImperativeHandle, useCallback } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useAnimations } from "@react-three/drei"
import { CAMERA_POSITION } from "../config"
import { getNearestEmptySquareToTarget, getTargetSquareWithAttackDistance } from "../utils/getNextPosition"
import { inWorld } from "../utils/inWorld"
import { euclideanDistance } from "../utils/euclideanDistance"
import Tween from "../utils/tween/tween"
import { useSceneContext } from '../../store/SceneContext'
import type { Coordinate } from "interfaces/coordinate.interface"
import { isOccupiedCoordinate } from "../utils/isOccupiedCoordinate"
import { getMoveDuration } from "../utils/getMoveDuration"
import { calcDirection } from "../utils/calcDirection"
import FighterModel from "./FighterModel"
import { getAttackAction, getRunAction, getStandAction } from "./utils/getAction"
// TODO: Temporary, create Skills Manager and swap shader materials instead
import TwistingSlash from "./Skills/TwistingSlash/TwistingSlash"
import LastMessage from "./components/LastMessage"
import { useCore } from "store/useCore"
import { getMeshDimensions } from "Scene/utils/getMeshDimensions"
import { useEvents } from "store/EventStore"
import { useFighter } from "./useFighter"
import { getShaderedFighter } from "./utils/getFighterModel"
import { useControls } from "Scene/Controls/useControls"

const Fighter = memo(function Fighter() {
    const spawned = useRef(false)
    const submitMalee = useEvents(state => state.submitMalee)
    const [target, setTarget] = useEvents(state => [state.target, state.setTarget])
    const [fighter, fighterNode] = useFighter(state => [state.fighter, state.fighterNode])
    const { model, animations } = getShaderedFighter('man')
    const matrixCoordToWorld = useCore(state => state.matrixCoordToWorld)
    const occupiedCoords = useCore(state => state.occupiedCoords)
    const [setPosition, move] = useFighter(state => [state.setPosition, state.move])
    const [isMoving, setIsMoving] = useFighter(state => [state.isMoving, state.setIsMoving])

    // const [serverMatrixCoordinate, setServerMatrixCoordinate] = useState<Coordinate | null>(null)
    // const [targetMatrixCoordinate, setTargetMatrixCoordinate] = useState<Coordinate | null>(null)
    // const [ targetWorldPosition, setTargetWorldPosition ] = useState(null) // we use 1 cell move instead

    // Unlike 'isMoving', 'isStaying' sets to TRUE with delay, but sets to FALSE as 'isMoving' immediately
    const [isStaying, setIsStaying] = useState<boolean>(false)
    const ENTER_TO_ISSTAYING_DELAY = 50 //ms

    const animationTarget = useRef()
    useImperativeHandle(fighterNode, () => animationTarget.current)
    const { mixer, actions } = useAnimations(animations, animationTarget)


    // const [attacks, _setAttacks] = useState([])
    // const setAttacks = (attack: ) => {
    //     _setAttacks()
    // }

    // Manage fighter changes from server
    useEffect(() => {
        // console.log('[Fighter]: updated', fighter)
        if (!fighter) { return }
        if (!fighterNode.current) { return }

        if (fighter?.coordinates) {
            if (!spawned.current) return void (spawned.current = true), setPosition(matrixCoordToWorld(fighter?.coordinates))/*, setAction('stand')*/ 
        }
    }, [fighter, fighterNode.current])

    useFrame(() => {
        if (!fighterNode.current) { return }
        fighterNode.current.rotation.y = useControls.getState().direction
    })



    // Synchronize server and locale Fighter position
    // useEffect(() => {
    //     if (!serverMatrixCoordinate || !currentMatrixCoordinate) { return }
    //     // Check if the same position while staying & does not differ by more than one cell while moving
    //     if (euclideanDistance(serverMatrixCoordinate, currentMatrixCoordinate, isStaying ? 0 : 1)) {
    //         return
    //     }
    //     setCurrentMatrixCoordinate({ ...serverMatrixCoordinate })
    // }, [serverMatrixCoordinate])


    // // TODO: Fix, just for test
    // const renderEffect = useRef(false)
    // // 
    // const attackTimeout = useRef<NodeJS.Timeout | null>(null)
    // const speed = 500
    // useEffect(() => {
    //     console.log('target!', target, itemTarget)
    //     // For attack target
    //     if (target && target?.skill) {
    //         console.log('FIGHTER EQUUUUU', fighter.equipment)

    //         const attackDistance = target.skill.activeDistance
    //         const objectCoordinate = target.target.coordinates
    //         const targetCoordinate = getTargetSquareWithAttackDistance(occupiedCoords, currentMatrixCoordinate, objectCoordinate, attackDistance)
    //         setSaveFocusedMatrixCoordinate(targetCoordinate)

    //         if (actions) {
    //             const attackAction = getAttackAction(actions, fighter, target.skill)
    //             // TODO: Just for test
    //             const isEmptyHand = !Object.keys(fighter.equipment).find(slotKey => (+slotKey === 6 || +slotKey === 7))
    //             if (!isEmptyHand) {
    //                 // TODO: Hook animation on server event
    //                 setTimeout(() => {
    //                     renderEffect.current = true
    //                 }, 300)
    //             }
    //             // 
    //             attackAction?.setDuration(speed / 1000).play()
    //             clearTimeout(attackTimeout.current)
    //             attackTimeout.current = setTimeout(() => {
    //                 attackAction?.stop()
    //             }, speed)
    //         }

    //         submitMalee(calcDirection(currentMatrixCoordinate, objectCoordinate))
    //         setTarget(null, null)
    //         return
    //     }
    //     // For item target
    //     if (itemTarget) {
    //         setSaveFocusedMatrixCoordinate(itemTarget.coords)
    //         setItemTarget(null)
    //     }
    // }, [target, itemTarget])

    // // Add delay to prevent freeze on "checkpoint" when synchronising with server
    // // On delayed mooving "true" we render fighter in the same position as server
    // // Otherwise we render if fighter < 2 cells away from server
    // const timeout = useRef<any>(0)
    // useEffect(() => {
    //     clearTimeout(timeout.current)

    //     if (isMoving) {
    //         setIsStaying(false)
    //         return
    //     }

    //     timeout.current = setTimeout(() => {
    //         setIsStaying(true)
    //     }, ENTER_TO_ISSTAYING_DELAY) // 200ms delay
    // }, [isMoving])

    // const dev = useControls('Fighter Dev Settings', {
    //     xSpeed: { min: 1, max: 10, value: 1 }
    // })
    // // Fighter movement
    // useEffect(() => {
    //     if (isMoving) { return }
    //     if (!worldSize.current) { return }
    //     if (!isSpawned) { return }
    //     if (!currentMatrixCoordinate || !targetMatrixCoordinate) { return }
    //     if (!inWorld(worldSize.current, targetMatrixCoordinate)) { return }
    //     // console.log('[Fighter]: Move cell (from->to)', currentMatrixCoordinate, targetMatrixCoordinate)

    //     const nextMatrixPosition = getNearestEmptySquareToTarget(occupiedCoords, currentMatrixCoordinate, targetMatrixCoordinate)
    //     if (!nextMatrixPosition) { return }
    //     const nextWorldPosition = matrixCoordToWorld(worldSize.current, nextMatrixPosition)

    //     // Used in controller for direction
    //     setNextMatrixCoordinate(nextMatrixPosition)
    //     setNextWorldCoordinate(nextWorldPosition)
    //     // 
    //     // console.log('----> START MOVE <----')

    //     setIsMoving(true)
    //     moveFighter && moveFighter({ ...nextMatrixPosition })

    //     Tween.to(currentWorldCoordinate, nextWorldPosition,
    //         {
    //             duration: getMoveDuration(fighter.movementSpeed * dev.xSpeed, currentMatrixCoordinate, nextMatrixPosition),
    //             onChange(state) {
    //                 // console.log(state.value)
    //                 setCurrentWorldCoordinate(state.value)
    //             },
    //             onComplete() {
    //                 // setCurrentWorldCoordinate(nextWorldPosition)
    //                 setCurrentMatrixCoordinate(nextMatrixPosition)
    //                 setIsMoving(false)
    //                 setTargetMatrixCoordinate(saveFocusedMatrixCoordinate)
    //             },
    //         }
    //     )
    // }, [targetMatrixCoordinate, currentMatrixCoordinate])


    return (
        <group>
            <LastMessage offset={.5} fighter={fighter} target={animationTarget} />
            <FighterModel
                ref={animationTarget}
                model={model}
                fighter={fighter}
            >
                {/* TODO: Temporary, create Skills Manager and swap shader materials instead */}
                {/* <TwistingSlash renderEffect={renderEffect} onEffectComplete={() => renderEffect.current = false} /> */}
            </FighterModel>
        </group>
    )
})

export default Fighter