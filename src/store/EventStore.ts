import { createWithEqualityFn } from 'zustand/traditional'
import { shallow } from 'zustand/shallow';
import type { Inventory, InventorySlot } from "interfaces/inventory.interface";
import { useBackpackStore } from "./backpackStore";
import { Coordinate } from "interfaces/coordinate.interface";

// TODO: Move the hole websocket over here or just change the EventCloud
// import useWebSocket from "react-use-websocket";
import type { JsonValue } from "react-use-websocket/dist/lib/types";

// For TEST, Then has to get from server
import { equipment as equipmentSlots } from "interfaces/equipment.interface";
import type { Equipment } from "interfaces/equipment.interface";

import type { Fighter } from 'interfaces/fighter.interface';
import type { Skill } from 'interfaces/skill.interface';
import type { Direction } from 'interfaces/direction.interface';


import { useFighter } from 'Scene/Fighter/useFighter';

export interface EventStoreInterface {
    sendJsonMessage: (jsonMessage: JsonValue) => void | null
    init: (sendJsonMessage: (jsonMessage: JsonValue) => void) => void

    // Inventory
    backpack: Inventory | null
    equipment: Record<number, InventorySlot> | null
    equipmentSlots: Record<number, Equipment> | null
    updateEquipment: (equipment: Record<number, InventorySlot>) => void
    updateBackpack: (backpack: Inventory) => void

    // User Events
    updateItemBackpackPosition: (itemHash: string, position: { x: number; z: number }) => void
    dropBackpackItem: (itemHash: string, position: { x: number; z: number }) => void
    unequipBackpackItem: (itemHash: string, position: { x: number; z: number }) => void
    equipBackpackItem: (itemHash: string, slot: number) => void


    // Server Game Events
    // events: Array<any>
    // setEvents: (event: any) => void

    // Attack
    target: { target: Fighter | null, skill: Skill | null }
    setTarget: (target: Fighter, skill: Skill) => void
    selectedSkill: number
    setSelectedSkill: (skill: number) => void
    submitSkill: (direction: Direction) => void
    submitMalee: (direction: Direction) => void


    // Fighter
    moveFighter: (coordinate: Coordinate) => void
    updateFighterDirection: (direction: Direction) => void
}

export const useEvents = createWithEqualityFn<EventStoreInterface>((set, get) => ({
    // Init
    sendJsonMessage: null,
    init: (sendJsonMessage) => set(() => ({ sendJsonMessage })),

    // Inventory
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

    updateItemBackpackPosition(itemHash, position) {
        const needServerRerender = { value: true }

        // Update State Localy
        set(() => {
            const backpack = { ...get().backpack }
            const newKey = `${position.x},${position.z}`
            for (const key in backpack.items) {
                if (backpack.items[key].itemHash === itemHash) {
                    if (key === newKey) {
                        needServerRerender.value = false
                        break
                    }

                    // Update Grid available cells settings
                    // rm old
                    for (let i = 0; i < backpack.items[key].itemAttributes.itemHeight; i++) {
                        for (let j = 0; j < backpack.items[key].itemAttributes.itemWidth; j++) {
                            const prevX = +key.split(',')[0] + j
                            const prevY = +key.split(',')[1] + i
                            backpack.grid[prevY][prevX] = false
                        }
                    }
                    // set new
                    for (let i = 0; i < backpack.items[key].itemAttributes.itemHeight; i++) {
                        for (let j = 0; j < backpack.items[key].itemAttributes.itemWidth; j++) {
                            const x = position.x + j
                            const y = position.z + i
                            backpack.grid[y][x] = true
                        }
                    }

                    // Set new Key with Item to Backpack
                    backpack.items[`${position.x},${position.z}`] = backpack.items[key]
                    // Remove old Key from Backpack
                    delete backpack.items[key]
                    break
                }
            }
            return ({ backpack })
        })
        // Send to Server
        if (needServerRerender.value) {
            get().sendJsonMessage({
                type: "update_backpack_item_position",
                data: { itemHash, position }
            });
        }
    },
    dropBackpackItem(itemHash, position) {
        get().sendJsonMessage({
            type: "drop_backpack_item",
            data: { itemHash, position }
        });
    },
    equipBackpackItem(itemHash, slot) {
        // Update State Localy
        set(() => {
            const backpack = { ...get().backpack }
            const equipment = { ...get().equipment }

            for (const key in backpack.items) {
                if (backpack.items[key].itemHash === itemHash) {
                    const item = backpack.items[key]

                    // Update Grid available cells settings
                    for (let i = 0; i < item.itemAttributes.itemHeight; i++) {
                        for (let j = 0; j < item.itemAttributes.itemWidth; j++) {
                            const x = +key.split(',')[0] + j
                            const y = +key.split(',')[1] + i
                            backpack.grid[y][x] = false
                        }
                    }

                    // Add Item to Equipment
                    equipment[slot] = item
                    // Remove Item from Backpack
                    delete backpack.items[key]
                    break
                }
            }

            return ({ backpack, equipment })
        })

        // Send to Server
        get().sendJsonMessage({
            type: "equip_backpack_item",
            data: { itemHash, slot }
        });
    },
    unequipBackpackItem(itemHash, position) {
        // Update State Localy
        set(() => {
            const backpack = { ...get().backpack }
            const equipment = { ...get().equipment }

            for (const key in equipment) {
                if (equipment[key].itemHash === itemHash) {
                    const item = equipment[key]

                    // Update Grid available cells settings
                    // @ts-expect-error
                    for (let i = 0; i < item.itemAttributes.itemHeight; i++) {
                        // @ts-expect-error
                        for (let j = 0; j < item.itemAttributes.itemWidth; j++) {
                            const x = position.x + j
                            const y = position.z + i
                            backpack.grid[y][x] = true
                        }
                    }

                    // Add Item to Backpack
                    backpack.items[`${position.x},${position.z}`] = item
                    // Remove Item from Equipments
                    delete equipment[key]
                    break
                }
            }

            return ({ backpack, equipment })
        })

        // Send to Server
        get().sendJsonMessage({
            type: "unequip_backpack_item",
            data: { itemHash, position }
        });
    },

    // Attack
    target: { target: null, skill: null },
    setTarget: (target, skill) => set({ target: { target, skill } }),
    selectedSkill: 4,
    setSelectedSkill: (skill: number) => set({ selectedSkill: skill }),
    submitSkill: async (direction) => {
        const $this = get()
        if (!$this?.target?.target?.id) { return }
        $this.sendJsonMessage({
            type: "submit_attack",
            // @ts-expect-error
            data: {
                opponentID: $this.target.target.id.toString(),
                playerID: useFighter.getState().fighter.tokenId.toString(),
                skill: $this.selectedSkill,
                direction: direction
            }
        });
    },
    submitMalee: async (direction: Direction) => {
        const $this = get()
        if (!$this?.target?.target?.id) { return }
        $this.sendJsonMessage({
            type: "submit_attack",
            // @ts-expect-error
            data: {
                opponentID: $this.target?.target?.id.toString(),
                playerID: useFighter.getState().fighter.tokenId.toString(),
                skill: 0,
                direction: direction
            }
        });
    },
    
    // Fighter
    moveFighter: async (coordinate) => {
        const $this = get()
        const { x, z } = coordinate
		$this.sendJsonMessage({
			type: "move_fighter",
			data: { x, z }
		});
    },
    updateFighterDirection: async (direction) => {
        const $this = get()
        $this.sendJsonMessage({
            type: "update_fighter_direction",
            data: { direction: direction as any }
        });
    }

}), shallow)
