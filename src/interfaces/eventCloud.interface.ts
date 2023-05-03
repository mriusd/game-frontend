import type { Fighter } from "./fighter.interface"
import type { Coordinate } from "./coordinate.interface"

export interface EventCloud {
    PlayerID: any 
    events: any 
    addDamageEvent: any 
    setEvents: any
    removeEvent: any
    fighter: Fighter 
    npcList: Fighter[] 
    droppedItems: any
    money: any 
    equipment: any 
    moveFighter: (coordinate: Coordinate) => void 
    submitAttack: any
    target: any
    setTarget: any
    refreshFighterItems: any
    generateItemName: any
    isExcellent: any
    pickupDroppedItem: any
    backpack: any
}
