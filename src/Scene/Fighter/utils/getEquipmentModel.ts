import { useGLTFLoaderStore } from "Scene/GLTFLoader/GLTFLoaderStore"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"

export const getEquipmentModel = (name: string): GLTF => {
    const models = useGLTFLoaderStore.getState().models.current
    if (name.toLowerCase().includes('helm')) {
        return models['fighter_dragon_helmet']
    }
    if (name.toLowerCase().includes('armour')) {
        return models['fighter_dragon_chest']
    }
    if (name.toLowerCase().includes('gloves')) {
        return models['fighter_dragon_gloves']
    }
    if (name.toLowerCase().includes('pants')) {
        return models['fighter_dragon_trousers']
    }
    if (name.toLowerCase().includes('boots')) {
        return models['fighter_dragon_boots']
    }
    if (name.toLowerCase().includes('sword')) {
        return models['sword']
    }
    return null
}