import { useGLTFLoaderStore } from "Scene/GLTFLoader/GLTFLoaderStore"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"

export const getDecorModel = (name: string): GLTF => {
    const models = useGLTFLoaderStore.getState().models.current
    const key = Object.keys(models).find(_ => (_.toLowerCase().includes(name) && _.toLowerCase().includes('decor')))
    if (key) return models[key]
    return null
}