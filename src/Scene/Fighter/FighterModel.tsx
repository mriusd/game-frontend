import * as THREE from 'three'
import React, { useEffect, useMemo, useRef } from "react"
import { useSceneContext } from "store/SceneContext"
import { InventorySlot } from "interfaces/inventory.interface"
import { getShaderedEquipment } from "./utils/getShaderedEquipment"
import { useFrame } from "@react-three/fiber"
import { Fighter } from "interfaces/fighter.interface"
import { getEquipmentBodyType } from "./utils/getEquipmentBodyType"
import LastMessage from './components/LastMessage'

interface Props { model: THREE.Group | THREE.Mesh, fighter: Fighter, position: number[], rotation?: number[], children?: any }
const FighterModel = React.memo(React.forwardRef(function FighterModel({ model, fighter, position, rotation, children }: Props, ref) {

    // Equipment we take on Fighter
    // const equipment = useEvents(state => state.equipment)
    const equipment = useMemo(() => fighter.equipment, [fighter])

    const modelRef = useRef()
    // Forward ref
    React.useImperativeHandle(ref, () => modelRef.current)

    // TODO: Fix this, dont use sceneContext
    const { setSceneObject } = useSceneContext()


    // Space in Fighter model where we insert all Equipment
    const fighterArmature = useRef<THREE.Group | null>(null)
    // Save skeleton & then apply to equipment
    const fighterSkeleton = useRef<THREE.Skeleton | null>(null)
    // Save main Bone & then insert equipment bones there
    const fighterBone = useRef<THREE.Bone | null>(null)
    // Save all currently equipmented items to remove then
    const equipedMeshes = useRef<Array<{ itemHash: string, objects: {name: string}[] }>>([])

    // Store last equipment state
    const lastEquipment = useRef<InventorySlot[]>([])
    // Depending on this states we take on or take of equipment
    const equipmentToTakeOF = useRef<InventorySlot[]>([])
    const equipmentToTakeON = useRef<InventorySlot[]>([])


    const uniforms = useRef({ uTime: { value: 0 } })


    // Mixer for Equipment Animation
    const mixer = useMemo(() => new THREE.AnimationMixer(model), [])
    const clips = useRef<Array<{ itemHash: string; object: THREE.Object3D | THREE.Mesh | THREE.Group; animation: THREE.AnimationClip }>>([])

    // Find Armature & Skeleton
    useEffect(() => {
        // @ts-expect-error
        fighterArmature.current = model.getObjectByName("Armature") // Used for show/hide boyd parts
        fighterSkeleton.current = (model.getObjectByName("standard_helmet") as THREE.SkinnedMesh)?.skeleton // Used for binding fighter skeleton to equipment skinnedMeshes
        fighterBone.current = model.getObjectByName("mixamorigHips") as THREE.Bone // Main bone in Fighter, Insert inside it equipment Armature
        // console.log('FighterModel ', model, fighterArmature.current, fighterSkeleton.current, fighterBone.current)
        if (!fighterArmature.current) { console.warn('[FighterModel]: "Armature" not found') }
        if (!fighterSkeleton.current) { console.warn('[FighterModel]: "standard_helmet" not found') }
        if (!fighterBone.current) { console.warn('[FighterModel]: "mixamorigHips" not found') }
    }, [model])

    // Main Logic
    useEffect(() => {
        if (!equipment) { return }

        // Initializing lastEquipment on first render
        if (!lastEquipment.current) {
            lastEquipment.current = Object.values(equipment)
        }

        // console.log('Armature', fighterArmature.current)
        // Finding items to be removed
        equipmentToTakeOF.current = lastEquipment.current.filter(
            (oldItem) => !Object.values(equipment).find(_ => _.itemHash === oldItem.itemHash)
        )
        // console.log('equipmentToTakeOF', equipmentToTakeOF.current)

        // Finding items to be added
        equipmentToTakeON.current = Object.values(equipment).filter(
            (newItem) => !lastEquipment.current.find(_ => _.itemHash === newItem.itemHash)
        )
        // console.log('equipmentToTakeON', equipmentToTakeON.current)

        if (!fighterArmature.current || !fighterSkeleton.current) { return }
        takeOfLastEquipment()
        takeOnNewEquipment()

        // Updating lastEquipment to be the current equipment
        lastEquipment.current = Object.values(equipment)
    }, [equipment])

    function takeOfLastEquipment() {
        equipmentToTakeOF.current.forEach(item => {
            const meshIndex = equipedMeshes.current.findIndex(eqMesh => eqMesh.itemHash === item.itemHash)
            // console.log('meshIndex', meshIndex, equipedMeshes.current, equipedMeshes.current[meshIndex])
            if (meshIndex === -1) { return }
            // Remove from mixers
            const clipIndex = clips.current.findIndex(_ => _.itemHash === item.itemHash)
            if (clipIndex !== -1) {
                mixer.clipAction(clips.current[clipIndex].animation, clips.current[clipIndex].object).stop()
                clips.current.splice(clipIndex, 1)
            }
            removeFromScene(equipedMeshes.current[meshIndex])
            showBodyPart(item)
            // Remove from stored array
            equipedMeshes.current.splice(meshIndex, 1)
        })
        function removeFromScene(model: { itemHash: string, objects: {name: string}[] }) {
            // console.log('removeFromScene', model)
            model.objects.forEach(_ => {
                const object = fighterBone.current.getObjectByName(_.name)
                // console.log('Object to remove', object)
                // // @ts-expect-error
                // if (object.isBone) {
                //     fighterBone.current.remove(object)
                // } else {
                //     fighterArmature.current.remove(object)
                // }
                fighterBone.current.remove(object)

            })
        }
        function showBodyPart(item: InventorySlot) {
            // Remove part of body
            const bodyPartName = getEquipmentBodyType(item)
            if (!bodyPartName) { return console.warn('[FighterModel<takeOf>]: Not body Type found, mb wrong server item name') }
            const bodyPart = fighterArmature.current.getObjectByName(`standard_` + bodyPartName)
            if (!bodyPart) { return console.warn('[FighterModel<takeOf>]: Not body Part found, mb Fighter body parts name has been changed') }
            bodyPart.visible = true
        }
    }
    function takeOnNewEquipment() {
        equipmentToTakeON.current.forEach(item => {
            const { model, animations } = getShaderedEquipment(item, uniforms)
            if (!model) { return console.warn('[FighterModel<takeOn>]: Equipment Model not Found') }

            const modelArmature = model.getObjectByName('Armature')
            // console.log('modelArmature', modelArmature)
            if (!modelArmature) { return console.warn('[FighterModel<takeOn>]: Model Armature not found, mb it is renamed') }
            
            // console.log('fighterArmature', fighterArmature)
            // Store Mixer to Animate equipment
            const animation = animations.find(_ => _.name === 'fly')
            if (animation) {
                mixer.clipAction(animation, model).setDuration(1).play()
                clips.current.push({ itemHash: item.itemHash, animation, object: model })
            }

            // Set itemHash to remove via it then
            modelArmature.userData.itemHash = item.itemHash
            modelArmature.userData.name = item.itemAttributes.name

            hideBodyPart(item)
            addToScene(modelArmature as THREE.Group)
        })
        function addToScene(model: THREE.Group | THREE.SkinnedMesh) {
            const equiped = { itemHash: model.userData.itemHash, objects: [] }
            // model.children.forEach((object,i) => {
            //     // @ts-expect-error
            //     if (object.isGroup) {
            //         // Clone children bc it fixes the issue with missed skinned mesh
            //         const children = [...object.children]
            //         // console.log('children', children)
            //         children.forEach((mesh: THREE.SkinnedMesh) => { 
            //             console.log(mesh.name)
            //             if (!mesh.isSkinnedMesh) { return console.error('[FighterModel<takeOn>]: Wrong Equipment Model, skinnedMesh expected, with name', model.name) }
            //             // Add hash to name to find skinnedMesh via it later
            //             mesh.name += model.userData.name + i
                        
            //             mesh.bind(fighterSkeleton.current, mesh.matrixWorld) // Bind Fighter Skeleton
                        
            //             fighterArmature.current.add(mesh) 
            //             equiped.objects.push({ name: mesh.name })
            //         })
            //     } 
            //     // @ts-expect-error
            //     else if (object.isSkinnedMesh) {
            //         (object as THREE.SkinnedMesh).bind(fighterSkeleton.current, object.matrixWorld) // Bind Fighter Skeleton
            //         object.name += model.userData.name + i

            //         fighterArmature.current.add(object)
            //         equiped.objects.push({ name: object.name })
            //         // @ts-expect-error
            //     } else if (object.isBone) {
            //         // console.log('Bone added')
            //         object.name += model.userData.name + i

            //         // fighterBone.current.add(object)
            //         // equiped.objects.push({ name: object.name })
            //     } else {
            //         console.warn('[FighterModel<takeOn>]: No SkinnedMesh Found')
            //     }
            // })
            model.traverse((object) => {
                // @ts-expect-error
                if (object.isSkinnedMesh) {
                    (object as THREE.SkinnedMesh).bind(fighterSkeleton.current, object.matrixWorld) // Bind Fighter Skeleton
                }
            })
            model.name += model.userData.name
            equiped.objects.push({ name: model.name })
            fighterBone.current.add( model )

            // Store 
            equipedMeshes.current.push(equiped)
            // console.log(equipedMeshes.current)
        }
        function hideBodyPart(item: InventorySlot) {
            // Remove part of body
            const bodyPartName = getEquipmentBodyType(item)
            if (!bodyPartName) { return console.warn('[FighterModel<takeOn>]: Not body Type found, mb wrong server item name') }
            const bodyPart = fighterArmature.current.getObjectByName(`standard_` + bodyPartName)
            if (!bodyPart) { return console.warn('[FighterModel<takeOn>]: Not body Part found, mb Fighter body parts name has been changed') }
            bodyPart.visible = false
        }
    }

    // Render Items Shaders
    useFrame(({ clock }, delta) => {
        uniforms.current.uTime.value = clock.getElapsedTime()
        mixer.update( delta )
    })


    // Save ref to object to store & rm on unmount
    useEffect(() => {
        if (modelRef.current) {
            setSceneObject(fighter.id, modelRef.current, 'add')
        }
        return () => {
            setSceneObject(fighter.id, modelRef.current, 'remove')
        }
    }, [modelRef.current, fighter])

    return (
        <group name="fighter-model">
            <group
                ref={modelRef}
                // @ts-expect-error
                position={position}
                // @ts-expect-error
                rotation={rotation}
            >
                <primitive 
                    object={model}
                    scale={.3}
                    castShadow 
                />
                { children }
            </group>
        </group>
    )
}))

export default FighterModel