import { useGLTFLoaderStore } from "Scene/GLTFLoader/GLTFLoaderStore"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"

export const getBackpackModel = (name: string): GLTF => {
    const models = useGLTFLoaderStore.getState().models.current

    // Wings
    if (is('wings')) {
        return models['inventory_simple_wings']
    }

    // Dragon Set
    if (is('dragon')) {
        if (is('helm')) return models['dragon_helmet']
        if (is('armour')) return models['dragon_chest']
        if (is('gloves')) return models['dragon_gloves']
        if (is('pants')) return models['dragon_trousers']
        if (is('boots')) return models['dragon_boots']
    }

    // Legendary Set
    if (is('legendary')) {
        if (is('helm')) return models['legendary_helmet']
        if (is('armour')) return models['legendary_armour']
        if (is('gloves')) return models['legendary_gloves']
        if (is('pants')) return models['legendary_trousers']
        if (is('boots')) return models['legendary_boots']
    }
   
    // Sword
    if (is('crystal sword')) {
        return models['crystal_sword']
    }
    if (is('sword')) {
        return models['sword']
    }

    // Magic Box
    if (is('magic box')) {
        return models['magic_box']
    }

    return null


    function is(value: string) {
        return name.toLowerCase().includes(value.toLowerCase())
    }
}