import type { Fighter } from "interfaces/fighter.interface"
import React from "react"
import { SkeletonUtils } from "three-stdlib"
import { degToRad } from "three/src/math/MathUtils"
import { getIs } from "Scene/utils/utils"

export interface Binders {
    "id": string,
    "rotation": { "x": number, "y": number, "z": number },
    "position": { "x": number, "y": number, "z": number },
    "scale": { "x": number, "y": number, "z": number },
    "parentNodeName": string,
}

export const useEquimentPoses = (fighter: Fighter, model: THREE.Group | THREE.Mesh) => {
    const store = React.useRef<{[key: string]: { binders: Binders[], mesh: THREE.Mesh, poseIndex: number }}>({})

    const addPose = React.useCallback((name: string, binders: Binders[], mesh: THREE.Mesh) => {
        store.current[name] = { binders, mesh: mesh as THREE.Mesh, poseIndex: 0 }
    }, [])

    const removePose = React.useCallback((name: string) => {
        const pose = store.current[name]
        if (!pose) { return }
        // For Test
        const binder = pose.binders[pose.poseIndex]
        const fighterModelNode = model.getObjectByName(binder.parentNodeName.replace(':', ''))
        if (!fighterModelNode) { return console.warn('[useEquipmentPoses]: fighterModelNode not found, check binders') }
        fighterModelNode.remove( pose.mesh )
        delete store.current[name]
    }, [])

    const updatePose = React.useCallback((name: string) => {
        const pose = store.current[name]
        if (!pose) { return }
        // For Test
        const binder = pose.binders[pose.poseIndex]

        const fighterModelNode = model.getObjectByName(binder.parentNodeName.replace(':', ''))
        if (!fighterModelNode) { return console.warn('[useEquipmentPoses]: fighterModelNode not found, check binders') }
        // console.log('fighterModelNode', fighterModelNode)
        // const mesh = SkeletonUtils.clone(pose.mesh)
        const mesh = pose.mesh

        mesh.position.set(binder.position.x, binder.position.y, binder.position.z)
        mesh.rotation.set(degToRad(binder.rotation.x), degToRad(binder.rotation.y), degToRad(binder.rotation.z))
        mesh.scale.set(binder.scale.x, binder.scale.y, binder.scale.z)

        // console.log('one', fighterModelNode, mesh)

        // // fighterModelNode.add( modelArmature )
        fighterModelNode.add( mesh )
    }, [])

    // TODO: Fix this, for now made just for sword
    const updatePoses = React.useCallback((isMove: boolean) => {
        if (isMove) {
            Object.keys(store.current).forEach(key => {
                // TODO: Just for test, for walk
                if (store.current[key].binders.length > 1) {
                    store.current[key].poseIndex = 1
                    updatePose(key)
                }
            })
        } else {
            Object.keys(store.current).forEach(key => {
                store.current[key].poseIndex = 0
                updatePose(key)
            })
        }
    }, [])

    return { addPose, updatePose, updatePoses, removePose }
}