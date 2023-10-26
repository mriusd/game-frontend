import React from "react"
import { useFrame } from "@react-three/fiber"
import { useAnimations } from "@react-three/drei"
import { euclideanDistance } from "../utils/euclideanDistance"
import { calcDirection } from "../utils/calcDirection"
// TODO: Temporary, create Skills Manager and swap shader materials instead

import LastMessage from "./components/LastMessage"
import FighterModel from "./components/FighterModel/FighterModel"

import { useCore } from "Scene/useCore"
import { useCloud } from "EventCloud/useCloud"
import { useFighter } from "./useFighter"
import { useFighterSkin } from "./hooks/useFighterSkin"
import { useControls } from "Scene/Controls/useControls"
import { useEquipmentChange } from "./hooks/useEquipmentChange"

import { useEvent } from "Scene/hooks/useEvent"
import { useSkillEffects } from "./hooks/useSkillEffects/useSkillEffects"

const Fighter = React.memo(function Fighter() {
    const spawned = React.useRef(false)
    const submitAttack = useCloud(state => state.submitAttack)
    const [target, setTarget] = useCloud(state => [state.target, state.setTarget])
    const [fighter, fighterNode, move] = useFighter(state => [state.fighter, state.fighterNode, state.move])
    const { model, animations } = useFighterSkin('man')
    const [matrixCoordToWorld, worldCoordToMatrix] = useCore(state => [state.matrixCoordToWorld, state.worldCoordToMatrix])
    const setPosition = useFighter(state => state.setPosition)
    const setDirection = useControls(state => state.setDirection)
    // TODO: Fix this
    // This state used just for Sword equipment on move
    const isMoving = useFighter(state => state.isMoving)

    const setAllActions = useFighter(state => state.setAllActions)
    const { actions } = useAnimations(animations, fighterNode)
    React.useLayoutEffect(() => setAllActions(actions), [actions])
    const [ setAction ] = useFighter(state => [state.setAction])

    const { effects, play: playSkillEffect } = useSkillEffects()

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
        if (!target?.target) { return }
        const objectCoordinate = target.target.coordinates

        if (target?.skill) {
            // Check the distance, if too long - move fighter
            if (euclideanDistance(objectCoordinate, fighter.coordinates) <= target.skill.activeDistance) {
                const direction = calcDirection(worldCoordToMatrix(fighterNode.current.position), objectCoordinate)
                setDirection(Math.atan2(direction.dx, direction.dz)) // Additionally set direction on attack, to be sure that fighter look at opponent
                setAction('attack')
                submitAttack(direction)
                setTarget(null, null)
                return
            }
            move(matrixCoordToWorld(objectCoordinate))
        }

    }, [target])


    // Change Animations On Equipment Change
    useEquipmentChange(fighter, (changes) => {
        if (changes.changedSlots.includes(6) || changes.changedSlots.includes(7)) {
            const action = useFighter.getState().action
            if (action.includes('stand')) { setAction('stand') }
        }
    })

    // Animate Skills on Server Event
    useEvent(fighter, 'skill', (event, removeEvent) => {
        playSkillEffect(event)
        removeEvent(event)
    })

    return (
        <group>
            <LastMessage offset={2.2} fighter={fighter} target={fighterNode} />
            <FighterModel
                ref={fighterNode}
                model={model}
                fighter={fighter}
                isMove={isMoving}
            >
                {effects.map((_, i) => <primitive object={_} key={i} />)}
            </FighterModel>
        </group>
    )
})

export default Fighter