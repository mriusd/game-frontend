import { create } from "zustand";
import type { Backpack, BackpackSlot } from "interfaces/backpack.interface";
import { useBackpackStore } from "./backpackStore";
import { Coordinate } from "interfaces/coordinate.interface";

// TODO: Move the hole websocket over here or just change the EventCloud
// import useWebSocket from "react-use-websocket";
import type { JsonValue } from "react-use-websocket/dist/lib/types";

// For TEST, Then has to get from server
import { equipment } from "interfaces/equipment.interface";
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
    updateItemBackpackPosition: (itemHash: string, coords: { x: number; z: number }) => void
    dropBackpackItem: (itemHash: string, coords: { x: number; z: number }) => void
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
    equipmentSlots: equipment,
    updateEquipment: (equipment) => {
        set(() => ({ equipment: equipment }))
    },
    updateBackpack: (backpack) => {
        set(() => ({ backpack: backpack }))
        // Sets the size of backpack based on Server Side
        useBackpackStore.setState(() => ({ width: backpack.grid[0].length, height: backpack.grid.length }))
    },
    updateItemBackpackPosition(itemHash, coords) {
        get().sendJsonMessage({
            type: "update_backpack_item_position",
            data: {
                itemHash: itemHash,
                position: coords
            }
        });
    },
    dropBackpackItem(itemHash, coords) {
        get().sendJsonMessage({
          type: "drop_backpack_item",
          data: {
              itemHash: itemHash,
              position: coords
          }
        });
      }
}))


// equipBackpackItem,
// unequipBackpackItem,