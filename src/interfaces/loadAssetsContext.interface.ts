import { RefObject } from "react"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"

export interface ILoadAssetsContext {
    gltf: RefObject<{[key: string]: GLTF}>
}