// @ts-expect-error 
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { useEffect, useState, useRef, useMemo } from "react"
import { matrixCoordToWorld } from "./utils/matrixCoordToWorld"
import Tween from "./utils/tween/tween"
import { Coordinate } from "interfaces/coordinate.interface"
import { useSceneContext } from "store/SceneContext"
import { useLoadAssets } from "store/LoadAssetsContext"
import { Box, useAnimations } from "@react-three/drei"
import { getMoveDuration } from './utils/getMoveDuration';

const Npc = ({ npc }) => {
    const { worldSize } = useSceneContext()
    const { gltf } = useLoadAssets()
    const [spawned, setSpawned] = useState<boolean>(false)
    const [currentMatrixPosition, setCurrentMatrixPosition] = useState<Coordinate | null>(null)
    const [targetMatrixPosition, setTargetMatrixPosition] = useState<Coordinate | null>(null)
    const [targetWorldPosition, setTargetWorldPosition] = useState<Coordinate | null>(null)
    const [currentWorldPosition, setCurrentWorldPosition] = useState<Coordinate | null>(null)
    const [direction, setDirection] = useState<number>(0)

    const model = useMemo(() => SkeletonUtils.clone(gltf.current.npc.scene), [gltf.current])
    useEffect(() => {
        if (!model) { return }
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
            } 
        })
    }, [model]) 

    const animationTarget = useRef()
    const { mixer, actions } = useAnimations(gltf.current.npc.animations, animationTarget)
    useEffect(() => {
        if (!mixer) { return }
        setTimeout(() => {
            actions?.jump?.setDuration(1).play()
        }, Math.random() * 1000)
    }, [ mixer, actions, model ])

    // Fill changed npc properties
    useEffect(() => {
        // console.log(`[NPC]: npc with id '${npc?.id}' updated`, npc)
        if (!npc?.isNpc) { return }
        if (npc?.coordinates) {
            console.log('[NPC] Set position to,', npc.id, npc.coordinates, matrixCoordToWorld(worldSize.current, {...npc.coordinates}))
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

    if (!spawned || npc.isDead) {
        return <></>
    }

    return (
            <primitive 
                ref={animationTarget}
                object={model}
                position={[currentWorldPosition.x, .4, currentWorldPosition.z]}
                scale={.006}
                rotation={[0, direction, 0]}
            />
            // <Box
            //     position={[currentWorldPosition.x, .4, currentWorldPosition.z]}
            //     rotation={[0, direction, 0]}
            // />
    )
}

export default Npc