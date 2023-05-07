import * as THREE from "three"
import { Coordinate } from "interfaces/coordinate.interface"
import { useEffect, useMemo, useRef, useState } from "react"
import { matrixCoordToWorld } from "./utils/matrixCoordToWorld"
import { useSceneContext } from "store/SceneContext"
import { Mesh } from "three"
import { setCursorPointer } from "./utils/setCursorPointer"
import { useEventCloud } from "EventCloudContext"
import { Text } from "@react-three/drei"
import { createBillboardMaterial } from "./helpers/createBillboardMaterial"

const DroppedItem = ({ item }) => {
    const itemRef = useRef<Mesh | null>(null)
    const { pickupDroppedItem, generateItemName } = useEventCloud()
    const { worldSize, html, isAnyItemHovered } = useSceneContext()
    const [ currentWorldCoordinate, setCurrentWorldCoordinate ] = useState<Coordinate | null>(null)
    const rotationY = useMemo(() => Math.random() * Math.PI * 2, [])
    const offsetX = useMemo(() => Math.random() * .5 - .25, [])
    const offsetZ = useMemo(() => Math.random() * .5 - .25, [])
    const generatedName = useRef<string>(null)
    const position = useMemo(() => {
        if (!currentWorldCoordinate) { return new THREE.Vector3(0, 0, 0) }
        return new THREE.Vector3(currentWorldCoordinate.x + offsetX, .05, currentWorldCoordinate.z + offsetZ)
    }, [currentWorldCoordinate])
    const material = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xFFAA00 }), [])
    const materialActive = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xFFFF00 }), [])
    const billboardMaterial = useMemo(() => createBillboardMaterial(new THREE.MeshBasicMaterial({ color: 0xFFFFFF })), [])

    useEffect(() => {
        if (item?.coords) {
            setCurrentWorldCoordinate(matrixCoordToWorld(worldSize.current, item.coords))
        }
    }, [item])

    const handlePointerEnter = () => {
        if (!itemRef.current) { return }
        if (isAnyItemHovered.current) { return }
        setCursorPointer(html, true)
        // @ts-expect-error
        isAnyItemHovered.current = true
        generatedName.current = generateItemName(item.item, item.qty)
        itemRef.current.material = materialActive
    }
    const handlePointerLeave = () => {
        if (!itemRef.current) { return }
        setCursorPointer(html, false)
        // @ts-expect-error
        isAnyItemHovered.current = false
        generatedName.current = null
        itemRef.current.material = material
    }
    const handlePointerClick = () => {
        pickupDroppedItem(item)
        handlePointerLeave()
    }


    if (!currentWorldCoordinate) {
        return <></>
    }

    return (
        <>
            {
                generatedName.current &&
                <Text 
                    color="white" 
                    anchorX="center" 
                    anchorY="middle" 
                    fontSize={.25}
                    position={[position.x, position.y + .5, position.z]}
                    material={billboardMaterial}
                >
                    { generatedName.current }
                </Text>
            }
            <mesh 
                ref={itemRef}
                onPointerMove={handlePointerEnter}
                onPointerLeave={handlePointerLeave}
                onPointerDown={handlePointerClick}
                castShadow 
                position={position} 
                rotation={[0, rotationY, 0]}
                material={material}
            >
                <boxGeometry args={[.15, .1, .3]} />
            </mesh>
        </>
    )
}

export default DroppedItem