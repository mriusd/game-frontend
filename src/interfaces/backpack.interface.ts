import { ItemAttributes } from './item.interface';

export interface BackpackSlot {
  itemAttributes: ItemAttributes;
  qty: number;
  itemHash: string;
}

export interface Backpack {
  grid: boolean[][];
  items: Map<string, BackpackSlot>;
}