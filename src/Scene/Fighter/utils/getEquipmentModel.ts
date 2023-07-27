import { useGLTFLoaderStore } from "Scene/GLTFLoader/GLTFLoaderStore"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"

export const getEquipmentModel = (name: string): GLTF => {
    const models = useGLTFLoaderStore.getState().models.current

    // Wings
    if (is('wings')) return models['fighter_simple_wings']

    // Dragon Set
    if (is('dragon')) {
        if (is('helm')) return models['fighter_dragon_helmet']
        if (is('armour')) return models['fighter_dragon_chest']
        if (is('gloves')) return models['fighter_dragon_gloves']
        if (is('pants')) return models['fighter_dragon_trousers']
        if (is('boots')) return models['fighter_dragon_boots']
    }

    // Legendary Set
    if (is('legendary')) {
        if (is('helm')) return models['fighter_legendary_helmet']
        if (is('armour')) return models['fighter_legendary_chest']
        if (is('gloves')) return models['fighter_legendary_gloves']
        if (is('pants')) return models['fighter_legendary_trousers']
        if (is('boots')) return models['fighter_legendary_boots']
    }

    // Sword
    if (is('sword')) return models['fighter_crystal_sword']


    return null

    function is(value: string) {
        return name.toLowerCase().includes(value.toLowerCase())
    }
}