import { InventorySlot } from './inventory.interface';

export interface EquipmentSlots {
    [key: number]: string;
};

export interface Equipment {
    items: Record<number, InventorySlot>
    is_equipped: Record<number, boolean>
}