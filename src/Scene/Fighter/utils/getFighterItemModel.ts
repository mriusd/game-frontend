import { useGLTFLoaderStore } from "Scene/GLTFLoader/GLTFLoaderStore"

export const getFighterItemModel = (name: string): THREE.Mesh | null => {
    const models = useGLTFLoaderStore.getState().models
    if (name.toLowerCase().includes('boots')) {
        return models['dragon_boots']
    }
    if (name.toLowerCase().includes('sword')) {
        return models['sword']
    }
    if (name.toLowerCase().includes('pants')) {
        return models['dragon_trousers']
    }
    if (name.toLowerCase().includes('gloves')) {
        return models['dragon_gloves']
    }
    if (name.toLowerCase().includes('helm')) {
        return models['dragon_helmet']
    }
    if (name.toLowerCase().includes('armour')) {
        return models['dragon_chest']
    }
    if (name.toLowerCase().includes('pendant')) {
        return models['dragon_sholders']
    }
    if (name.toLowerCase().includes('box')) {
        return models['magic_box']
    }
    return null
}