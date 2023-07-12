import * as THREE from 'three'
// @ts-expect-error 
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js'
import { useMemo, memo, useEffect, useRef } from "react"
import { forwardRef } from 'react'
import type { BackpackSlot } from 'interfaces/backpack.interface'
import { useLoadAssets } from 'store/LoadAssetsContext'
import { getItemModelName } from 'Scene/utils/getItemModelName'
import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import { isExcellent } from 'Scene/utils/isExcellent'

import { shader_level } from 'Scene/shaders/shader_level'
import { generateItemName } from 'helpers/generateItemName'

interface Props { position?: number[], rotation?: number[], scale?: number[], onPointerEnter?: (e?: any) => void, onPointerLeave?: (e?: any) => void, item: BackpackSlot }
const SlotModel = memo(forwardRef(function SlotModel({ item, ...props }: Props, ref: any) {
    // FIXME: Rerenders lots of time, cuz app.tsx (eventCloud) has rerendering hole
    const { gltf } = useLoadAssets()
    const { map } = useTexture({ map: 'assets/notexture.png' })

    const shader = useRef<THREE.Shader | null>(null)
    const levelShader = useRef(shader_level())

    // Find needed 3D Model
    const model = useMemo<THREE.Mesh>(() => {
        const name = getItemModelName(item.itemAttributes.name)
        if (name === 'none') {
            return new THREE.Mesh(
                new THREE.BoxGeometry(+item.itemAttributes.itemWidth / 4, +item.itemAttributes.itemHeight / 4, +item.itemAttributes.itemWidth / 4),
                new THREE.MeshStandardMaterial({ color: 'pink', map })
            )
        }

        return SkeletonUtils.clone(gltf.current[name].scene)
    }, [item, map])

    // For Dev
    const devState = useControls(generateItemName(item.itemAttributes, item.qty), {
        level: { min: 0, max: 15,  value: +item.itemAttributes.itemLevel },
        isExcellent: isExcellent(item)
    })
    // 

    // Add shaders to the Model based on things level
    const shaderModel = useMemo<THREE.Mesh>(() => {
        if (!model) { return }
        model.traverse((object: any) => {
            if (object.isMesh) {
                const material = object.material.clone()
                // object.material.transparent = true
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
        return model
    }, [model, devState])


    useFrame(({ clock }) => {
        if (shaderModel) {
            if (shader.current?.uniforms.uTime) {
                shader.current.uniforms.uTime.value = clock.getElapsedTime()
            }
        }
    })


    return (
        <primitive
            onPointerEnter={props.onPointerEnter}
            onPointerLeave={props.onPointerLeave}
            ref={ref}
            name="slot-model"
            object={shaderModel}
            {...props}
        >
        </primitive>
    )
}))

export default SlotModel