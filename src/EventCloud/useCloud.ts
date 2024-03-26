import { createWithEqualityFn } from 'zustand/traditional'
import { shallow } from 'zustand/shallow';

// For TEST, Then has to get from server
import { equipment as equipmentSlots } from "interfaces/equipment.interface";
// 

import type { JsonValue } from './hooks/useWorkerWebSocket';
import type { Equipment } from "interfaces/equipment.interface";
import type { Fighter } from 'interfaces/fighter.interface';
import type { Skill } from 'interfaces/skill.interface';
import type { Direction } from 'interfaces/direction.interface';
import type { FighterAttributes } from 'interfaces/fighterAttributes.interface';
import type { Inventory, InventorySlot } from "interfaces/inventory.interface";
import type { Coordinate } from "interfaces/coordinate.interface";
import type { MapObject } from 'interfaces/mapObject.interface';

import { useFighter } from 'Scene/Fighter/useFighter';
import { useBackpack } from "../Scene/UserInterface3D/Backpack/useBackpack";


export type TargetType = {
    target: Fighter | null 
    skill: Skill | null
}
export interface CloudStoreInterface {
    readyState: boolean
    sendJsonMessage: (jsonMessage: JsonValue) => void | null
    init: (sendJsonMessage: (jsonMessage: JsonValue) => void) => void


    // Auth
    account: string
    setAccount: (account: string) => void
    sendAuth: (target: any) => void
    userFighters: Fighter[]
    setUserFighters: (userFighters: Fighter[]) => void
    fetchUserFighters: (ownerAddress: string) => void
    createFighter: (ownerAddress: string, fighterClass: string, name: string) => void


    // Players
    playerList: Fighter[],
    setPlayerList: (playerList: Fighter[]) => void


    // Inventory
    backpack: Inventory | null
    equipment: Record<number, InventorySlot> | null
    equipmentSlots: Record<number, Equipment> | null
    updateEquipment: (equipment: Record<number, InventorySlot>) => void
    updateBackpack: (backpack: Inventory) => void

    vault: Inventory | null
    updateVault: (vault: Inventory) => void
    requestVault: () => void

    shop: Inventory | null
    updateShop: (vault: Inventory) => void
    requestShop: () => void

    // User Events
    updateItemBackpackPosition: (itemHash: string, position: { x: number; z: number }) => void
    dropBackpackItem: (itemHash: string, position: { x: number; z: number }) => void
    unequipBackpackItem: (itemHash: string, position: { x: number; z: number }) => void
    equipBackpackItem: (itemHash: string, slot: number) => void
    buyItemShop: (itemHash: string) => void
    dropVaultItem: (itemHash: string, position: { x: number; z: number }) => void
    moveItemFromBackpackToVault: (itemHash: string, position: { x: number; z: number }) => void
    moveItemFromVaultToBackpack: (itemHash: string, position: { x: number; z: number }) => void
    updateItemVaultPosition: (itemHash: string, position: { x: number; z: number }) => void
    unequipVaultItem: (itemHash: string, position: { x: number; z: number }) => void
    equipVaultItem: (itemHash: string, slot: number) => void

    // Attack
    target: TargetType
    setTarget: (target: Fighter, skill: Skill) => void
    selectedSkill: number
    setSelectedSkill: (skill: number) => void
    submitAttack: (direction: Direction, target: TargetType) => void


    // Fighter
    moveFighter: (coordinate: Coordinate) => void
    updateFighterDirection: (direction: Direction) => void


    // Server Game Events
    events: any[]
    addEvent: (event: any) => void
    removeEvent: (event: any) => void

    
    // Items
    pickupDroppedItem: (event) => void
    refreshFighterItems: () => void


    // Command Line
    sendCommand: (text: string) => void


    // Chat
	chatLog: any[]
    setChatLog: (chatLog: {}) => void


    // Different
	mapObjects: MapObject[]
    setMapObjects: (mapObjects: MapObject[]) => void
}

export const useCloud = createWithEqualityFn<CloudStoreInterface>((set, get) => ({
    // Init
    readyState: false,
    sendJsonMessage: null,
    init: (sendJsonMessage) => set(() => ({ sendJsonMessage, readyState: true })),


    // Auth
    account: '',
    setAccount: (account) => set({ account }),
    sendAuth: (target) => {
        const $this = get()
        $this.sendJsonMessage({
            type: "auth",
            data: {
                playerID: target,
                userAddress: $this.account,
                locationHash: "lorencia_0_0"
            }
        });
    },
    userFighters: [],
    setUserFighters: (userFighters) => set({ userFighters }),
    fetchUserFighters: (ownerAddress) => {
        get().sendJsonMessage({
            type: "get_user_fighters",
            data: { ownerAddress }
        });
    },
    createFighter(ownerAddress: string, fighterClass: string, name: string) {
        console.log('create fighter', { ownerAddress, fighterClass, name })
        get().sendJsonMessage({
            type: "create_fighter",
            data: { ownerAddress, fighterClass, name }
        });
    },


    // Players
    playerList: [],
    setPlayerList: (playerList) => set({ playerList }),


    // Inventory
    backpack: null,
    equipment: null,
    equipmentSlots: equipmentSlots,

    vault: null,
    updateVault(vault) {
        console.log('[updateVault] ', vault);
        set(() => ({ vault }))
    },
    requestVault() {
        get().sendJsonMessage({
            type: "get_vault",
            data: {}
        });
    },

    shop: null,
    updateShop(shop) {
        console.log('[updateShop] ', shop);
        set(() => ({ shop }))
    },
    requestShop() {
        get().sendJsonMessage({
            type: "get_shop",
            data: { shopName: 'potion_girl' }
        });
    },
    buyItemShop(itemHash) {
        get().sendJsonMessage({
            type: "buy_item",
            data: { shopName: 'potion_girl', itemHash }
        });
    },

    updateEquipment: (equipment) => {
        set(() => ({ equipment: equipment }))
    },
    updateBackpack: (backpack) => {
        console.log('[updateBackpack] ', backpack);
        set(() => ({ backpack: backpack }))
    },

    moveItemFromBackpackToVault(itemHash, position) {
        get().sendJsonMessage({
            type: "move_item_from_backpack_to_vault",
            data: { itemHash, position }
        });
    },
    moveItemFromVaultToBackpack(itemHash, position) {
        get().sendJsonMessage({
            type: "move_item_from_vault_to_backpack",
            data: { itemHash, position }
        });
    },
    updateItemVaultPosition(itemHash, position) {
        const needServerRerender = { value: true }

        // // Update State Localy
        // set(() => {
        //     const backpack = { ...get().backpack }
        //     const newKey = `${position.x},${position.z}`
        //     for (const key in backpack.items) {
        //         if (backpack.items[key].itemHash === itemHash) {
        //             if (key === newKey) {
        //                 needServerRerender.value = false
        //                 break
        //             }

        //             // Update Grid available cells settings
        //             // rm old
        //             for (let i = 0; i < backpack.items[key].itemAttributes.itemHeight; i++) {
        //                 for (let j = 0; j < backpack.items[key].itemAttributes.itemWidth; j++) {
        //                     const prevX = +key.split(',')[0] + j
        //                     const prevY = +key.split(',')[1] + i
        //                     backpack.grid[prevY][prevX] = false
        //                 }
        //             }
        //             // set new
        //             for (let i = 0; i < backpack.items[key].itemAttributes.itemHeight; i++) {
        //                 for (let j = 0; j < backpack.items[key].itemAttributes.itemWidth; j++) {
        //                     const x = position.x + j
        //                     const y = position.z + i
        //                     backpack.grid[y][x] = true
        //                 }
        //             }

        //             // Set new Key with Item to Backpack
        //             backpack.items[`${position.x},${position.z}`] = backpack.items[key]
        //             // Remove old Key from Backpack
        //             delete backpack.items[key]
        //             break
        //         }
        //     }
        //     return ({ backpack })
        // })
        // Send to Server
        if (needServerRerender.value) {
            get().sendJsonMessage({
                type: "update_vault_item_position",
                data: { itemHash, position }
            });
        }
    },
    dropVaultItem(itemHash, position) {
        get().sendJsonMessage({
            type: "drop_vault_item",
            data: { itemHash, coordinates: position }
        });
    },

    updateItemBackpackPosition(itemHash, position) {
        const needServerRerender = { value: true }

        // // Update State Localy
        // set(() => {
        //     const backpack = { ...get().backpack }
        //     const newKey = `${position.x},${position.z}`
        //     for (const key in backpack.items) {
        //         if (backpack.items[key].itemHash === itemHash) {
        //             if (key === newKey) {
        //                 needServerRerender.value = false
        //                 break
        //             }

        //             // Update Grid available cells settings
        //             // rm old
        //             for (let i = 0; i < backpack.items[key].itemAttributes.itemHeight; i++) {
        //                 for (let j = 0; j < backpack.items[key].itemAttributes.itemWidth; j++) {
        //                     const prevX = +key.split(',')[0] + j
        //                     const prevY = +key.split(',')[1] + i
        //                     backpack.grid[prevY][prevX] = false
        //                 }
        //             }
        //             // set new
        //             for (let i = 0; i < backpack.items[key].itemAttributes.itemHeight; i++) {
        //                 for (let j = 0; j < backpack.items[key].itemAttributes.itemWidth; j++) {
        //                     const x = position.x + j
        //                     const y = position.z + i
        //                     backpack.grid[y][x] = true
        //                 }
        //             }

        //             // Set new Key with Item to Backpack
        //             backpack.items[`${position.x},${position.z}`] = backpack.items[key]
        //             // Remove old Key from Backpack
        //             delete backpack.items[key]
        //             break
        //         }
        //     }
        //     return ({ backpack })
        // })
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
        // // Update State Localy
        // set(() => {
        //     const backpack = { ...get().backpack }
        //     const equipment = { ...get().equipment }

        //     for (const key in backpack.items) {
        //         if (backpack.items[key].itemHash === itemHash) {
        //             const item = backpack.items[key]

        //             // Update Grid available cells settings
        //             for (let i = 0; i < item.itemAttributes.itemHeight; i++) {
        //                 for (let j = 0; j < item.itemAttributes.itemWidth; j++) {
        //                     const x = +key.split(',')[0] + j
        //                     const y = +key.split(',')[1] + i
        //                     backpack.grid[y][x] = false
        //                 }
        //             }

        //             // Add Item to Equipment
        //             equipment[slot] = item
        //             // Remove Item from Backpack
        //             delete backpack.items[key]
        //             break
        //         }
        //     }

        //     return ({ backpack, equipment })
        // })

        // Send to Server
        get().sendJsonMessage({
            type: "equip_backpack_item",
            data: { itemHash, slot }
        });
    },
    unequipBackpackItem(itemHash, position) {
        // // Update State Localy
        // set(() => {
        //     const backpack = { ...get().backpack }
        //     const equipment = { ...get().equipment }

        //     for (const key in equipment) {
        //         if (equipment[key].itemHash === itemHash) {
        //             const item = equipment[key]

        //             // Update Grid available cells settings
        //             // @ts-expect-error
        //             for (let i = 0; i < item.itemAttributes.itemHeight; i++) {
        //                 // @ts-expect-error
        //                 for (let j = 0; j < item.itemAttributes.itemWidth; j++) {
        //                     const x = position.x + j
        //                     const y = position.z + i
        //                     backpack.grid[y][x] = true
        //                 }
        //             }

        //             // Add Item to Backpack
        //             backpack.items[`${position.x},${position.z}`] = item
        //             // Remove Item from Equipments
        //             delete equipment[key]
        //             break
        //         }
        //     }

        //     return ({ backpack, equipment })
        // })

        // Send to Server
        get().sendJsonMessage({
            type: "unequip_backpack_item",
            data: { itemHash, position }
        });
    },
    equipVaultItem(itemHash, slot) {
        // Send to Server
        get().sendJsonMessage({
            type: "equip_vault_item",
            data: { itemHash, slot }
        });
    },
    unequipVaultItem(itemHash, position) {
        get().sendJsonMessage({
            type: "unequip_vault_item",
            data: { itemHash, position }
        });
    },


    // Attack
    target: { target: null, skill: null },
    setTarget: (target, skill) => set({ target: { target, skill } }),
    selectedSkill: 4,
    setSelectedSkill: (skill: number) => set({ selectedSkill: skill }),
    submitAttack: async (direction, target) => {
        const $this = get()
        if (!target?.target?.id) { return }
        
        $this.sendJsonMessage({
            type: "submit_attack",
            data: {
                opponentID: target.target.id.toString(),
                playerID: useFighter.getState().fighter.tokenId.toString(),
                skill: target.skill.skillId,
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
    },


    // Server Game Events
    events: [],
    addEvent: (event) => void set(state => ({ events: [...state.events, event] })),
    removeEvent: (event) => void set(state => ({ events: state.events.filter((e) => e !== event) })),


    // Items
    pickupDroppedItem: (event) => {
        get().sendJsonMessage({
            type: "pickup_dropped_item",
            data: {
                itemHash: event.itemHash,
            }

        });
    },
    refreshFighterItems: () => {
        const $fighter = useFighter.getState()
        get().sendJsonMessage({
            type: "get_fighter_items",
            data: {
                fighterId: parseInt($fighter.fighter.tokenId as any),
            }
        });
    },


    // Command Line
    sendCommand: (text) => {
		get().sendJsonMessage({
			type: "message",
			data: { text }
		});
	},


    // Chat
    chatLog: [],
    setChatLog: (chatLog) => set(state => ({ chatLog: [...state.chatLog, chatLog] })),


    // Different
    mapObjects: [],
    setMapObjects: (mapObjects) => set({ mapObjects })
}), shallow)