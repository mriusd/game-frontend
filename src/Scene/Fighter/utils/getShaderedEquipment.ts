import { InventorySlot } from "interfaces/inventory.interface"
import { getEquipmentModel } from "./getEquipmentModel"
import { shader_level } from "Scene/shaders/shader_level"
import { isExcellent } from "Scene/utils/isExcellent"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"
import { SkeletonUtils } from "three-stdlib"
import * as THREE from 'three'
import { useSettings } from "Scene/UserInterface2D/Settings/useSettings"


// TODO: Think about this
export const getShaderedEquipment = (item: InventorySlot, uniforms: any) => {
    const gltf: GLTF = getEquipmentModel(item.itemAttributes.name)
    if (!gltf) { return null }
    // TODO: Think about another way store models, im not sure that clonning is a good idea for cpu
    // @ts-expect-error
    const model: THREE.Group | THREE.SkinnedMesh = SkeletonUtils.clone(gltf.scene)
    const levelShader = shader_level()
    // console.log(model, item.itemAttributes.name)

    const enableDynamicShadows = useSettings.getState().enableShadows

    model.traverse((object: any) => {
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
    return { model, animations: gltf.animations }
}