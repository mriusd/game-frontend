/**
 * @fileoverview Customise React-Three-Drei "useGLTF" for our needs
 * @version v9.80.0
 */
import { Loader } from 'three'
// @ts-ignore
import { GLTFLoader, DRACOLoader, MeshoptDecoder, GLTF } from 'three-stdlib'
// import { useLoader } from '@react-three/fiber'
import { useLoader } from './useLoader'

import type { inputType } from './useLoader'

let dracoLoader: DRACOLoader | null = null

function extensions(useDraco: boolean | string, useMeshopt: boolean, extendLoader?: (loader: GLTFLoader) => void) {
  return (loader: Loader) => {
    if (extendLoader) {
      extendLoader(loader as GLTFLoader)
    }
    if (useDraco) {
      if (!dracoLoader) {
        dracoLoader = new DRACOLoader()
      }
      dracoLoader.setDecoderPath(
        typeof useDraco === 'string' ? useDraco : 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/'
      )
      ;(loader as GLTFLoader).setDRACOLoader(dracoLoader)
    }
    if (useMeshopt) {
      ;(loader as GLTFLoader).setMeshoptDecoder(
        typeof MeshoptDecoder === 'function' ? MeshoptDecoder() : MeshoptDecoder
      )
    }
  }
}

export function useGLTF<T extends inputType | inputType[]>(
  path: T,
  useDraco: boolean | string = true,
  useMeshOpt: boolean = true,
  extendLoader?: (loader: GLTFLoader) => void
) {
  // @ts-expect-error
  const gltf = useLoader<GLTF, T>(GLTFLoader, path, extensions(useDraco, useMeshOpt, extendLoader))
  // @ts-expect-error
  return gltf.reduce((a, v) => ({ ...a, [v.name]: v }), {})
}

useGLTF.preload = (
  path: inputType | inputType[],
  useDraco: boolean | string = true,
  useMeshOpt: boolean = true,
  extendLoader?: (loader: GLTFLoader) => void
) => useLoader.preload(GLTFLoader, path, extensions(useDraco, useMeshOpt, extendLoader))

useGLTF.clear = (input: inputType | inputType[]) => useLoader.clear(GLTFLoader, input)