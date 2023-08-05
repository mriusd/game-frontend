import * as THREE from "three"
import { Coordinate } from "interfaces/coordinate.interface"
import { useEffect, useMemo, useRef, useState, memo } from "react"
import { matrixCoordToWorld } from "./utils/matrixCoordToWorld"
import { useSceneContext } from "store/SceneContext"
import { Mesh } from "three"
import { setCursorPointer } from "./utils/setCursorPointer"
import { useEventCloud } from "EventCloudContext"
import { Plane, Text } from "@react-three/drei"
import { createBillboardMaterial } from "./helpers/createBillboardMaterial"
import { getMeshDimensions } from "./utils/getMeshDimensions"
import type { ItemDroppedEvent } from "interfaces/item.interface"
import { getShaderedBackpackModel } from "./UserInterface3D/Backpack/utils/getShaderedBackpackModel"
import { useFrame } from "@react-three/fiber"
import { useTexture } from "@react-three/drei"

interface Props { item: ItemDroppedEvent }
const DroppedItem = memo(function DroppedItem({ item }: Props) {
    const itemRef = useRef<Mesh | null>(null)    
    const { pickupDroppedItem, generateItemName } = useEventCloud()
    const { worldSize, html, setHoveredItems, setItemTarget } = useSceneContext()
    const [ currentWorldCoordinate, setCurrentWorldCoordinate ] = useState<Coordinate | null>(null)
    const rotationZ = useMemo(() => Math.random() * Math.PI * 2, [])
    const offsetX = useMemo(() => Math.random() * .5 - .25, [])
    const offsetZ = useMemo(() => Math.random() * .5 - .25, [])
    const material = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xFFAA00 }), [])
    const materialActive = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xFFFF00 }), [])
    const textBillboardMaterial = useMemo(() => createBillboardMaterial(new THREE.MeshBasicMaterial()), [])
    const backgroundBillboardMaterial = useMemo(() => createBillboardMaterial(new THREE.MeshBasicMaterial({ color: 0x000000, opacity: .7, transparent: true })), [])
    const backgroundBillboardMaterialActive = useMemo(() => createBillboardMaterial(new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 1, transparent: true })), [])
    const textRef = useRef<Mesh | null>(null)
    const textBackgroundRef = useRef<THREE.Mesh | null>(null)
    const generatedName = useMemo(() => generateItemName(item.item, item.qty), [item])
    const isActive = useRef<boolean>(false)
    const textBoundingBox = useMemo(() => {
        if (!textRef.current) return null
        return getMeshDimensions(textRef.current)
    }, [textRef.current, isActive.current])

    const { map } = useTexture({ map: 'assets/notexture.png' })
    const uniforms = useRef({ uTime: { value: 0 } })
    // @ts-expect-error
    const model = useMemo<THREE.Mesh>(() => {
        const newModel = getShaderedBackpackModel(item.item, uniforms)

        if (!newModel) {
            return new THREE.Mesh(
                new THREE.BoxGeometry(+item.item.itemWidth / 4, +item.item.itemHeight / 4, +item.item.itemWidth / 4),
                new THREE.MeshStandardMaterial({ color: 'pink', map })
            )
        }
        return newModel
    }, [item, map])

    // Clone to try to fix upping issue
    const clonedModel = useMemo(() => model.clone(), [model])

    const position = useMemo(() => {
        if (!model) { return new THREE.Vector3(0, 0, 0) }
        if (!currentWorldCoordinate) { return new THREE.Vector3(0, 0, 0) }
        const bb = getMeshDimensions(model)
        return new THREE.Vector3(currentWorldCoordinate.x + offsetX, bb.depth / 2, currentWorldCoordinate.z + offsetZ)
    }, [currentWorldCoordinate, model])

    useEffect(() => {
        setTimeout(() => {
            isActive.current = true
        }, 30)
        return () => {
            handlePointerLeave()
        }
    }, [])

    useEffect(() => {
        // console.log(item, 'item')
        if (item?.coords) {
            setCurrentWorldCoordinate(matrixCoordToWorld(worldSize.current, item.coords))
        }
    }, [item])

    const handlePointerEnter = () => {
        setCursorPointer(html, true)
        // @ts-expect-error
        setHoveredItems(item, 'add')
        if (!itemRef.current) { return }
        if (!textBackgroundRef.current) { return }
        textBackgroundRef.current.material = backgroundBillboardMaterialActive
        setOpacity(itemRef.current, .4)
    }
    const handlePointerLeave = () => {
        setCursorPointer(html, false)
        // @ts-expect-error
        setHoveredItems(item, 'remove')
        if (!itemRef.current) { return }
        if (!textBackgroundRef.current) { return }
        textBackgroundRef.current.material = backgroundBillboardMaterial
        setOpacity(itemRef.current, 1)
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
        pickupDroppedItem(item)
        setItemTarget(item)
    }

    useFrame(({ clock }) => {
        if (model) {
            uniforms.current.uTime.value = clock.getElapsedTime()
        }
    })

    if (!currentWorldCoordinate) {
        return <></>
    }

    return (
        <group
            onPointerMove={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            onPointerDown={handlePointerClick}
        >
                <group 
                    visible={!!isActive.current}
                    position={[position.x, position.y + 1, position.z]}
                >
                    <Plane 
                        ref={textBackgroundRef} 
                        material={backgroundBillboardMaterial}
                        args={[(textBoundingBox?.width || .5) + .25, (textBoundingBox?.height || .2) + .2]}
                    />
                    <Text 
                        position={[0, 0, .001]}
                        ref={textRef}
                        color={0xFF8800} 
                        fillOpacity={1}
                        anchorX="center" 
                        anchorY="middle" 
                        fontSize={.25}
                        material={textBillboardMaterial}
                    >
                        { generatedName }
                    </Text>
                </group>
                <primitive 
                    ref={itemRef}
                    object={clonedModel}
                    castShadow 
                    position={position} 
                    rotation={[Math.PI / -2, 0, rotationZ]}
                />
        </group>
    )
})

export default DroppedItem