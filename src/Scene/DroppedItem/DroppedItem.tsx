import React, { useRef } from "react"

import * as THREE from "three"
import { useFrame, useThree } from "@react-three/fiber"
import { Plane, Text } from "@react-three/drei"

import { useSpring, easings } from "react-spring"
import { animated } from "@react-spring/three"

import { createBillboardMaterial } from "Scene/materials/createBillboardMaterial"
import { getMeshDimensions } from "Scene/utils/getMeshDimensions"
import { generateItemName } from "Scene/utils/generateItemName"
import { isException } from "./utils/isException"

import type { ItemDroppedEvent } from "interfaces/item.interface"

import { useShaderedItem } from "./utils/useShaderedItem"
import { useModelScale } from "./utils/useModelScale"

import { useCloud } from "EventCloud/useCloud"
import { useCore } from "Scene/useCore"
import { useUi } from "Scene/UserInterface3D/useUI"

interface Props { item: ItemDroppedEvent }
const DroppedItem = React.memo(function DroppedItem({ item }: Props) {
    const itemRef = React.useRef<THREE.Mesh | null>(null)    
    const pickedUp = useRef(false)
    const hovered = useRef(false)

    const [pickupDroppedItem] = useCloud(state => [state.pickupDroppedItem])
    const [setHoveredItems, matrixCoordToWorld] = useCore(state => [state.setHoveredItems, state.matrixCoordToWorld])
    const setCursor = useUi(state => state.setCursor)

    // Model
    const { model, uniforms } = useShaderedItem(item)

    const scale = useModelScale(item)
    const get = useThree(state => state.get)

    // Positioning
    const rotationZ = React.useMemo(() => Math.random() * Math.PI * 2, [])
    const offsetX = React.useMemo(() => Math.random() * .5 - .25, [])
    const offsetZ = React.useMemo(() => Math.random() * .5 - .25, [])
    const position = React.useMemo(() => {
        if (!model) { return new THREE.Vector3(0, 0, 0) }
        const bb = getMeshDimensions(model)
        const depth = isException(item) ? bb.height / 2 : bb.depth / 2
        const coordinate = matrixCoordToWorld(item.coords)
        return new THREE.Vector3(coordinate.x + offsetX, depth * scale.y, coordinate.z + offsetZ)
    }, [model, item, scale])

    // Billboard Material
    const textBillboardMaterial = React.useMemo(() => { 
        const m = createBillboardMaterial(new THREE.MeshBasicMaterial())
        m.depthTest = false
        m.depthWrite = false
        return m
    }, [])
    const backgroundBillboardMaterial = React.useMemo(() => {
        const m = createBillboardMaterial(new THREE.MeshBasicMaterial({ color: 0x000000, opacity: .7, transparent: true }))
        m.depthTest = false
        m.depthWrite = false
        return m
    }, [])

    const textRef = React.useRef<THREE.Mesh | null>(null)
    const textContainerRef = React.useRef<THREE.Group | null>(null)

    
    // Text
    const generatedName = React.useMemo(() => generateItemName(item.item, item.qty), [item])
    const width = React.useMemo(() => generatedName.length / 10, [generatedName])

    const rotation = React.useMemo(() => {
        if (isException(item)) {
            return [0, rotationZ, 0]
        }
        return [-Math.PI / 2, 0, rotationZ]
    }, [])

    React.useEffect(() => {
        return () => {
            handlePointerLeave()
        }
    }, [])

    const handlePointerEnter = () => {
        setCursor('pointer')
        // @ts-expect-error
        setHoveredItems(item, 'add')
        if (!itemRef.current) { return }
        setOpacity(itemRef.current, .4)
        hovered.current = true
    }
    const handlePointerLeave = () => {
        setCursor('default')
        // @ts-expect-error
        setHoveredItems(item, 'remove')
        if (!itemRef.current) { return }
        setOpacity(itemRef.current, 1)
        hovered.current = false
    }
    function setOpacity(item: THREE.Group | THREE.Mesh, opacity: number) {
        item.traverse(object => {
            // @ts-expect-error
            if (object.isMesh) {
                // @ts-expect-error
                object.material.transparent = true
                // @ts-expect-error
                object.material.opacity = opacity
            }
        })
    }
    const handlePointerClick = () => {
        if (pickedUp.current) { return }
        pickupDroppedItem(item)
        hovered.current = false
        // TODO: Check what it was
        // setItemTarget(item)
        pickedUp.current = true
    }

    useFrame(({ clock }) => {
        if (model) {
            uniforms.current.uTime.value = clock.getElapsedTime()

            // Show Text on Hover / Hide while holding ALT
            if (textContainerRef.current) {
                const $ui = useUi.getState()
                if (hovered.current) {
                    if ($ui.pressedKeys.includes('metaleft') || $ui.pressedKeys.includes('altleft')) { 
                        textContainerRef.current.position.y = 0.2
                        return
                    }
                    textContainerRef.current.position.y = 1
                    return
                }
                // TODO: add correct types to HoveredItems
                textContainerRef.current.position.y = 1
            }
        }
    })

    // Drop animation
    const [props, api] = useSpring(() => ({
        posX: matrixCoordToWorld(item.coords).x,
        posY: 2.5,
        posZ: matrixCoordToWorld(item.coords).z,
        config: {
            easing: easings.easeInBack,
            duration: 500
        }
    }))
    React.useEffect(() => void setTimeout(() => api.start({ posX: position.x, posY: position.y, posZ: position.z }), 10), [])

    return (
        <group
            onPointerMove={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            onPointerDown={handlePointerClick}
        >
                <animated.group 
                    position-x={props.posX}
                    position-y={props.posY}
                    position-z={props.posZ}
                >
                    <Plane 
                        name="plane-heatbox"
                        material={backgroundBillboardMaterial}
                        args={[width, .25]}
                        position={[0, 1, 0]}
                        visible={false}
                    />
                    <group
                        ref={textContainerRef}
                        // visible={!!isActive.current}
                        position={[0, 1, 0]}
                    >
                        <Plane 
                            material={backgroundBillboardMaterial}
                            args={[width, .25]}
                        />
                        <Text 
                            position={[0, 0, .001]}
                            ref={textRef}
                            color={0xFF8800} 
                            fillOpacity={1}
                            anchorX="center" 
                            anchorY="middle" 
                            fontSize={.15}
                            material={textBillboardMaterial}
                        >
                            { generatedName }
                        </Text>
                    </group>
                    <primitive
                        ref={itemRef}
                        object={model}
                        castShadow 
                        // position={position} 
                        rotation={rotation}
                        scale={scale}
                    />
                </animated.group>
        </group>
    )
})

export default DroppedItem