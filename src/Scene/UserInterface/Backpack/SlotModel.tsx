import * as THREE from 'three'
// @ts-expect-error 
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js'
import { useMemo, memo, useRef } from "react"
import { forwardRef } from 'react'
import type { BackpackSlot } from 'interfaces/backpack.interface'
import { getBackpackModel } from './utils/getBackpackModel'
import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import { isExcellent } from 'Scene/utils/isExcellent'

import { shader_level } from 'Scene/shaders/shader_level'
import { generateItemName } from 'helpers/generateItemName'
import { getShaderedBackpackModel } from './utils/getShaderedBackpackModel'

interface Props { position?: number[], rotation?: number[], scale?: number[], onPointerEnter?: (e?: any) => void, onPointerLeave?: (e?: any) => void, item: BackpackSlot }
const SlotModel = memo(forwardRef(function SlotModel({ item, ...props }: Props, ref: any) {
    const { map } = useTexture({ map: 'assets/notexture.png' })

    const uniforms = useRef({ uTime: { value: 0 } })


    // @ts-expect-error
    const model = useMemo<THREE.Mesh>(() => {
        const newModel = getShaderedBackpackModel(item.itemAttributes, uniforms)

        if (!newModel) {
            return new THREE.Mesh(
                new THREE.BoxGeometry(+item.itemAttributes.itemWidth / 4, +item.itemAttributes.itemHeight / 4, +item.itemAttributes.itemWidth / 4),
                new THREE.MeshStandardMaterial({ color: 'pink', map })
            )
        }
        return newModel
    }, [item, map])


    useFrame(({ clock }) => {
        if (model) {
            uniforms.current.uTime.value = clock.getElapsedTime()
        }
    })


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