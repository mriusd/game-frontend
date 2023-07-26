// @ts-expect-error 
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js'
import { useEffect, useState, useRef, useMemo, memo } from "react"
import { matrixCoordToWorld } from "./utils/matrixCoordToWorld"
import Tween from "./utils/tween/tween"
import { Coordinate } from "interfaces/coordinate.interface"
import { useSceneContext } from "store/SceneContext"
import { useLoadAssets } from "store/LoadAssetsContext"
import { useAnimations } from "@react-three/drei"
import { getMoveDuration } from './utils/getMoveDuration'
import HealthBar from './components/HealthBar'
import type { Mesh } from 'three'
import type { Fighter } from 'interfaces/fighter.interface'
import Name from './components/Name'
import { setCursorPointer } from './utils/setCursorPointer'
import ReuseModel from './components/ReuseModel'

interface Props { 
    objectData: {
        location: Coordinate
        rotation: { x: number, y: number, z: number }
        scale: { x: number, y: number, z: number }
    } 
}
const Npc = memo(function Npc({ objectData }: Props) {
    const { worldSize, html, setTarget, fighter, setHoveredItems, setSceneObject, getSceneObject } = useSceneContext()
    const { gltf } = useLoadAssets()

    const model = useMemo(() => gltf.current.tree, [objectData])
    const worldCoordinate = useMemo(() => matrixCoordToWorld(worldSize.current, objectData.location), [objectData])
    const modelRef = useRef<THREE.Mesh | null>(null)

    // // Save ref to object to store & rm on unmount
    // useEffect(() => {
    //     if (animationTarget.current) {
    //         setSceneObject(npc.id, animationTarget.current, 'add')
    //     }
    //     return () => {
    //         setSceneObject(npc.id, animationTarget.current, 'remove')
    //     }
    // }, [animationTarget.current])


    if (!model || !worldCoordinate) {
        return <></>
    }

    return (
        <group name='decor'>
            <ReuseModel
                ref={modelRef}
                gltf={model}
                position={[worldCoordinate.x, 0, worldCoordinate.z]}
                rotation={[objectData.rotation.x, objectData.rotation.y, objectData.rotation.z]}
                scale={[objectData.scale.x-0.5, objectData.scale.y-0.5, objectData.scale.z-0.5]}
            />
        </group>
    )
})

export default Npc