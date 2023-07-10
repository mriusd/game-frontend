import { BackpackSlot } from "interfaces/backpack.interface"
import { getFighterItemModel } from "./getFighterItemModel"
import { shader_level } from "Scene/shaders/shader_level"

// TODO: Think about this
export const getFighterShaderedItem = (item: BackpackSlot) => {
    // const uise
    const model: THREE.Mesh = getFighterItemModel(item.itemAttributes.name)
    if (!model) { return null }
    model.traverse((object: any) => {
        if (object.isMesh) {
            const material = object.material.clone()
            material.onBeforeCompile = (_shader: THREE.Shader) => {
                // Uniforms
                _shader.uniforms = { ..._shader.uniforms, ...levelShader.current.uniforms }
                _shader.uniforms['uLevel'] = { value: devState.level }
                _shader.uniforms['uIsExellent'] = { value: devState.isExcellent }

                // Injection
                _shader.vertexShader = _shader.vertexShader.replace('#include <common>', `
                    #include <common>
                    ${levelShader.current.injectVertexShader.header}
                `)
                _shader.vertexShader = _shader.vertexShader.replace('#include <fog_vertex>', `
                    #include <fog_vertex>
                    ${levelShader.current.injectVertexShader.footer}
                `)
        
                _shader.fragmentShader = _shader.fragmentShader.replace('#include <common>', `
                    #include <common>
                    ${levelShader.current.injectFragmentShader.header}
                `)
                _shader.fragmentShader = _shader.fragmentShader.replace('#include <dithering_fragment>', `
                    #include <dithering_fragment>
                    ${levelShader.current.injectFragmentShader.footer}
                `)
        
                // console.log(levelShader.current.injectFragmentShader.footer)
                // console.log(_shader.vertexShader)
                shader.current = _shader
            }
            object.material = material
        }
    })
}