import * as THREE from 'three'
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"
import { SkeletonUtils } from "three-stdlib"
import { getNpcModel } from "./getNpcModel"

import type { Fighter } from "interfaces/fighter.interface"

// TODO: Think about this
export const getShaderedNpc = (item: Fighter, uniforms?: any) => {
    const gltf: GLTF = getNpcModel(item.name)
    if (!gltf) { return null }
    // @ts-expect-error
    const model: THREE.Group | THREE.SkinnedMesh = SkeletonUtils.clone(gltf.scene)

    model.traverse((object: any) => {
        if (object.isMesh) {
            object.castShadow = true
            object.revieveShadow = true

            // Detect Heatbox
            if (object.name.toLowerCase() === 'heatbox') {
                object.castShadow = false
                object.revieveShadow = false
                object.material.transparent = true
                object.material.opacity = .3
                object.material.depthTest = false
                object.material.depthWrite = false
                object.visible = false
            }
        }
    })

    return { model, animations: gltf.animations }
}