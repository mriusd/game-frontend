import { useGLTFLoaderStore } from "Scene/GLTFLoader/GLTFLoaderStore"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"
import { getIs } from "Scene/utils/utils"
import { SkeletonUtils } from "three-stdlib"
import { useMemo } from "react"

const getFighterModel = (name: string): GLTF => {
    const models = useGLTFLoaderStore.getState().models.current
    const is = getIs(name)
    if (is('man')) return models['fighter_man']
    return models['fighter_man']
}

export const useFighterSkin = (name: string) => {
    return useMemo(() => {
        const gltf: GLTF = getFighterModel(name)
        if (!gltf) { return null }
        // @ts-expect-error
        const model: THREE.Group | THREE.SkinnedMesh = SkeletonUtils.clone(gltf.scene)
        model.traverse((object: any) => {
            if (object.isMesh) {
                object.castShadow = true
                object.revieveShadow = true
            }
        })
        return { model, animations: gltf.animations }
    }, [name])
}