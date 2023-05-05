import type { Fighter } from "./fighter.interface";
import type { Coordinate } from "./coordinate.interface";
import { BackpackSlot } from './backpack.interface';

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
    equipment: Record<number, BackpackSlot> 
    moveFighter: (coordinate: Coordinate) => void 
    submitAttack: any
    target: any
    setTarget: any
    refreshFighterItems: any
    generateItemName: any
    isExcellent: any
    pickupDroppedItem: any
    backpack: any
    updateItemBackpackPosition: any
    dropBackpackItem: any
    selectedSkill: number
    setSelectedSkill: any
    equipBackpackItem: any
    unequipBackpackItem: any
}
