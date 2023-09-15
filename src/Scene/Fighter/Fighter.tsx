import React from "react"
import { useFrame } from "@react-three/fiber"
import { useAnimations } from "@react-three/drei"
import { euclideanDistance } from "../utils/euclideanDistance"
import { calcDirection } from "../utils/calcDirection"
// TODO: Temporary, create Skills Manager and swap shader materials instead

import TwistingSlash from "./Skills/TwistingSlash/TwistingSlash"
import LastMessage from "./components/LastMessage"
import FighterModel from "./components/FighterModel"

import { useCore } from "Scene/useCore"
import { useCloud } from "EventCloud/useCloud"
import { useFighter } from "./useFighter"
import { useShaderedFighter } from "./utils/getFighterModel"
import { useControls } from "Scene/Controls/useControls"

const Fighter = React.memo(function Fighter() {
    const spawned = React.useRef(false)
    const submitMalee = useCloud(state => state.submitMalee)
    const [target, setTarget] = useCloud(state => [state.target, state.setTarget])
    const [fighter, fighterNode] = useFighter(state => [state.fighter, state.fighterNode])
    const { model, animations } = useShaderedFighter('man')
    const [matrixCoordToWorld, worldCoordToMatrix] = useCore(state => [state.matrixCoordToWorld, state.worldCoordToMatrix])
    const setPosition = useFighter(state => state.setPosition)

    const setAllActions = useFighter(state => state.setAllActions)
    const { actions } = useAnimations(animations, fighterNode)
    React.useLayoutEffect(() => setAllActions(actions), [actions])
    const [ setAction ] = useFighter(state => [state.setAction])

    // Manage fighter changes from server
    React.useEffect(() => {
        // console.log('[Fighter]: updated', fighter)
        if (!fighter || !fighterNode.current) { return }

        if (fighter?.isDead) {
            spawned.current = false
            setAction('die')
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

    // React on Target and Do Action
    React.useEffect(() => {
        if (target && target?.skill) {
            const objectCoordinate = target.target.coordinates
            // TODO: Make Logic For Attack With Skills
            setAction('attack')
            submitMalee(calcDirection(worldCoordToMatrix(fighterNode.current.position), objectCoordinate))
            setTarget(null, null)
            // 
            return
        }
    }, [target])

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