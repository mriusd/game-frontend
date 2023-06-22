import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import styles from './Backpack.module.scss'
import { Flex, Box } from '@react-three/flex'
import { Box as Cube, Plane } from '@react-three/drei'
import { uiUnits } from 'Scene/utils/uiUnits'
import { memo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useLoadAssets } from 'store/LoadAssetsContext'
import ReuseModel from 'Scene/components/ReuseModel'
import { useSceneContext } from 'store/SceneContext'
import { setCursorPointer } from 'Scene/utils/setCursorPointer'
import { useEventCloud } from 'EventCloudContext'
import { useTexture } from '@react-three/drei'
import BackpackItem from './BackpackItem'
import { useBackpackStore } from 'store/backpackStore'
import { shallow } from 'zustand/shallow'

const colors = {
    DARK: '#DDDDDD',
    LIGHT: '#EDEDED'
}

const Backpack = memo(function Backpack() {
    const slotsPlaneRef = useRef<THREE.Mesh | null>(null)

    const setSlotsPlane = useBackpackStore(state => state.setSlotsPlane)
    const [backpackWidth, backpackHeight, isOpened] = useBackpackStore(state => 
        [state.width, state.height, state.isOpened], 
        shallow
    )


    // TODO:FIXME:CPU HOLE: state from EventCloud triggers alot of rerenders
    const { backpack } = useEventCloud()

    // Load backpack texture
    const texture = useTexture({ map: '/assets/backpack-grid.png' })
    
    // Transform items to Array for rendering
    const items = useMemo(() => {
        if (!backpack) { return }
        return Object.keys(backpack.items).map(slot => ({ ...backpack.items[slot], slot }))
    }, [backpack])

    // Set slots plane ref for placing Backpack Items
    useEffect(() => {
        if (slotsPlaneRef.current) {
            setSlotsPlane(slotsPlaneRef.current)
        }
    }, [slotsPlaneRef.current])
    


    console.log('rerender')
    useEffect(() => {
        console.log('backpack', backpack)
    }, [backpack])

    // Return nothing if no size for backpack
    // if (!size) {
    //     return <></>
    // }

    return (
        <Plane position={[0, 0, uiUnits(-10)]} visible={isOpened} args={[uiUnits(40), uiUnits(40), 1]}>
            <meshBasicMaterial color={'black'} transparent={true} opacity={.8} />
            {/* Backpack slots */}
            <Plane
                ref={slotsPlaneRef}
                name='backpack-slots-plane'
                position={[uiUnits(5), uiUnits(0), uiUnits(1)]} 
                args={[uiUnits(backpackWidth), uiUnits(backpackHeight)]} 
            >
                <meshBasicMaterial map={texture.map}/>
                <group name='backpack-items'>
                    {items?.length && items.map(item => <BackpackItem key={item.itemHash} item={item} />) }
                </group>
            </Plane>

            {/* Equiped on character items slots */}
            <Plane
                name='equpment-slots-plane'
                position={[uiUnits(-5), uiUnits(0), uiUnits(1)]} 
                args={[uiUnits(4), uiUnits(8)]} 
            >
                <meshBasicMaterial color={'black'}/>
            </Plane>
        </Plane>
    )
})

export default Backpack