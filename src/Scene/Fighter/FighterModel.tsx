import React, { useEffect, useRef } from "react"
import Name from "Scene/components/Name"
import { useSceneContext } from "store/SceneContext"
import { useEventStore } from "store/EventStore"
import { shader_level } from "Scene/shaders/shader_level"

interface Props { model: any }
const FighterModel = React.forwardRef(({ model }: Props, ref) => {
    const equipment = useEventStore(state => state.equipment)
    const modelRef = useRef()
    React.useImperativeHandle(ref, () => modelRef.current)

    const { currentWorldCoordinate, controller: { direction } } = useSceneContext()

    const shader = useRef<THREE.Shader | null>(null)
    const levelShader = useRef(shader_level())

    useEffect(() => {
        console.log('FighterModel ', equipment)
    }, [equipment])

    // Add shaders to the Model based on things level
    // const shaderModel = React.useMemo<THREE.Mesh>(() => {
    //     if (!model) { return }
    //     model.traverse((object: any) => {
    //         if (object.isMesh) {
    //             const material = object.material.clone()
    //             // object.material.transparent = true
    //             material.onBeforeCompile = (_shader: THREE.Shader) => {
    //                 // Uniforms
    //                 _shader.uniforms = { ..._shader.uniforms, ...levelShader.current.uniforms }
    //                 _shader.uniforms['uLevel'] = { value: devState.level }
    //                 _shader.uniforms['uIsExellent'] = { value: devState.isExcellent }

    //                 // Injection
    //                 _shader.vertexShader = _shader.vertexShader.replace('#include <common>', `
    //                     #include <common>
    //                     ${levelShader.current.injectVertexShader.header}
    //                 `)
    //                 _shader.vertexShader = _shader.vertexShader.replace('#include <fog_vertex>', `
    //                     #include <fog_vertex>
    //                     ${levelShader.current.injectVertexShader.footer}
    //                 `)
            
    //                 _shader.fragmentShader = _shader.fragmentShader.replace('#include <common>', `
    //                     #include <common>
    //                     ${levelShader.current.injectFragmentShader.header}
    //                 `)
    //                 _shader.fragmentShader = _shader.fragmentShader.replace('#include <dithering_fragment>', `
    //                     #include <dithering_fragment>
    //                     ${levelShader.current.injectFragmentShader.footer}
    //                 `)
            
    //                 // console.log(levelShader.current.injectFragmentShader.footer)
    //                 // console.log(_shader.vertexShader)
    //                 shader.current = _shader
    //             }
    //             object.material = material
    //         }
    //     })
    //     return model
    // }, [model, devState])
    
    return (
        <group name="fighter-model">
            <Name value="Berlin" target={modelRef} offset={.4} />
            <primitive 
                ref={modelRef}
                object={model}
                position={[currentWorldCoordinate.x, 0, currentWorldCoordinate.z]}
                scale={.3}
                rotation={[0, direction, 0]}
                castShadow 
            />
        </group>
    )
})

export default FighterModel