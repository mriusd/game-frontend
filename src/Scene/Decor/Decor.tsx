// @ts-expect-error 
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js'
import { useEffect, useState, useRef, useMemo, memo } from "react"
import { matrixCoordToWorld } from "../utils/matrixCoordToWorld"
import Tween from "../utils/tween/tween"
import { Coordinate } from "interfaces/coordinate.interface"
import { useAnimations } from "@react-three/drei"
import { getMoveDuration } from '../utils/getMoveDuration'
import HealthBar from '../components/HealthBar'
import type { Mesh } from 'three'
import type { Fighter } from 'interfaces/fighter.interface'
import Name from '../components/Name'
import { setCursorPointer } from '../utils/setCursorPointer'
import ReuseModel from '../components/ReuseModel'
import { useGLTFLoaderStore } from '../GLTFLoader/GLTFLoaderStore'

import { useCore } from 'Scene/useCore'

interface Props { 
    objectData: {
        location: Coordinate
        rotation: { x: number, y: number, z: number }
        scale: { x: number, y: number, z: number }
    } 
}
const Decor = memo(function Decor({ objectData }: Props) {
    const [matrixCoordToWorld, setSceneObject] = useCore(state => [state.matrixCoordToWorld, state.setSceneObject])



    // const model = useMemo(() => useGLTFLoaderStore.getState().models.current.tree, [])
    const model = useGLTFLoaderStore(state => state.models.current.tree)

    const worldCoordinate = useMemo(() => matrixCoordToWorld(objectData.location), [objectData])
    const modelRef = useRef<THREE.Mesh | null>(null)

    // Save ref to object to store & rm on unmount
    // useEffect(() => {
    //     if (modelRef.current) {
    //         setSceneObject(npc.id, modelRef.current, 'add')
    //     }
    //     return () => {
    //         setSceneObject(npc.id, modelRef.current, 'remove')
    //     }
    // }, [modelRef.current])


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
                scale={[objectData.scale.x, objectData.scale.y, objectData.scale.z]}
            />
        </group>
    )
})

export default Decor