import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import styles from './Backpack.module.scss'
import { Flex, Box } from '@react-three/flex'
import { Box as Cube, Plane } from '@react-three/drei'
import { uiUnits } from 'Scene/utils/uiUnits'
import { useUiStore } from 'store/uiStore'
import { memo } from 'react'
import { useFrame } from '@react-three/fiber'

const colors = {
    DARK: '#DDDDDD',
    LIGHT: '#EDEDED'
}

const Backpack = memo(function Backpack() {
    const backpackSize = useRef<number>(8)
    const array = useMemo(() => new Array(backpackSize.current), [backpackSize.current])
    const isOpened = useUiStore(state => state.isBackpackOpened)
    const clock = useMemo(() => new THREE.Clock(), [])
    const ref = useRef<THREE.Object3D | null>(null)

    const onPointerEnter = (e: any) => {
        ref.current = e.eventObject
    }
    const onPointerLeave = () => {
        ref.current = null
    }

    useFrame(() => {
        if (ref.current) {
            ref.current.rotation.y += 0.05
        }
    })

    return (
        <Plane position={[0, 0, uiUnits(-8)]} visible={isOpened} args={[uiUnits(40), uiUnits(40), 1]}>
            <meshBasicMaterial color={'black'} transparent={true} opacity={.8} />
            <Flex position={[uiUnits(1), uiUnits(3.5), uiUnits(1)]} flexDir="column" name='backpack'>
                { [...array].map((_, i) => (
                    <Box margin={0} key={i} flexDir="row">
                        { [...array].map((_, j) => (
                            <Box margin={0} key={'_'+j}>
                                <Plane args={[uiUnits(1), uiUnits(1), 1]}>
                                    <meshBasicMaterial color={(i + j) % 2 === 0 ? colors.DARK : colors.LIGHT} />
                                    <Cube onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave} args={[uiUnits(.4), uiUnits(.4), uiUnits(.4)]}>
                                        <meshBasicMaterial color={'red'} />
                                    </Cube>
                                </Plane>
                            </Box>
                        ))}
                    </Box>
                )) }
            </Flex>
        </Plane>

    )
})

export default Backpack