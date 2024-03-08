import { useGLTFLoaderStore } from "Scene/GLTFLoader/GLTFLoaderStore"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"
import { getIs } from "Scene/utils/utils"

export const getFragmentModel = (name: string): GLTF => {
    const models = useGLTFLoaderStore.getState().models.current
    const is = getIs(name)

    // Legendary Pants
    if (is('legendary', 'pants', 'skirt', 'front')) return models['fragments_legendary_pants_skirt_front']
    if (is('legendary', 'pants', 'skirt', 'back')) return models['fragments_legendary_pants_skirt_back']


    return null


}