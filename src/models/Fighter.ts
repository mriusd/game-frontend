import { Coordinate } from './Coordinate';
import { Damage } from './Damage';
import { ItemAttributes } from './Items';

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
    currentHealth: number;
    currentMana: number;
    lastMoveTimestamp: number;

    strength: number; 
    agility: number; 
    energy: number;
    vitality: number;

    level: number;
    experience: number;
}
