import React, { useEffect, useMemo, useRef } from "react"
import Name from "Scene/components/Name"
import { useSceneContext } from "store/SceneContext"
import { BackpackSlot } from "interfaces/backpack.interface"
import { getShaderedEquipment } from "./utils/getShaderedEquipment"
import { useFrame } from "@react-three/fiber"
import { Fighter } from "interfaces/fighter.interface"
import { SkeletonUtils } from "three-stdlib"

interface Props { model: THREE.Group | THREE.Mesh, fighter: Fighter, position: number[], rotation?: number[], children?: any }
const FighterModel = React.memo(React.forwardRef(function FighterModel({ model: baseModel, fighter, position, rotation, children }: Props, ref) {
    // Clone model for Reuse
    const model = useMemo(() => SkeletonUtils.clone(baseModel), [baseModel])


    // Equipment we take on Fighter
    // const equipment = useEventStore(state => state.equipment)
    const equipment = useMemo(() => fighter.equipment, [fighter])

    const modelRef = useRef()
    // Forward ref
    React.useImperativeHandle(ref, () => modelRef.current)


    // Space in Fighter model where we insert all Equipment
    const fighterArmature = useRef<THREE.Group | null>(null)
    // Save skeleton & then apply to equipment
    const fighterSkeleton = useRef<THREE.Skeleton | null>(null)
    // Save all currently equipmented items to remove then
    const equipedMeshes = useRef<Array<{ itemHash: string, objects: {name: string}[] }>>([])

    // Store last equipment state
    const lastEquipment = useRef<BackpackSlot[]>([])
    // Depending on this states we take on or take of equipment
    const equipmentToTakeOF = useRef<BackpackSlot[]>([])
    const equipmentToTakeON = useRef<BackpackSlot[]>([])


    const uniforms = useRef({ uTime: { value: 0 } })

    // Enable shadows
    useEffect(() => {
        if (!model) { return }
        model.traverse((child) => {
            // @ts-expect-error
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        }) 
    }, [model])

    // Find Armature & Skeleton
    useEffect(() => {
        // @ts-expect-error
        fighterArmature.current = model.getObjectByName("Armature")
        fighterSkeleton.current = (model.getObjectByName("standard") as THREE.SkinnedMesh)?.skeleton
        // console.log('FighterModel ', fighterArmature.current, fighterSkeleton.current)
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
            removeFromScene(equipedMeshes.current[meshIndex])
            // Remove from stored array
            equipedMeshes.current.splice(meshIndex, 1)
        })
        function removeFromScene(model: { itemHash: string, objects: {name: string}[] }) {
            // console.log('removeFromScene', model)
            model.objects.forEach(_ => {
                const object = fighterArmature.current.getObjectByName(_.name)
                // console.log('Object to remove', object)
                // @ts-expect-error
                if (object.isSkinnedMesh) {
                    fighterArmature.current.remove(object)
                    // console.log('By ID', mesh.name, fighterArmature.current.getObjectByName(mesh.name), fighterArmature.current)
                }
            })
        }
    }
    function takeOnNewEquipment() {
        equipmentToTakeON.current.forEach(item => {
            const model = getShaderedEquipment(item, uniforms)
            if (!model) { return console.warn('[FighterModel<takeOn>]: Equipment Model not Found') }
            const modelArmature = model.getObjectByName('Armature')
            // console.log('modelArmature', modelArmature)
            if (!modelArmature) { return }
            
            // Set itemHash to remove via it then
            modelArmature.userData.itemHash = item.itemHash
            modelArmature.userData.name = item.itemAttributes.name



            addToScene(modelArmature as THREE.Group)
        })
        function addToScene(model: THREE.Group | THREE.SkinnedMesh) {
            const equiped = { itemHash: model.userData.itemHash, objects: [] }
            model.children.forEach(object => {
                // @ts-expect-error
                if (object.isGroup) {
                    object.children.forEach((mesh: THREE.SkinnedMesh) => { 
                        if (!mesh.isSkinnedMesh) { return console.error('[FighterModel<takeOn>]: Wrong Equipment Model, skinnedMesh expected, with name', model.name) }
                        // Add hash to name to find skinnedMesh via it later
                        mesh.name += model.userData.name
                        
                        mesh.bind(fighterSkeleton.current, mesh.matrixWorld) // Bind Fighter Skeleton
                        
                        fighterArmature.current.add(mesh) 
                        equiped.objects.push({ name: mesh.name })
                    })
                } 
                // @ts-expect-error
                else if (object.isSkinnedMesh) {
                    (object as THREE.SkinnedMesh).bind(fighterSkeleton.current, object.matrixWorld) // Bind Fighter Skeleton
                    object.name += model.userData.name

                    fighterArmature.current.add(object)
                    equiped.objects.push({ name: object.name })
                }
            })

            // Store 
            equipedMeshes.current.push(equiped)
        }
    }

    // Render Items Shaders
    useFrame(({ clock }) => {
        uniforms.current.uTime.value = clock.getElapsedTime()
    })

    return (
        <group name="fighter-model">
            <Name value={fighter.name || 'Player_'+fighter.id} target={modelRef} offset={.4} />
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