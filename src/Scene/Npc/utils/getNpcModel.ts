import { useGLTFLoaderStore } from "Scene/GLTFLoader/GLTFLoaderStore"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"
import { getIs } from "Scene/utils/utils"

export const getNpcModel = (name: string): GLTF => {
    const models = useGLTFLoaderStore.getState().models.current
    const is = getIs(name)
    return models['npc_bull']
}