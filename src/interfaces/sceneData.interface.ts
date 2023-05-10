import { Group, Mesh } from "three"

export interface SceneData {
    [key: string]: ObjectData
}

export interface ObjectData {
    id: string
    ref: Mesh | Group
    dimensions: {
        width: number
        height: number
        depth: number
    }
}