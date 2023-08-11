import { TokenAttributes } from './item.interface';

export interface InventorySlot {
  itemAttributes: TokenAttributes;
  qty: number;
  itemHash: string;
}

export interface Inventory {
  grid: boolean[][];
  items: Map<string, InventorySlot>;
}