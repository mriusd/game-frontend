import * as THREE from "three"
import { Coordinate } from "interfaces/coordinate.interface"
import { useEffect, useMemo, useRef, useState, memo } from "react"
import { matrixCoordToWorld } from "./utils/matrixCoordToWorld"
import { useSceneContext } from "store/SceneContext"
import { Mesh } from "three"
import { setCursorPointer } from "./utils/setCursorPointer"
import { useEventCloud } from "EventCloudContext"
import { Text } from "@react-three/drei"
import { createBillboardMaterial } from "./helpers/createBillboardMaterial"
import { getMeshDimensions } from "./utils/getMeshDimensions"
import type { ItemDroppedEvent } from "interfaces/item.interface"

interface Props { item: ItemDroppedEvent }
const DroppedItem = memo(function DroppedItem({ item }: Props) {
    const itemRef = useRef<Mesh | null>(null)    
    const { pickupDroppedItem, generateItemName } = useEventCloud()
    const { worldSize, html, setHoveredItems, setItemTarget } = useSceneContext()
    const [ currentWorldCoordinate, setCurrentWorldCoordinate ] = useState<Coordinate | null>(null)
    const rotationY = useMemo(() => Math.random() * Math.PI * 2, [])
    const offsetX = useMemo(() => Math.random() * .5 - .25, [])
    const offsetZ = useMemo(() => Math.random() * .5 - .25, [])
    const position = useMemo(() => {
        if (!currentWorldCoordinate) { return new THREE.Vector3(0, 0, 0) }
        return new THREE.Vector3(currentWorldCoordinate.x + offsetX, .05, currentWorldCoordinate.z + offsetZ)
    }, [currentWorldCoordinate])
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
        itemRef.current.material = materialActive
    }
    const handlePointerLeave = () => {
        setCursorPointer(html, false)
        // @ts-expect-error
        setHoveredItems(item, 'remove')
        if (!itemRef.current) { return }
        if (!textBackgroundRef.current) { return }
        textBackgroundRef.current.material = backgroundBillboardMaterial
        itemRef.current.material = material
    }
    const handlePointerClick = () => {
        pickupDroppedItem(item)
        setItemTarget(item)
    }


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
                        <mesh ref={textBackgroundRef} material={backgroundBillboardMaterial}>
                            <planeGeometry args={[(textBoundingBox?.width || .5) + .25, (textBoundingBox?.height || .2) + .2]} />
                        </mesh>
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
            <mesh 
                ref={itemRef}
                castShadow 
                position={position} 
                rotation={[0, rotationY, 0]}
                material={material}
            >
                <boxGeometry args={[.15, .1, .3]} />
            </mesh>
        </group>
    )
})

export default DroppedItem