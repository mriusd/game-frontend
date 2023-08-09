import { TokenAttributes } from './item.interface';

export interface BackpackSlot {
  itemAttributes: TokenAttributes;
  qty: number;
  itemHash: string;
}

export interface Backpack {
  grid: boolean[][];
  items: Map<string, BackpackSlot>;
}