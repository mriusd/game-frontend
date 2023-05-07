import type { Fighter } from "./fighter.interface";
import type { Coordinate } from "./coordinate.interface";
import { BackpackSlot } from './backpack.interface';
import type { ItemDroppedEvent } from "./item.interface"; 

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
    generateItemName: (item: any, qty: any) => string
    isExcellent: any
    pickupDroppedItem: (droppedItem: ItemDroppedEvent) => void
    backpack: any
    updateItemBackpackPosition: any
    dropBackpackItem: any
    selectedSkill: number
    setSelectedSkill: any
    equipBackpackItem: any
    unequipBackpackItem: any
}
