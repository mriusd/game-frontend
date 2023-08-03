/**
 * @fileoverview Copied utils from react-three-fiber 
 * https://github.com/pmndrs/react-three-fiber/blob/master/packages/fiber/src/core/utils.ts
 * @version v8.13.6
 */

import * as THREE from 'three'

export type EquConfig = {
    /** Compare arrays by reference equality a === b (default), or by shallow equality */
    arrays?: 'reference' | 'shallow'
    /** Compare objects by reference equality a === b (default), or by shallow equality */
    objects?: 'reference' | 'shallow'
    /** If true the keys in both a and b must match 1:1 (default), if false a's keys must intersect b's */
    strict?: boolean
}
export type ObjectMap = {
    nodes: { [name: string]: THREE.Object3D }
    materials: { [name: string]: THREE.Material }
}

// A collection of compare functions
export const is = {
    obj: (a: any) => a === Object(a) && !is.arr(a) && typeof a !== 'function',
    fun: (a: any): a is Function => typeof a === 'function',
    str: (a: any): a is string => typeof a === 'string',
    num: (a: any): a is number => typeof a === 'number',
    boo: (a: any): a is boolean => typeof a === 'boolean',
    und: (a: any) => a === void 0,
    arr: (a: any) => Array.isArray(a),
    equ(a: any, b: any, { arrays = 'shallow', objects = 'reference', strict = true }: EquConfig = {}) {
        // Wrong type or one of the two undefined, doesn't match
        if (typeof a !== typeof b || !!a !== !!b) return false
        // Atomic, just compare a against b
        if (is.str(a) || is.num(a)) return a === b
        const isObj = is.obj(a)
        if (isObj && objects === 'reference') return a === b
        const isArr = is.arr(a)
        if (isArr && arrays === 'reference') return a === b
        // Array or Object, shallow compare first to see if it's a match
        if ((isArr || isObj) && a === b) return true
        // Last resort, go through keys
        let i
        // Check if a has all the keys of b
        for (i in a) if (!(i in b)) return false
        // Check if values between keys match
        if (isObj && arrays === 'shallow' && objects === 'shallow') {
            for (i in strict ? b : a) if (!is.equ(a[i], b[i], { strict, objects: 'reference' })) return false
        } else {
            for (i in strict ? b : a) if (a[i] !== b[i]) return false
        }
        // If i is undefined
        if (is.und(i)) {
            // If both arrays are empty we consider them equal
            if (isArr && a.length === 0 && b.length === 0) return true
            // If both objects are empty we consider them equal
            if (isObj && Object.keys(a).length === 0 && Object.keys(b).length === 0) return true
            // Otherwise match them by value
            if (a !== b) return false
        }
        return true
    },
}


// Collects nodes and materials from a THREE.Object3D
export function buildGraph(object: THREE.Object3D) {
    const data: ObjectMap = { nodes: {}, materials: {} }
    if (object) {
        object.traverse((obj: any) => {
            if (obj.name) data.nodes[obj.name] = obj
            if (obj.material && !data.materials[obj.material.name]) data.materials[obj.material.name] = obj.material
        })
    }
    return data
}