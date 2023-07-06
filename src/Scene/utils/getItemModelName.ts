import { tbm } from "store/LoadAssetsContext"

// Just for test porpose
export const getItemModelName = (name: string) => {
    if (name.toLowerCase().includes('boots')) {
        return tbm.dragon_boots
    }
    if (name.toLowerCase().includes('sword')) {
        return tbm.sword
    }
    if (name.toLowerCase().includes('pants')) {
        return tbm.dragon_trousers
    }
    if (name.toLowerCase().includes('gloves')) {
        return tbm.dragon_gloves
    }
    if (name.toLowerCase().includes('helm')) {
        return tbm.dragon_helmet
    }
    if (name.toLowerCase().includes('armour')) {
        return tbm.dragon_chest
    }
    if (name.toLowerCase().includes('pendant')) {
        return tbm.dragon_sholders
    }
    if (name.toLowerCase().includes('box')) {
        return tbm.magic_box
    }
    return 'none'
}