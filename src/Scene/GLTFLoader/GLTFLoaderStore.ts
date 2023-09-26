import { RefObject, createRef } from "react";
import { create } from "zustand";

import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";


export interface GltfLoaderStoreInterface {
    models: RefObject<{ [key: string]: GLTF | undefined }>
}
export const useGLTFLoaderStore = create<GltfLoaderStoreInterface>((set, get) => ({
    models: createRef(),
}))