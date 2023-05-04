// @ts-expect-error 
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { useEffect, useState, useRef, useMemo } from "react"
import { matrixCoordToWorld } from "./utils/matrixCoordToWorld"
import Tween from "./utils/tween/tween"
import { Coordinate } from "interfaces/coordinate.interface"
import { useSceneContext } from "store/SceneContext"
import { useLoadAssets } from "store/LoadAssetsContext"
import { useAnimations } from "@react-three/drei"

const Npc = ({ npc }) => {
    const { worldSize } = useSceneContext()
    const { gltf } = useLoadAssets()
    const [spawned, setSpawned] = useState<boolean>(false)
    const [currentMatrixPosition, setCurrentMatrixPosition] = useState<Coordinate | null>(null)
    const [targetMatrixPosition, setTargetMatrixPosition] = useState<Coordinate | null>(null)
    const [targetWorldPosition, setTargetWorldPosition] = useState<Coordinate | null>(null)
    const [currentWorldPosition, setCurrentWorldPosition] = useState<Coordinate | null>(null)

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
        // if (!actions.jump) { return }
        setTimeout(() => {
            actions?.jump?.setDuration(1).play()
        }, Math.random() * 1000)
    }, [ mixer, actions, model ])

    // Fill changed npc properties
    useEffect(() => {
        console.log(`[NPC]: npc with id '${npc?.id}' updated`, npc)
        if (!npc?.isNpc) { return }
        if (npc?.coordinates) {
            setTargetMatrixPosition({ ...npc?.coordinates })
            return
        }
    }, [ npc ])

    // Move npc
    useEffect(() => {
        if (!targetMatrixPosition) { return }
        if (!worldSize.current) { return }

        setTargetWorldPosition(matrixCoordToWorld(worldSize.current, {...targetMatrixPosition}))

        if (!spawned) {
            setCurrentMatrixPosition(targetMatrixPosition)
            setCurrentWorldPosition(matrixCoordToWorld(worldSize.current, {...targetMatrixPosition}))
            setSpawned(true)
            return
        }
        
        if (!currentWorldPosition || !targetWorldPosition) { return }
        if (currentWorldPosition.x !== targetWorldPosition.x 
            || currentWorldPosition.z !== targetWorldPosition.z) {
                Tween.to(currentWorldPosition, targetWorldPosition,
                    {
                        duration: 400,
                        onChange(state: { value: Coordinate }) {
                            // console.log(state.value)
                            setCurrentWorldPosition(state.value)
                        },
                        onComplete() {
                            setCurrentMatrixPosition(targetMatrixPosition)
                            setCurrentWorldPosition(targetWorldPosition)
                        },
                    }
                )
            }
    }, [ targetMatrixPosition ])

    if (!spawned) {
        return <></>
    }

    return (
            <primitive 
                ref={animationTarget}
                object={model}
                position={[currentWorldPosition.x, .4, currentWorldPosition.z]}
                scale={.006}
                // rotation={[0, direction, 0]}
            />
    )
}

export default Npc