// @ts-nocheck

import React from 'react'

import { extend } from '@react-three/fiber'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'
import { UnrealBloomPass } from 'three-stdlib'

import { useThree, useFrame } from '@react-three/fiber'

extend({ EffectComposer, ShaderPass, RenderPass, FXAAShader, UnrealBloomPass })

const Postprocessing = () => {

    // const [lights, bloomObjects] = usePost(state => [state.lights, state.bloomObjects])
    // React.useEffect(() => {
    //     console.log('Update Post', lights, bloomObjects)
    // }, [lights, bloomObjects])
    const composer = React.useRef<any>()
    const { gl, size, camera, scene } = useThree()
    React.useEffect(() => void composer.current.setSize(size.width, size.height), [size])
    useFrame(({ gl }) => {
      gl.autoClear = true
      composer.current.render()
    }, 2)

    return (
        <effectComposer ref={composer} args={[gl]}>
            <renderPass attachArray="passes" scene={scene} camera={camera} />
            <shaderPass attachArray="passes" args={[FXAAShader]} material-uniforms-resolution-value={[1 / size.width, 1 / size.height]} />
            <unrealBloomPass attachArray="passes" args={[size.width/size.height, .5, 1.5, .1]} />
        </effectComposer>
    )
}

export default Postprocessing