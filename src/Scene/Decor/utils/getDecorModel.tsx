import { useGLTFLoaderStore } from "Scene/GLTFLoader/GLTFLoaderStore"
import { getIs } from "Scene/utils/utils"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"

export const getDecorModel = (name: string): GLTF => {
    const models = useGLTFLoaderStore.getState().models.current
    const is = getIs(name)

    // Tree
    if (is('tree')) return models['decor_tree']

    // Grass
    if (is('grass')) return models['decor_grass']


    return null
}