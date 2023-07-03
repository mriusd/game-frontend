import { createContext, useContext, useRef } from "react"
import { useGLTF } from "@react-three/drei"
import type { ILoadAssetsContext } from "interfaces/loadAssetsContext.interface"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"

const LoadAssetsContext = createContext({})

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

