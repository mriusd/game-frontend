import { useGLTFLoaderStore } from "Scene/GLTFLoader/GLTFLoaderStore"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"

export const getBackpackModel = (name: string): GLTF => {
    const models = useGLTFLoaderStore.getState().models.current

    // Gold
    if (is('gold')) {
        return models['shared_gold']
    }

    // Wings
    if (is('wings')) {
        return models['inventory_simple_wings']
    }

    // Dragon Set
    if (is('dragon')) {
        if (is('helm')) return models['inventory_dragon_helmet']
        if (is('armour')) return models['inventory_dragon_armour']
        if (is('gloves')) return models['inventory_dragon_gloves']
        if (is('pants')) return models['inventory_dragon_trousers']
        if (is('boots')) return models['inventory_dragon_boots']
    }

    // Legendary Set
    if (is('legendary')) {
        if (is('helm')) return models['inventory_legendary_helmet']
        if (is('armour')) return models['inventory_legendary_armour']
        if (is('gloves')) return models['inventory_legendary_gloves']
        if (is('pants')) return models['inventory_legendary_trousers']
        if (is('boots')) return models['inventory_legendary_boots']
    }
   
    // Sword
    if (is('sword')) {
        return models['inventory_crystal_sword']
    }

    // Magic Box
    if (is('magic box')) {
        return models['shared_magicBox']
    }

    return null


    function is(value: string) {
        return name.toLowerCase().includes(value.toLowerCase())
    }
}