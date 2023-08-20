import { InventorySlot } from "interfaces/inventory.interface"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"
import { SkeletonUtils } from "three-stdlib"
import * as THREE from 'three'
import { getDecorModel } from "./getDecorModel"


// TODO: Think about this
export const getShaderedDecor = (name: string, uniforms?: any) => {
    const gltf: GLTF = getDecorModel(name)
    if (!gltf) { return null }
    // TODO: Think about another way store models, im not sure that clonning is a good idea for cpu
    // @ts-expect-error
    const model: THREE.Group | THREE.SkinnedMesh = SkeletonUtils.clone(gltf.scene)

    model.traverse((object: any) => {
        if (object.isMesh) {
            object.castShadow = true
            object.revieveShadow = true

            const material = object.material.clone()

            material.transparent = true
            // console.log('MMMaterial', material)
            material.onBeforeCompile = (_shader: THREE.Shader) => {
                // // Injection
                // _shader.vertexShader = _shader.vertexShader.replace('#include <common>', `
                //     #include <common>
                //     ${levelShader.injectVertexShader.header}
                // `)
                // _shader.vertexShader = _shader.vertexShader.replace('#include <fog_vertex>', `
                //     // #include <fog_vertex>
                //     // vec3 scale = vec3(
                //     //     length(modelViewMatrix[0].xyz),
                //     //     length(modelViewMatrix[1].xyz),
                //     //     length(modelViewMatrix[2].xyz)
                //     // );
                //     // // size attenuation: scale *= -mvPosition.z * 0.2;
                //     // mvPosition.xyz += position * scale;
                //     // gl_Position = projectionMatrix * mvPosition;
                //     gl_Position = projectionMatrix * (modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0) + vec4(position.x, position.y, 0.0, 0.0));
                // `)
                // _shader.fragmentShader = _shader.fragmentShader.replace('#include <dithering_fragment>', `
                //     #include <dithering_fragment>
                //     gl_FragColor.a = .5;
                // `)

                // console.log(levelShader.injectFragmentShader.footer)
                console.log(_shader.vertexShader)
                // shader.value = _shader
            }
            object.material = material
        }
    })
    return { model, gltf }
}