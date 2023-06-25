import * as THREE from 'three'
import { create } from "zustand";
import type { Coordinate } from 'interfaces/coordinate.interface';

export interface FighterStoreInterface {
    currentMatrixCoordinate: Coordinate | null
    setCurrentMatrixCoordinate: (coordinate: Coordinate | null) => void
}

export const useFighterStore = create<FighterStoreInterface>((set, get) => ({
    currentMatrixCoordinate: null,
    setCurrentMatrixCoordinate(coordinate) { set(() => ({currentMatrixCoordinate: coordinate})) }
}))