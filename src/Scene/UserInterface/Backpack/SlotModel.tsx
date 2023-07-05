import * as THREE from 'three'
// @ts-expect-error 
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js'
import { useMemo, memo } from "react"
import { forwardRef } from 'react'
import type { BackpackSlot } from 'interfaces/backpack.interface'
import { useLoadAssets } from 'store/LoadAssetsContext'
import { getItemModelName } from 'Scene/utils/getItemModelName'
import { useTexture } from '@react-three/drei'


interface Props { position?: number[], rotation?: number[], scale?: number[], onPointerEnter?: (e?: any) => void, onPointerLeave?: (e?: any) => void, item: BackpackSlot }
const SlotModel = memo(forwardRef(function SlotModel({ item, ...props }: Props, ref: any) {
    // FIXME: Rerenders lots of time, cuz app.tsx (eventCloud) has rerendering hole
    const { gltf } = useLoadAssets()
    const { map } = useTexture({ map: 'assets/notexture.png' })

    const model = useMemo<THREE.Mesh>(() => {
        const name = getItemModelName(item.itemAttributes.name)
        if (name === 'none') {
            return new THREE.Mesh(
                new THREE.BoxGeometry(+item.itemAttributes.itemWidth / 4, +item.itemAttributes.itemHeight / 4, +item.itemAttributes.itemWidth / 4),
                new THREE.MeshBasicMaterial({ color: 'pink', map })
            )
        }

        return SkeletonUtils.clone(gltf.current[name].scene)
    }, [item, map])

    // Add shaders based on things level
    // useEffect(() => {
    //     if (isMounted.current) { return }
    //     isMounted.current = true
    //     model.traverse((object) => {
    //         // object.renderOrder = 999
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
            name="slot-model"
            object={model}
            {...props}
        >
        </primitive>
    )
}))

export default SlotModel