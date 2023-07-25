import { useGLTFLoaderStore } from "Scene/GLTFLoader/GLTFLoaderStore"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"

export const getEquipmentModel = (name: string): GLTF => {
    const models = useGLTFLoaderStore.getState().models.current

    // Dragon Set
    if (is('dragon')) {
        if (is('helm')) return models['fighter_dragon_helmet']
        if (is('armour')) return models['fighter_dragon_chest']
        if (is('gloves')) return models['fighter_dragon_gloves']
        if (is('pants')) return models['fighter_dragon_trousers']
        if (is('boots')) return models['fighter_dragon_boots']
        if (is('sword')) return models['sword']
    }

    if (is('legendary')) {
        if (is('helm')) return models['fighter_dragon_helmet']
        if (is('armour')) return models['fighter_dragon_chest']
        if (is('gloves')) return models['fighter_dragon_gloves']
        if (is('pants')) return models['fighter_dragon_trousers']
        if (is('boots')) return models['fighter_dragon_boots']
        if (is('sword')) return models['sword']
    }

    return null

    function is(value: string) {
        return name.toLowerCase().includes(value.toLowerCase())
    }
}