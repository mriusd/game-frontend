/**
 * @fileoverview Customise React-Three-Fiber "useLoader" for our needs
 * @version v8.13.6
 */
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { suspend, preload, clear } from 'suspend-react'
import { buildGraph, ObjectMap, is } from './utils'
import type { LoaderProto, Extensions, BranchingReturn, LoaderReturnType } from '@react-three/fiber'

export interface inputType { name: string; url: string }

function loadingFn<L extends LoaderProto<any>>(
    extensions?: Extensions<L>,
    onProgress?: (event: ProgressEvent<EventTarget>) => void,
  ) {
    return function (Proto: L, ...input: inputType[]) {
      // Construct new loader and run extensions
      const loader = new Proto()
      if (extensions) extensions(loader)
      // Go through the urls and load them
      return Promise.all(
        input.map(
          (input) =>
                new Promise((res, reject) =>
                    loader.load(
                        input.url,
                        (data: any) => {
                            if (data.scene) Object.assign(data, buildGraph(data.scene))
                            data.name = input.name
                            res(data)
                        },
                        onProgress,
                        (error) => reject(new Error(`Could not load ${input}: ${error.message}`)),
                    ),
                ),
        ),
      )
    }
  }
  
  /**
   * Synchronously loads and caches assets with a three loader.
   *
   * Note: this hook's caller must be wrapped with `React.Suspense`
   * @see https://docs.pmnd.rs/react-three-fiber/api/hooks#useloader
   */
  export function useLoader<T, U extends inputType | inputType[], L extends LoaderProto<T>, R = LoaderReturnType<T, L>>(
    Proto: L,
    input: U,
    extensions?: Extensions<L>,
    onProgress?: (event: ProgressEvent<EventTarget>) => void,
  ): U extends any[] ? BranchingReturn<R, GLTF, GLTF & ObjectMap>[] : BranchingReturn<R, GLTF, GLTF & ObjectMap> {
    // Use suspense to load async assets
    const keys = (Array.isArray(input) ? input : [input]) as inputType[]
    const results = suspend(loadingFn<L>(extensions, onProgress), [Proto, ...keys], { equal: is.equ })
    // Return the object/s
    return (Array.isArray(input) ? results : results[0]) as U extends any[]
      ? BranchingReturn<R, GLTF, GLTF & ObjectMap>[]
      : BranchingReturn<R, GLTF, GLTF & ObjectMap>
  }
  
  /**
   * Preloads an asset into cache as a side-effect.
   */
  useLoader.preload = function <T, U extends inputType | inputType[], L extends LoaderProto<T>>(
    Proto: L,
    input: U,
    extensions?: Extensions<L>,
  ) {
    const keys = (Array.isArray(input) ? input : [input]) as inputType[]
    return preload(loadingFn<L>(extensions), [Proto, ...keys])
  }
  
  /**
   * Removes a loaded asset from cache.
   */
  useLoader.clear = function <T, U extends inputType | inputType[], L extends LoaderProto<T>>(Proto: L, input: U) {
    const keys = (Array.isArray(input) ? input : [input]) as inputType[]
    return clear([Proto, ...keys])
  }