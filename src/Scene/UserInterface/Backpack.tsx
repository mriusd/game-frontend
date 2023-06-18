import { useMemo, useRef } from 'react'
import styles from './Backpack.module.scss'
import { Flex, Box } from '@react-three/flex'
import { Box as Cube, Plane } from '@react-three/drei'
import { uiUnits } from 'Scene/utils/uiUnits'
import { useUiStore } from 'store/uiStore'

const Backpack = () => {
    const backpackSize = useRef<number>(8)
    const array = useMemo(() => new Array(backpackSize.current), [backpackSize.current])

    const isOpened = useUiStore(state => state.isBackpackOpened)

    return (
        <Plane position={[0, 0, uiUnits(-2)]} visible={isOpened} args={[uiUnits(20), uiUnits(20), 1]}>
            <meshBasicMaterial color={'black'} transparent={true} opacity={.8} />
            {/* <Cube args={[uiUnits(1), uiUnits(1), uiUnits(1)]} /> */}
            <Flex flexDir="column" name='backpack'>
                {/* <Box margin={uiUnits(.2)} flexDir="row">
                    <Box margin={uiUnits(.2)}>
                        <Cube args={[uiUnits(1), uiUnits(1), uiUnits(1)]} />
                    </Box>
                    <Box margin={uiUnits(.2)}>
                        <Cube args={[uiUnits(1), uiUnits(1), uiUnits(1)]} />
                    </Box>
                </Box>
                <Box margin={uiUnits(.2)} flexDir="row">
                    <Box margin={uiUnits(.2)}>
                        <Cube args={[uiUnits(1), uiUnits(1), uiUnits(1)]} />
                    </Box>
                    <Box margin={uiUnits(.2)}>
                        <Cube args={[uiUnits(1), uiUnits(1), uiUnits(1)]} />
                    </Box>
                </Box> */}
                { array.map((_, i) => (
                    <Box margin={uiUnits(.2)} key={i} flexDir="row">
                        { array.map((_, j) => (
                            <Box margin={uiUnits(.2)} key={'_'+j}>
                                <Cube args={[uiUnits(1), uiUnits(1), uiUnits(1)]} />
                            </Box>
                        )) }
                    </Box>
                )) }
            </Flex>
        </Plane>

    )
}

{/* <Flex plane='xy' flexDirection="column" size={[uiUnits(4), 0, 0]} name='backpack'>
{ array.map(_ => (
    <Box key={_} flexDirection="row" name='backpack-row'>
        { array.map(_ => (
            <Box key={'_'+_}>
                <Cube args={[uiUnits(1), uiUnits(1), uiUnits(1)]} />
            </Box>
        )) }
    </Box>
)) }
</Flex> */}

export default Backpack