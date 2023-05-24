import type { Fighter } from "./fighter.interface";
import type { Coordinate } from "./coordinate.interface";
import { BackpackSlot } from './backpack.interface';
import type { ItemDroppedEvent } from "./item.interface"; 
import type { Direction } from "./direction.interface"; 
import type { MapObject } from "./mapObject.interface"; 

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
    submitSkill: (direction: Direction) => void
    submitMalee: (direction: Direction) => void
    target: any
    setTarget: (targetId: number | string) => void
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
    sendCommand: (text: string) => void
    mapObjects: MapObject[]
}
