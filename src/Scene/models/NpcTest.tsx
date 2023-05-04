/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.1.4 scene.gltf --transform
Author: DanielWichterich (https://sketchfab.com/DanielWichterich)
License: CC-BY-NC-ND-4.0 (http://creativecommons.org/licenses/by-nc-nd/4.0/)
Source: https://sketchfab.com/3d-models/toon-characters-3d-style-lowpolyflat-seal-dcb997351230416382fc1e84624f127d
Title: Toon Characters 3d / Style LowPolyFlat / Seal
*/

import React, { useEffect, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

export function NpcTest(props) {
  const group = useRef()
  // @ts-expect-error
  const { nodes, materials, animations } = useGLTF('models/npc_test.glb')
  const { actions, mixer } = useAnimations(animations, group)
  useEffect(() => {
    actions['jump']?.play()
  }, [mixer])
  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Sketchfab_Scene">
        <group name="Sketchfab_model" position={[-0.05, -65.29, -16.65]} rotation={[-Math.PI / 2, 0, 0]}>
          <group name="f083b38492e24f058faf3a9ae78ea6a0fbx" rotation={[Math.PI / 2, 0, 0]}>
            <group name="Object_2">
              <group name="RootNode">
                <group name="Object_4">
                  <group name="Point001" position={[0, 31.43, 74.11]} rotation={[-Math.PI / 2, 0, 0]} />
                  <group name="Point003" position={[0, 37.67, -30.22]} rotation={[-Math.PI / 2, 0, 0]} />
                  <group name="Point005" position={[0, 7.97, -129.21]} rotation={[-Math.PI / 2, 0, 0]} />
                  <group name="Point004" position={[0, 20.29, -79.71]} rotation={[-Math.PI / 2, 0, 0]} />
                  <group name="Point002" position={[0, 38.6, 22.1]} rotation={[-Math.PI / 2, 0, 0]} />
                  <primitive object={nodes._rootJoint} />
                  <skinnedMesh name="Object_7" geometry={nodes.Object_7.geometry} material={materials['01_-_Default']} skeleton={nodes.Object_7.skeleton} />
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('models/npc_test.glb')