import { InventorySlot } from "interfaces/inventory.interface"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"
import { SkeletonUtils } from "three-stdlib"
import * as THREE from 'three'
import { getDecorModel } from "./getDecorModel"
import { shader_hidden } from "Scene/shaders/shader_hidden"


// TODO: Think about this
export const getShaderedDecor = (name: string, uniforms?: any) => {
    const gltf: GLTF = getDecorModel(name)
    if (!gltf) { return null }
    // TODO: Think about another way store models, im not sure that clonning is a good idea for cpu
    // @ts-expect-error
    const model: THREE.Group | THREE.SkinnedMesh = SkeletonUtils.clone(gltf.scene)
    const levelShader = shader_hidden()
    // console.log(model, item.itemAttributes.name)

    model.traverse((object: any) => {
        if (object.isMesh) {
            const material = object.material.clone()

            object.castShadow = true
            object.revieveShadow = true
            material.transparent = true

            // Shader For Invisible Objects
            material.onBeforeCompile = (_shader: THREE.Shader) => {
                // Uniforms
                _shader.uniforms = { ..._shader.uniforms, ...levelShader.uniforms, ...uniforms.current  }
                _shader.uniforms['uHiddenAlpha'] = { value: .3 }

                // Injection
                _shader.vertexShader = _shader.vertexShader.replace('#include <common>', `
                    #include <common>
                    ${levelShader.injectVertexShader.header}
                `)
                _shader.vertexShader = _shader.vertexShader.replace('#include <fog_vertex>', `
                    #include <fog_vertex>
                    ${levelShader.injectVertexShader.footer}
                `)
        
                _shader.fragmentShader = _shader.fragmentShader.replace('#include <common>', `
                    #include <common>
                    uniform float visible;
                    ${levelShader.injectFragmentShader.header}
                `)
                _shader.fragmentShader = _shader.fragmentShader.replace('#include <dithering_fragment>', `
                    #include <dithering_fragment>
                    ${levelShader.injectFragmentShader.footer}
                `)
            }
            object.material = material
        }
    })
    return { model, gltf }
}