import React from "react"

import * as THREE from 'three'
import { useTexture } from "@react-three/drei"

import { getShaderedBackpackModel } from "Scene/UserInterface3D/Backpack/utils/getShaderedBackpackModel"
import type { ItemDroppedEvent } from "interfaces/item.interface"

export const useShaderedItem = (item: ItemDroppedEvent) => {

    const { map } = useTexture({ map: 'assets/notexture.png' })
    const uniforms = React.useRef({ uTime: { value: 0 } })


    const model = React.useMemo(() => {
        const newModel = getShaderedBackpackModel(item.item, uniforms)

        if (!newModel) {
            return new THREE.Mesh(
                new THREE.BoxGeometry(+item.item.itemParameters.itemWidth / 4 || .5, +item.item.itemParameters.itemHeight / 4 || .5, +item.item.itemParameters.itemWidth / 4 || .5),
                new THREE.MeshStandardMaterial({ color: 'pink', map })
            )
        }
        return newModel
    }, [item, map])

    return { model, uniforms }
}