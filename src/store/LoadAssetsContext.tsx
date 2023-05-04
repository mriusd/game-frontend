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
    gltf.current.fighter = useGLTF('models/fighter_test/scene.gltf')
    // @ts-expect-error
    gltf.current.npc = useGLTF('models/npc_test/scene.gltf')

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