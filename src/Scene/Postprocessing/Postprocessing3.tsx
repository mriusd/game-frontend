import React from 'react'

import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'

import { useThree, useFrame } from '@react-three/fiber'

interface Props {
    renderPriority?: number
}
const Postprocessing = ({ renderPriority = 2 }: Props) => {

    const { gl, scene, camera, size, get } = useThree()

    const [bloom, final] = React.useMemo(() => {
      const renderScene = new RenderPass(scene, camera)
      const comp = new EffectComposer(gl)
      comp.renderToScreen = false
      comp.addPass(renderScene)
      comp.addPass(new UnrealBloomPass(new THREE.Vector2(1024, 1024), 1, 1.75, 0))
  
      const finalComposer = new EffectComposer(gl)
      finalComposer.addPass(renderScene)
      const finalPass = new ShaderPass(
        new THREE.ShaderMaterial({
          uniforms: { baseTexture: { value: null }, bloomTexture: { value: comp.renderTarget2.texture } },
          vertexShader:
            'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }',
          fragmentShader:
            `
              uniform sampler2D baseTexture; 
              uniform sampler2D bloomTexture; 
              varying vec2 vUv; 
              
              vec4 getTexture( sampler2D texelToLinearTexture ) { return (texture2D( texelToLinearTexture , vUv ) ); } 
              void main() { 
                  vec4 baseColor = getTexture( baseTexture );
                  vec4 bloomColor = getTexture( bloomTexture );
                  // float lum = 0.21 * bloomColor.r + 0.71 * bloomColor.g + 0.07 * bloomColor.b;
                  float lum = 0.11 * bloomColor.r + 0.51 * bloomColor.g + 0.37 * bloomColor.b;

                  gl_FragColor = vec4(baseColor.rgb + bloomColor.rgb, max(baseColor.a, lum));
              }
          `,
          transparent: true
        }),
        'baseTexture'
      )
      finalPass.needsSwap = true
      finalComposer.addPass(finalPass)
      const fxaa = new ShaderPass(FXAAShader)
      fxaa.material.uniforms['resolution'].value.x = 1 / size.width
      fxaa.material.uniforms['resolution'].value.y = 1 / size.height
      // finalComposer.addPass(fxaa)
      return [comp, finalComposer]
    }, [gl, scene, camera, size])


    let oldCLear
    useFrame(() => {
      oldCLear = gl.autoClear

      gl.autoClear = false
      gl.clearDepth()

      // console.log('Performance: ', get().performance)
      if (get().performance.current < .5 || window.innerWidth < 576) {
        // console.warn('Low Performance Detected', performance)
        gl.render(scene, camera)
      } else {
        bloom.render()
        final.render()
      }
      
      gl.autoClear = oldCLear
    }, renderPriority)

    return null
}

export default Postprocessing