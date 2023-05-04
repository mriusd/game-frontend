import { ItemAttributes } from './item.interface';

interface BackpackSlot {
  itemAttributes: ItemAttributes;
  qty: number;
}

interface Backpack {
  grid: boolean[][];
  items: Map<string, BackpackSlot>;
}