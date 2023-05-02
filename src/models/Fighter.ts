import { Coordinate } from './Coordinate';
import { Damage } from './Damage';
import { Backpack } from './Backpack';

export interface Fighter {
    id: string;
    maxHealth: number;
    name: string;
    isNpc: boolean;
    isDead: boolean;
    canFight: boolean;
    lastDmgTimestamp: number;
    healthAfterLastDmg: number;
    hpRegenerationRate: number;
    hpRegenerationBonus: number;
    tokenId: number;
    location: string;
    attackSpeed: number;
    damageReceived: Damage[];
    ownerAddress: string;
    coordinates: Coordinate;
    movementSpeed: number; // squares per minute
    isClosed: boolean;
    skill: number;
    spawnCoords: Coordinate;
    backpack: Backpack | null;
    currentHealth: number;
    currentMana: number;
}
