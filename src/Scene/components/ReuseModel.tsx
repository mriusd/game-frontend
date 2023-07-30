// @ts-expect-error 
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js'
import { useMemo, memo, useEffect } from "react"
// import { useSceneContext } from "store/SceneContext"
// import { useAnimations } from '@react-three/drei'
import { forwardRef } from 'react'


interface Props { gltf: any, position?: number[], rotation?: number[], scale?: number[], onPointerEnter?: (e?: any) => void, onPointerLeave?: (e?: any) => void }
const ReuseModel = memo(forwardRef(function ReuseModel({ gltf, ...props }: Props, ref: any) {
    // const { worldSize, html, setTarget, fighter, setHoveredItems, setSceneObject, getSceneObject } = useSceneContext()

    const model = useMemo(() => SkeletonUtils.clone(gltf.scene), [gltf])

    // const animationTarget = useRef()
    // const { mixer, actions } = useAnimations(gltf.current.npc.animations, animationTarget)
    // useEffect(() => {
    //     if (!mixer) { return }
    //     setTimeout(() => {
    //         actions?.jump?.setDuration(1).play()
    //     }, Math.random() * 1000)
    // }, [ mixer, actions, model ])

    // Enable shadows
    useEffect(() => {
        if (!model) { return }
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    }, [model])

    return (
        <primitive
            onPointerEnter={props.onPointerEnter}
            onPointerLeave={props.onPointerLeave}
            ref={ref}
            name={model.name}
            object={model}
            {...props}
        >
        </primitive>
    )
}))

export default ReuseModel