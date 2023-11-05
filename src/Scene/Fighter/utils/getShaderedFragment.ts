import { InventorySlot } from "interfaces/inventory.interface"
import { getFragmentModel } from "./getFragmentModel"
import { shader_level } from "Scene/shaders/shader_level"
import { isExcellent } from "Scene/utils/isExcellent"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"
import { SkeletonUtils } from "three-stdlib"
import * as THREE from 'three'
import { useSettings } from "Scene/UserInterface2D/Settings/useSettings"


// TODO: Think about this
export const getShaderedFragments = (item: InventorySlot, fragmentNames: string[], uniforms: any) => {
    const gltfs: GLTF[] = fragmentNames.map(name => getFragmentModel(name))
    if (!gltfs.length) { return null }
    // TODO: Think about another way store models, im not sure that clonning is a good idea for cpu
    // @ts-expect-error
    const models: Array<{ model: (THREE.Group | THREE.SkinnedMesh), animations: THREE.AnimationClip[] }> = gltfs.map(gltf => ({model: SkeletonUtils.clone(gltf.scene), animations: gltf.animations}))
    const levelShader = shader_level()
    // console.log(model, item.itemAttributes.name)

    const enableDynamicShadows = useSettings.getState().enableShadows

    models.forEach(_ => {
        _.model.traverse((object: any) => {
            if (object.isMesh) {
                const material = object.material.clone()
    
                object.castShadow = enableDynamicShadows
                object.revieveShadow = enableDynamicShadows
    
                material.onBeforeCompile = (_shader: THREE.Shader) => {
                    // Uniforms
                    _shader.uniforms = { ..._shader.uniforms, ...levelShader.uniforms, ...uniforms.current  }
                    _shader.uniforms['uLevel'] = { value: item.itemAttributes.itemLevel }
                    _shader.uniforms['uIsExellent'] = { value: isExcellent(item.itemAttributes) }
    
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
    })


    return models
}