import * as THREE from 'three'
import { useEffect, useMemo } from 'react'
import { Flex, Box } from '@react-three/flex'
import { Plane } from '@react-three/drei'
import { uiUnits } from 'Scene/utils/uiUnits'
import { memo } from 'react'
import BackpackItem from './BackpackItem'
import { useBackpackStore } from 'store/backpackStore'
import { shallow } from 'zustand/shallow'
import { useEventStore } from 'store/EventStore'

const colors = {
    DARK: '#131313',
    LIGHT: '#202020'
}

const Backpack = memo(function Backpack() {
    const backpack = useEventStore(state => state.backpack)
    const [backpackWidth, backpackHeight, isOpened, slots] = useBackpackStore(state => 
        [state.width, state.height, state.isOpened, state.slots], 
        shallow
    )
    
    // Transform items to Array for rendering
    const items = useMemo(() => {
        if (!backpack) { return }
        return Object.keys(backpack.items).map(slot => ({ ...backpack.items[slot], slot }))
    }, [backpack])


    console.log('----> Rerender Backpack')
    useEffect(() => {
        console.log('backpack', backpack)
    }, [backpack])

    const setRef = (ref: any, x: number, y: number) => {
        if (!slots.current) {
            // @ts-expect-error
            slots.current = {}
        }
        return slots.current[x+','+y] = ref
    }

    return (
        <group position={[0, 0, uiUnits(-10)]} visible={isOpened}>
            <Plane name='background-plane' args={[uiUnits(40), uiUnits(40), 1]}>
                <meshBasicMaterial color={'black'} transparent={true} opacity={.8} />
            </Plane>

            {/* Backpack slots */}
            <Flex name='backpack' position={[uiUnits(1), uiUnits(4), uiUnits(1)]} flexDir="column" >
                { [...new Array(backpackWidth)].map((_, i) => (
                    <Box name='column' key={i} flexDir="row">
                        { [...new Array(backpackHeight)].map((_, j) => (
                            <Box name='row' key={'_'+j}>
                                <Plane 
                                    name='slot-cell' 
                                    args={[uiUnits(1), uiUnits(1), 1]}
                                    // layers={raycasterLayer}
                                >
                                    <meshBasicMaterial color={(i + j) % 2 === 0 ? colors.DARK : colors.LIGHT} />
                                    <group 
                                        name='slot'
                                        ref={(r) => setRef(r, j, i)} 
                                        position={[0, 0, 0]}
                                        userData={{slot: { x: j, y: i }, type: 'backpack'}}
                                    ></group>
                                </Plane>
                            </Box>
                        ))}
                    </Box>
                )) }
            </Flex>

            {/* Equiped on character items slots */}
            <Plane
                name='backpack-equiped-items'
                position={[uiUnits(-5), uiUnits(0), uiUnits(1)]} 
                args={[uiUnits(4), uiUnits(8)]} 
            >
                <meshBasicMaterial color={'black'}/>
            </Plane>
                
            <group name='backpack-items'>
                {items?.length && items.map(item => <BackpackItem key={item.itemHash} item={item} />) }
            </group>
        </group>

    )
})

export default Backpack