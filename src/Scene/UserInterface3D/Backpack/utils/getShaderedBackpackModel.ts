import { BackpackSlot } from "interfaces/backpack.interface"
import { getBackpackModel } from "./getBackpackModel"
import { shader_level } from "Scene/shaders/shader_level"
import { isExcellent } from "Scene/utils/isExcellent"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"
import { SkeletonUtils } from "three-stdlib"
import * as THREE from 'three'
import { ItemAttributes } from "interfaces/item.interface"


// TODO: Think about this
export const getShaderedBackpackModel = (itemAttributes: ItemAttributes, uniforms: any) => {
    const gltf: GLTF = getBackpackModel(itemAttributes.name)
    if (!gltf) { return null }
    // TODO: Think about another way store models, im not sure that clonning is a good idea for cpu
    // @ts-expect-error
    const model: THREE.Group | THREE.SkinnedMesh = SkeletonUtils.clone(gltf.scene)
    const levelShader = shader_level()
    // console.log(model, item.itemAttributes.name)

    model.traverse((object: any) => {
        if (object.isMesh) {
            const material = object.material.clone()

            object.castShadow = true
            object.revieveShadow = true

            material.onBeforeCompile = (_shader: THREE.Shader) => {
                // Uniforms
                _shader.uniforms = { ..._shader.uniforms, ...levelShader.uniforms, ...uniforms.current  }
                _shader.uniforms['uLevel'] = { value: itemAttributes.itemLevel }
                _shader.uniforms['uIsExellent'] = { value: isExcellent(itemAttributes) }

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
                    ${levelShader.injectFragmentShader.header}
                `)
                _shader.fragmentShader = _shader.fragmentShader.replace('#include <dithering_fragment>', `
                    #include <dithering_fragment>
                    ${levelShader.injectFragmentShader.footer}
                `)
        
                // console.log(levelShader.injectFragmentShader.footer)
                // console.log(_shader.vertexShader)
                // shader.value = _shader
            }
            object.material = material
        }
    })
    return model
}