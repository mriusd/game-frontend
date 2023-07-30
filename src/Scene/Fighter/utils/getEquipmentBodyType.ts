import type { BackpackSlot } from "interfaces/backpack.interface"
import { getIs } from "Scene/utils/utils"

export const bodyType = {
    helmet: 'helmet',
    armour: 'armour',
    gloves: 'gloves',
    pants: 'pants',
    boots: 'boots'
}

export const getEquipmentBodyType = (item: BackpackSlot) => {
    const is = getIs(item.itemAttributes.name)
    if (is('helm')) { return bodyType.helmet }
    if (is('armour')) { return bodyType.armour }
    if (is('gloves')) { return bodyType.gloves }
    if (is('pants')) { return bodyType.pants }
    if (is('boots')) { return bodyType.boots }
    return null
}