import { BackpackSlot } from './backpack.interface';

export interface EquipmentSlots {
    [key: number]: string;
};

export const equipmentSlots: EquipmentSlots = {
    1: "helmet",
    2: "armour",
    3: "pants",
    4: "gloves",
    5: "boots",
    6: "left hand",
    7: "right hand",
    8: "left ring",
    9: "right ring",
    10: "pendant",
    11: "wings",
};

export interface Equipment {
    slot: number; 
    equiped: boolean; 
    type: string;
    width: number;
    height: number;
}

export const equipment: Record<number, Equipment> = {
    1: {
        slot: 1,
        equiped: false,
        type: "helmet",
        width: 2,
        height: 2,
    },
    2: {
        slot: 2,
        equiped: false,
        type: "armour",
        width: 2,
        height: 3,
    },
    3: {
        slot: 3,
        equiped: false,
        type: "pants",
        width: 2,
        height: 3,
    },
    4: {
        slot: 4,
        equiped: false,
        type: "gloves",
        width: 2,
        height: 2,
    },

    5: {
        slot: 5,
        equiped: false,
        type: "boots",
        width: 2,
        height: 2,
    },
    6: {
        slot: 6,
        equiped: false,
        type: "left hand",
        width: 2,
        height: 2,
    },
    7: {
        slot: 7,
        equiped: false,
        type: "right hand",
        width: 2,
        height: 2,
    },
    8: {
        slot: 8,
        equiped: false,
        type: "left ring",
        width: 1,
        height: 1,
    },
    9: {
        slot: 9,
        equiped: false,
        type: "right ring",
        width: 1,
        height: 1,
    },
    10: {
        slot: 10,
        equiped: false,
        type: "pendant",
        width: 1,
        height: 1,
    },
    11: {
        slot: 11,
        equiped: false,
        type: "wings",
        width: 3,
        height: 3,
    },
}