// @ts-expect-error 
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js'
import { useMemo, memo } from "react"
// import { useSceneContext } from "store/SceneContext"
// import { useAnimations } from '@react-three/drei'
import { forwardRef } from 'react'


interface Props { gltf: any, position?: number[], rotation?: number[], scale?: number[] }
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

    return (
        <primitive
            ref={ref}
            name={model.name}
            object={model}
            {...props}
        >
        </primitive>
    )
}))

export default ReuseModel