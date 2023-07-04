import { createContext, useContext, useRef } from "react"
import { useGLTF } from "@react-three/drei"
import type { ILoadAssetsContext } from "interfaces/loadAssetsContext.interface"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"

const LoadAssetsContext = createContext({})

// tbm = Test Backpack Models :)
export const tbm = {
    ice_sword: 'ice_sword',
    magic_box: 'magic_box',

    // dragon
    dragon_boots: 'dragon_boots',
    dragon_chest: 'dragon_chest',
    dragon_gloves: 'dragon_gloves',
    dragon_helmet: 'dragon_helmet',
    dragon_sholders: 'dragon_sholders',
    dragon_trousers: 'dragon_trousers',
    // next one
}

export const useLoadAssets = (): ILoadAssetsContext => {
    const context = useContext(LoadAssetsContext)
    if (!context) {
        throw new Error(`useLoadingContext must be used within a LoadingContextProvider`)
    }
    return context as ILoadAssetsContext
}

const LoadAssetsContextProvider = ({ children }) => {
    const gltf = useRef<{[key: string]: GLTF}>({})

    // @ts-expect-error
    gltf.current.fighter = useGLTF('models/pixel_character/character.gltf')
    // @ts-expect-error
    gltf.current.npc = useGLTF('models/npc_test/scene.gltf')
    // @ts-expect-error
    gltf.current.tree = useGLTF('models/decor/tree/scene.gltf')
    // @ts-expect-error
    gltf.current.sword = useGLTF('models/max_sword/file.gltf')
    // @ts-expect-error
    gltf.current.head = useGLTF('models/head/head.gltf')

    // @ts-expect-error
    gltf.current[tbm.ice_sword] = useGLTF('models/max_sword/file.gltf')
    // @ts-expect-error
    gltf.current[tbm.magic_box] = useGLTF(`models/${tbm[tbm.magic_box]}/${tbm[tbm.magic_box]}.gltf`)
    // @ts-expect-error
    gltf.current[tbm.dragon_boots] = useGLTF(`models/${tbm[tbm.dragon_boots]}/${tbm[tbm.dragon_boots]}.gltf`)
    // @ts-expect-error
    gltf.current[tbm.dragon_chest] = useGLTF(`models/${tbm[tbm.dragon_chest]}/${tbm[tbm.dragon_chest]}.gltf`)
    // @ts-expect-error
    gltf.current[tbm.dragon_gloves] = useGLTF(`models/${tbm[tbm.dragon_gloves]}/${tbm[tbm.dragon_gloves]}.gltf`)
    // @ts-expect-error
    gltf.current[tbm.dragon_helmet] = useGLTF(`models/${tbm[tbm.dragon_helmet]}/${tbm[tbm.dragon_helmet]}.gltf`)
    // @ts-expect-error
    gltf.current[tbm.dragon_sholders] = useGLTF(`models/${tbm[tbm.dragon_sholders]}/${tbm[tbm.dragon_sholders]}.gltf`)
    // @ts-expect-error
    gltf.current[tbm.dragon_trousers] = useGLTF(`models/${tbm[tbm.dragon_trousers]}/${tbm[tbm.dragon_trousers]}.gltf`)

    const value: ILoadAssetsContext = {
        gltf
    }

    return (
        <LoadAssetsContext.Provider value={value}>
            { children }
        </LoadAssetsContext.Provider>
    )
}

export default LoadAssetsContextProvider

useGLTF.preload('models/character/character.gltf')
useGLTF.preload('models/npc_test/scene.gltf')
useGLTF.preload('models/decor/tree/tree.gltf')
useGLTF.preload('models/max_sword/file.gltf')
useGLTF.preload('models/head/head.gltf')

