import * as THREE from 'three'
import React from "react"
import { InventorySlot } from "interfaces/inventory.interface"
import { getShaderedEquipment } from "../../utils/getShaderedEquipment"
import { getShaderedFragments } from 'Scene/Fighter/utils/getShaderedFragment'
import { useFrame } from "@react-three/fiber"
import { Fighter } from "interfaces/fighter.interface"
import { getEquipmentBodyType } from "../../utils/getEquipmentBodyType"
import { useCore } from 'Scene/useCore'
import { useEquimentPoses, applyBinder, removeBinder } from './useEquipmentPoses'

interface Props { model: THREE.Group | THREE.Mesh, fighter: Fighter, children?: any, onPointerMove?: (e: any) => void, onPointerLeave?: (e: any) => void, onPointerDown?: (e: any) => void, isMove: boolean }
const FighterModel = React.memo(React.forwardRef(function FighterModel({ model: fighterModel, fighter, children, onPointerMove, onPointerLeave, onPointerDown, isMove }: Props, ref) {

    // Equipment we take on Fighter
    const equipment = React.useMemo(() => fighter.equipment, [fighter])

    const modelRef = React.useRef()
    // Forward ref
    React.useImperativeHandle(ref, () => modelRef.current)

    // Store Ref Object
    const setSceneObject = useCore(state => state.setSceneObject)

    // Space in Fighter model where we insert all Equipment
    const fighterArmature = React.useRef<THREE.Group | null>(null)
    // Save skeleton & then apply to equipment
    const fighterSkeleton = React.useRef<THREE.Skeleton | null>(null)
    // Save main Bone & then insert equipment bones there
    const fighterBone = React.useRef<THREE.Bone | null>(null)
    // Save all currently equipmented items to remove then
    const equipedMeshes = React.useRef<{ [itemHash: string]:(THREE.Mesh | THREE.Group)[] }>({})
    const equipedFragments = React.useRef<{ [itemHash: string]:(THREE.Mesh | THREE.Group)[] }>({})

    // Store last equipment state
    const lastEquipment = React.useRef<InventorySlot[]>([])
    // Depending on this states we take on or take of equipment
    const equipmentToTakeOF = React.useRef<InventorySlot[]>([])
    const equipmentToTakeON = React.useRef<InventorySlot[]>([])

    const uniforms = React.useRef({ uTime: { value: 0 } })

    // Mixer for Equipment Animation
    const mixer = React.useMemo(() => new THREE.AnimationMixer(fighterModel), [])
    // TODO: Add advanced animation logic, remove animations after remove equipment]
    // const clips = React.useRef<Array<{ itemHash: string; object: THREE.Object3D | THREE.Mesh | THREE.Group; animation: THREE.AnimationClip }>>([])

    // Store Poses for models which we equip without weights
    // Example: Sword has two states holding in hand while fight and located along the back while in peace mode
    const { addPose, updatePose, removePose, updatePoses } = useEquimentPoses(fighter, fighterModel)
    

    // Find Armature & Skeleton
    React.useEffect(() => {
        // @ts-expect-error
        fighterArmature.current = fighterModel.getObjectByName("Armature") // Used for show/hide boyd parts
        fighterSkeleton.current = (fighterModel.getObjectByName("standard_helmet") as THREE.SkinnedMesh)?.skeleton // Used for binding fighter skeleton to equipment skinnedMeshes
        fighterBone.current = fighterModel.getObjectByName("mixamorigHips") as THREE.Bone // Main bone in Fighter, Insert inside it equipment Armature
        // console.log('FighterModel ', model, fighterArmature.current, fighterSkeleton.current, fighterBone.current)
        if (!fighterArmature.current) { console.warn('[FighterModel]: "Armature" not found') }
        if (!fighterSkeleton.current) { console.warn('[FighterModel]: "standard_helmet" not found') }
        if (!fighterBone.current) { console.warn('[FighterModel]: "mixamorigHips" not found') }
    }, [fighterModel])

    // Main Logic
    React.useEffect(() => {
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

        function takeOfLastEquipment() {
            equipmentToTakeOF.current.forEach(item => {
                const meshs = equipedMeshes.current[item.itemHash]
                const fragments = equipedFragments.current[item.itemHash]
                if (!meshs) { return }
                // TODO: Remove from mixers

                removeFromScene(meshs)
                removeFragments(fragments)
                showBodyPart(item)
                // Remove from stored array
                delete equipedMeshes.current[item.itemHash]
                delete equipedFragments.current[item.itemHash]
            })
            function removeFromScene(meshs: (THREE.Mesh | THREE.Group)[]) {
                // console.log('removeFromScene', model)
                meshs.forEach(_ => {
                    const object = fighterBone.current.getObjectByName(_.name)
                    // console.log('Object to remove', object)

                    if (_.userData.injectionType === 'binders') {
                        removePose(_.userData.itemHash)
                    } else {
                        fighterBone.current.remove(object)
                    }

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
            function removeFragments(fragments: (THREE.Mesh | THREE.Group)[]) {
                if (!fragments) { return }
                fragments.forEach(_ => removeBinder(fighterModel, _))
            }
        }
        function takeOnNewEquipment() {
            equipmentToTakeON.current.forEach(item => {
                const { model, animations } = getShaderedEquipment(item, uniforms)

                if (!model) { return console.warn('[FighterModel<takeOn>]: Equipment Model not Found') }
                const { injectModel, injectType } = getInjectModel(model)
                function getInjectModel(model) {
                    const armature = model.getObjectByName('Armature') // 1. Adding by weights
                    if (armature) { return {injectModel: armature, injectType: 'weights'} }
                    const animatedArmature = model.getObjectByName('animatedArmature') 
                    if (animatedArmature) { return {injectModel: animatedArmature, injectType: 'binders'} } // 2. Adding by Binders but with own bones
                    return {injectModel: model.getObjectByProperty('isMesh', true), injectType: 'binders'} // 3. Adding by Binders without bones, just mesh
                }
                // console.log('modelArmature', modelArmature)
                // if (!modelArmature) { return console.warn('[FighterModel<takeOn>]: Model Armature not found, mb it is renamed') }
                // console.log('injectModel', injectModel)
                // console.log('fighterArmature', fighterArmature)
                // Store Mixer to Animate equipment
                const animation = animations.find(_ => _.name === "Armature|mixamo.com|Layer0.001" || _.name === 'fly')
                // console.log(animation, 'animation')
                if (animation) {
                    // console.log(animation)
                    mixer.clipAction(animation, injectModel).setEffectiveTimeScale(1.5).play()
                    // clips.current.push({ itemHash: item.itemHash, animation, object: model })
                }
    
                // Set itemHash to remove via it then
                injectModel.userData.item = item
                injectModel.userData.itemHash = item.itemHash
                injectModel.userData.name = item.itemAttributes.name
                injectModel.name += item.itemAttributes.name
                injectModel.userData.injectionType = injectType
                // Set this in blender, to add animated armour parts
                // if (item.itemAttributes.name.toLowerCase().includes('pants')) {
                //     injectModel.userData.fragments = "legendary_pants_skirt_front,legendary_pants_skirt_back"
                // }
    
    
                hideBodyPart(item)
                addToScene(injectModel as THREE.Mesh | THREE.SkinnedMesh)
            })
            function addToScene(injectModel: THREE.Mesh | THREE.SkinnedMesh) {
                if (injectModel.userData.injectionType === 'binders') {
                    addViaBinders()
                } else {
                    addViaWeights()
                }
                // Fragments -- animated peaces of Equipment
                const fragments = addFragments()

                function addViaBinders() {
                    const binders = injectModel.userData.binders
                    const bindersData = JSON.parse(binders)
                    addPose(injectModel.userData.itemHash, bindersData, injectModel as THREE.Mesh)
                    updatePose(injectModel.userData.itemHash)
                }
                function addViaWeights() {
                    injectModel.traverse((object) => {
                        // @ts-expect-error
                        if (object.isSkinnedMesh) {
                            (object as THREE.SkinnedMesh).bind(fighterSkeleton.current, object.matrixWorld) // Bind Fighter Skeleton
                        }
                    })
                    fighterBone.current.add( injectModel )
                }
                function addFragments() {
                    // console.log('injectModel', injectModel)
                    const names = injectModel.userData?.fragments?.split(',')
                    if (!names) { return }
                    const fragments = getShaderedFragments(injectModel.userData.item, names, uniforms)
                    // console.log('fragments', fragments)
                    const models = []
                    fragments.forEach(fr => {
                        const model = fr.model.children[0]
                        // // Binders Logic
                        const binders = model.userData.binders
                        // console.log('binders',binders)
                        const bindersData = JSON.parse(binders)
                        applyBinder(fighterModel, model as any, bindersData[0])
                        fr.animations.forEach(_ => _.name.toLowerCase().includes('simulation') && mixer.clipAction(_, model).play())
                        models.push(model)
                    })
                    return models
                }
    
                // Store
                equipedMeshes.current[injectModel.userData.itemHash] = [injectModel]
                equipedFragments.current[injectModel.userData.itemHash] = fragments
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
    }, [equipment])

    // Render Items Shaders
    useFrame(({ clock }, delta) => {
        uniforms.current.uTime.value = clock.getElapsedTime()
        mixer.update( delta )
    })

    // Save ref to object to store & rm on unmount
    React.useEffect(() => {
        if (modelRef.current) {
            setSceneObject(fighter.id, modelRef.current, 'add')
        }
        return () => {
            setSceneObject(fighter.id, modelRef.current, 'remove')
        }
    }, [modelRef.current, fighter])

    // TODO: Think about this
    // If we have so strong connection between equipment change & actions
    // Should we refactor this in some more correct logic?
    const timeout = React.useRef<any>()
    React.useEffect(() => {
        clearTimeout(timeout.current)
        if (!isMove) {
            timeout.current = setTimeout(() => updatePoses(isMove), 50)
            return
        }
        updatePoses(isMove)
    }, [isMove])

    return (
        <group 
            name="fighter-model"
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
            onPointerDown={onPointerDown}
        >
            <primitive 
                ref={modelRef}
                object={fighterModel}
                scale={.32}
            >
                { children }
            </primitive>
        </group>
    )
}))

export default FighterModel