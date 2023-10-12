// TODO: Think about this hook & probably fix it
// Idk, may be should be done another way in future
import React from "react"

import * as THREE from 'three'

import { getIs } from "Scene/utils/utils"

import type { ItemDroppedEvent } from "interfaces/item.interface"

export const useModelScale = (item: ItemDroppedEvent) => {
    return React.useMemo(() => {
        const vec3 = new THREE.Vector3(1, 1, 1)
        const is = getIs(item.item.name)
        if (is('helm')) {
            return vec3.multiplyScalar(.7)
        }
        if (is('armour')) {
            return vec3.multiplyScalar(.8)
        }
        if (is('pants')) {
            return vec3.multiplyScalar(.8)
        }
        if (is('boots')) {
            return vec3.multiplyScalar(.9)
        }
        if (is('gloves')) {
            return vec3.multiplyScalar(1)
        }
        if (is('crystal', 'sword')) {
            return vec3.multiplyScalar(2)
        }
        if (is('wings')) {
            return vec3.multiplyScalar(3)
        }
        if (is('magic', 'box')) {
            return vec3.multiplyScalar(.6)
        }
        return vec3
    }, [item])
}