import { useGLTFLoaderStore } from "Scene/GLTFLoader/GLTFLoaderStore"
import { getIs } from "Scene/utils/utils"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"

export const getDecorModel = (name: string): GLTF => {
    const models = useGLTFLoaderStore.getState().models.current
    const is = getIs(name)

    // Christmass Tree
    if (is('christmas', 'tree')) return models['decor_christmas_tree']

    // Tree
    if (is('tree')) return models['decor_tree']

    // Grass
    if (is('grass')) return models['decor_grass']

    // Flower
    if (is('flower')) return models['decor_flower']

    // House
    if (is('house')) return models['decor_house']

    // Stone
    if (is('stone')) return models['decor_stone']

    return null
}