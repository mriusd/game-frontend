import { create } from "zustand";
import type { Backpack, BackpackSlot } from "interfaces/backpack.interface";
import { useBackpackStore } from "./backpackStore";
import { Coordinate } from "interfaces/coordinate.interface";

// TODO: Move the hole websocket over here or just change the EventCloud
// import useWebSocket from "react-use-websocket";
import type { JsonValue } from "react-use-websocket/dist/lib/types";

// For TEST, Then has to get from server
import { equipment as equipmentSlots } from "interfaces/equipment.interface";
import type { Equipment } from "interfaces/equipment.interface";

// -------------------
// I use this layer for EventCloud to prevent lots of react rerenders
// -------------------

export interface EventStoreInterface {
    sendJsonMessage: (jsonMessage: JsonValue) => void | null
    init: (sendJsonMessage: (jsonMessage: JsonValue) => void) => void

    backpack: Backpack | null
    equipment: BackpackSlot | null
    equipmentSlots: Record<number, Equipment> | null
    updateEquipment: (equipment: BackpackSlot) => void
    updateBackpack: (backpack: Backpack) => void

    // User Events
    updateItemBackpackPosition: (itemHash: string, position: { x: number; z: number }) => void
    dropBackpackItem: (itemHash: string, position: { x: number; z: number }) => void
    unequipBackpackItem: (itemHash: string, position: { x: number; z: number }) => void
    equipBackpackItem: (itemHash: string, slot: number) => void

}

export const useEventStore = create<EventStoreInterface>((set, get) => ({
    // Init
    sendJsonMessage: null,
    init: (sendJsonMessage) => {
        set(() => ({ sendJsonMessage }))
    },

    // Backpack
    backpack: null,
    equipment: null,
    equipmentSlots: equipmentSlots,
    updateEquipment: (equipment) => {
        set(() => ({ equipment: equipment }))
    },
    updateBackpack: (backpack) => {
        set(() => ({ backpack: backpack }))
        // Sets the size of backpack based on Server Side
        useBackpackStore.setState(() => ({ width: backpack.grid[0].length, height: backpack.grid.length }))
    },

    // TODO: customise locally
    updateItemBackpackPosition(itemHash, position) {
        // set(state => {
        //     const backpack = get().backpack.items.forEach()
        // })
        get().sendJsonMessage({
            type: "update_backpack_item_position",
            data: { itemHash, position }
        });
    },
    dropBackpackItem(itemHash, position) {
        get().sendJsonMessage({
            type: "drop_backpack_item",
            data: { itemHash, position }
        });
    },
    equipBackpackItem(itemHash, slot) {
        get().sendJsonMessage({
            type: "equip_backpack_item",
            data: { itemHash, slot }
        });
    },
    unequipBackpackItem(itemHash, position) {
        get().sendJsonMessage({
            type: "unequip_backpack_item",
            data: { itemHash, position }
        });
    }
}))