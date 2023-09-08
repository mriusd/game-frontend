import * as THREE from "three"
import React, { useEffect, useState, useRef, memo, useMemo, useImperativeHandle, useCallback, useLayoutEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useAnimations } from "@react-three/drei"
import { CAMERA_POSITION } from "../config"
import { getNearestEmptySquareToTarget, getTargetSquareWithAttackDistance } from "../utils/getNextPosition"
import { inWorld } from "../utils/inWorld"
import { euclideanDistance } from "../utils/euclideanDistance"
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
import { useShaderedFighter } from "./utils/getFighterModel"
import { useControls } from "Scene/Controls/useControls"

const Fighter = memo(function Fighter() {
    const spawned = useRef(false)
    const submitMalee = useEvents(state => state.submitMalee)
    const [target, setTarget] = useEvents(state => [state.target, state.setTarget])
    const [fighter, fighterNode] = useFighter(state => [state.fighter, state.fighterNode])
    const { model, animations } = useShaderedFighter('man')
    const [matrixCoordToWorld, worldCoordToMatrix] = useCore(state => [state.matrixCoordToWorld, state.worldCoordToMatrix])
    const setPosition = useFighter(state => state.setPosition)

    const setAllActions = useFighter(state => state.setAllActions)
    const { actions } = useAnimations(animations, fighterNode)
    React.useLayoutEffect(() => setAllActions(actions), [actions])
    const [ setAction, action ] = useFighter(state => [state.setAction, state.action])


    // const [attacks, _setAttacks] = useState([])
    // const setAttacks = (attack: ) => {
    //     _setAttacks()
    // }

    // Manage fighter changes from server
    useEffect(() => {
        // console.log('[Fighter]: updated', fighter)
        if (!fighter || !fighterNode.current) { return }

        if (fighter?.isDead) {
            spawned.current = false
            setAction('die')
            // handlePointerLeave()
            return 
        }

        if (fighter?.coordinates) {
            if (!spawned.current) return void (spawned.current = true), setPosition(matrixCoordToWorld(fighter?.coordinates)), setAction('stand') 

            // Check if the position differ by more than 2 cells
            if (euclideanDistance(fighter.coordinates, worldCoordToMatrix(fighterNode.current.position)) > 2) {
                setPosition(matrixCoordToWorld(fighter?.coordinates))
            }
        }
    }, [fighter, fighterNode.current])

    useFrame(() => {
        if (!fighterNode.current) { return }
        fighterNode.current.rotation.y = useControls.getState().direction
    })


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

    return (
        <group>
            <LastMessage offset={.5} fighter={fighter} target={fighterNode} />
            <FighterModel
                ref={fighterNode}
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