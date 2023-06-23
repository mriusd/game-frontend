// @ts-expect-error 
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js'
import { useMemo, memo, useEffect, useRef } from "react"
// import { useSceneContext } from "store/SceneContext"
// import { useAnimations } from '@react-three/drei'
import { forwardRef } from 'react'


interface Props { gltf: any, position?: number[], rotation?: number[], scale?: number[], onPointerEnter?: (e?: any) => void, onPointerLeave?: (e?: any) => void }
const SlotModel = memo(forwardRef(function SlotModel({ gltf, ...props }: Props, ref: any) {
    // const { worldSize, html, setTarget, fighter, setHoveredItems, setSceneObject, getSceneObject } = useSceneContext()
    const isMounted = useRef<boolean>(false)
    const model = useMemo<THREE.Mesh>(() => SkeletonUtils.clone(gltf.scene), [gltf])

    // const animationTarget = useRef()
    // const { mixer, actions } = useAnimations(gltf.current.npc.animations, animationTarget)
    // useEffect(() => {
    //     if (!mixer) { return }
    //     setTimeout(() => {
    //         actions?.jump?.setDuration(1).play()
    //     }, Math.random() * 1000)
    // }, [ mixer, actions, model ])

    // Make model ignore depth and always display in full
    // TODO:FIXME: Eats so much CPU, +10% load on macbook m1 pro (depthTest + trasparent)
    // useEffect(() => {
    //     if (isMounted.current) { return }
    //     isMounted.current = true
    //     model.traverse((object) => {
    //         object.renderOrder = 999
    //         if (object.isObject3D) {
    //             // @ts-expect-error
    //             if (object.material) {
    //                 // @ts-expect-error
    //                 object.material.depthTest = false
    //                 // @ts-expect-error
    //                 object.material.transparent = true
    //             }
    //         }
    //     })
    // }, [])

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

export default SlotModel