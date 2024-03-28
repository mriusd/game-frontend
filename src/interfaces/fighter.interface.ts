import { Group, Mesh } from "three";
import type { Coordinate } from "./coordinate.interface"; 
import type { Damage } from "./damage.interface";
import type { Direction } from "./direction.interface";
import type { Skill } from "./skill.interface";
import type { InventorySlot } from "./inventory.interface";
import { Equipment } from "./equipment.interface";

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

    damage: number;
    defence: number;

    level: number;
    level_progress: number;
    experience: number;

    direction: Direction;

    skills: Record<number, Skill>;
    equipment: Equipment;

    lastChatMessage: string;
}