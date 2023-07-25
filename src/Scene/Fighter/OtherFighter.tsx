import { Fighter } from "interfaces/fighter.interface"
import FighterModel from "./FighterModel"
import { useGLTFLoaderStore } from "Scene/GLTFLoader/GLTFLoaderStore"
import { useMemo, useRef, useState, useEffect } from "react"
import HealthBar from "Scene/components/HealthBar"
import { Box, useAnimations } from "@react-three/drei"
import type { Coordinate } from "interfaces/coordinate.interface"
import { useSceneContext } from "store/SceneContext"
import { matrixCoordToWorld } from "Scene/utils/matrixCoordToWorld"
import Tween from "Scene/utils/tween/tween"
import { getMoveDuration } from "Scene/utils/getMoveDuration"

interface Props { fighter: Fighter }
const OtherFighter = ({ fighter }: Props) => {

    const gltf = useMemo(() => useGLTFLoaderStore.getState().models.current.stock, [])

    const animationTarget = useRef()
    const { mixer, actions } = useAnimations(gltf.animations, animationTarget)

    // Just for test
    // TODO: must be removed
    const { worldSize } = useSceneContext()
    const [spawned, setSpawned] = useState<boolean>(false)
    const [currentMatrixPosition, setCurrentMatrixPosition] = useState<Coordinate | null>(null)
    const [targetMatrixPosition, setTargetMatrixPosition] = useState<Coordinate | null>(null)
    const [targetWorldPosition, setTargetWorldPosition] = useState<Coordinate | null>(null)
    const [currentWorldPosition, setCurrentWorldPosition] = useState<Coordinate | null>(null)
    const [direction, setDirection] = useState<number>(0)
    // 

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

    // Move npc
    useEffect(() => {
        if (!targetMatrixPosition) { return }
        if (!worldSize.current) { return }

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
                    },
                }
            )
        }
    }, [targetMatrixPosition, currentMatrixPosition])

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
                position={[currentWorldPosition.x, .4, currentWorldPosition.z]}
                rotation={[0, direction, 0]}
            />
        </group>
    )
}

export default OtherFighter