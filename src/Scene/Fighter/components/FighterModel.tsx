import * as THREE from 'three'
import React, { useEffect, useMemo, useRef } from "react"
import { InventorySlot } from "interfaces/inventory.interface"
import { getShaderedEquipment } from "../utils/getShaderedEquipment"
import { useFrame } from "@react-three/fiber"
import { Fighter } from "interfaces/fighter.interface"
import { getEquipmentBodyType } from "../utils/getEquipmentBodyType"
import { useCore } from 'Scene/useCore'

interface Props { model: THREE.Group | THREE.Mesh, fighter: Fighter, children?: any, onPointerMove?: (e: any) => void, onPointerLeave?: (e: any) => void, onPointerDown?: (e: any) => void }
const FighterModel = React.memo(React.forwardRef(function FighterModel({ model, fighter, children, onPointerMove, onPointerLeave, onPointerDown }: Props, ref) {

    // Equipment we take on Fighter
    const equipment = useMemo(() => fighter.equipment, [fighter])

    const modelRef = useRef()
    // Forward ref
    React.useImperativeHandle(ref, () => modelRef.current)

    // Store Ref Object
    const setSceneObject = useCore(state => state.setSceneObject)

    // Space in Fighter model where we insert all Equipment
    const fighterArmature = useRef<THREE.Group | null>(null)
    // Save skeleton & then apply to equipment
    const fighterSkeleton = useRef<THREE.Skeleton | null>(null)
    // Save main Bone & then insert equipment bones there
    const fighterBone = useRef<THREE.Bone | null>(null)
    // Save all currently equipmented items to remove then
    const equipedMeshes = useRef<Array<{ itemHash: string, objects: (THREE.Mesh | THREE.Group)[] }>>([])

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
        function removeFromScene(model: { itemHash: string, objects: (THREE.Mesh | THREE.Group)[] }) {
            // console.log('removeFromScene', model)
            model.objects.forEach(_ => {
                const object = fighterBone.current.getObjectByName(_.name)
                console.log(_.name)
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
            // console.log(animations)
            const animation = animations.find(_ => _.name === "Armature|mixamo.com|Layer0.001" || _.name === 'fly')
            if (animation) {
                // console.log(animation)
                mixer.clipAction(animation, model).setDuration(.5).play()
                clips.current.push({ itemHash: item.itemHash, animation, object: model })
            }

            // Set itemHash to remove via it then
            modelArmature.userData.itemHash = item.itemHash
            modelArmature.userData.name = item.itemAttributes.name
            modelArmature.name += item.itemAttributes.name

            hideBodyPart(item)
            addToScene(modelArmature as THREE.Group)
        })
        function addToScene(modelArmature: THREE.Group | THREE.SkinnedMesh) {
            const isBones = !!modelArmature.getObjectByName('main')

            if (!isBones) {
                modelArmature.traverse((object) => {
                    // @ts-expect-error
                    if (object.isSkinnedMesh) {
                        (object as THREE.SkinnedMesh).bind(fighterSkeleton.current, object.matrixWorld) // Bind Fighter Skeleton
                    }
                })
            }
            fighterBone.current.add( modelArmature )
            modelArmature.position.set(0, -300, 10)

            // Store
            equipedMeshes.current.push({ itemHash: modelArmature.userData.itemHash, objects: [modelArmature] })
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
        <group 
            name="fighter-model"
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
            onPointerDown={onPointerDown}
        >
            <primitive 
                ref={modelRef}
                object={model}
                scale={.2}
            >
                { children }
            </primitive>
        </group>
    )
}))

export default FighterModel