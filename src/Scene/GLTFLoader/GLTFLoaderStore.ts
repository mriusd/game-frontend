import { RefObject, createRef } from "react";
import { create } from "zustand";

import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";


export interface GltfLoaderStoreInterface {
    _inited: boolean
    models: RefObject<{ [key: string]: GLTF | undefined }>
    init: () => void
    addModel: (key: string, gltf: GLTF) => void
}
export const useGLTFLoaderStore = create<GltfLoaderStoreInterface>((set, get) => ({
    _inited: false,
    models: createRef(),
    init: () => {
        if (!get()._inited) {
             // @ts-expect-error
            get().models.current = {}
            set({ _inited: true })
        }
    },
    addModel: (key, gltf) => set(state => ({ models: { ...state.models, [key]: gltf } }))
}))