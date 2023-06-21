import * as THREE from 'three'
import { Box } from "@react-three/drei"
import { useMemo, useRef } from "react"
import { useBackpackStore } from "store/backpackStore";
import { shallow } from 'zustand/shallow'
import { uiUnits } from 'Scene/utils/uiUnits';
import { useFrame } from '@react-three/fiber';

interface Props {
    item: { qty: number; itemHash: string; itemAttributes: any; slot: number }
}

const BackpackItem = ({ item  }: Props) => {
    const ref = useRef<THREE.Mesh | null>(null)
    const [ size, slotsPlane, planeBoundingBox ] = useBackpackStore(
        state => [state.size, state.slotsPlane, state.planeBoundingBox], 
        shallow
    )

    const itemWidth = useMemo(() => {
        if (!planeBoundingBox || !size) { return }
        return planeBoundingBox.width / size * .5 * item.itemAttributes.itemWidth
    }, [planeBoundingBox, size])
    const itemHeight = useMemo(() => {
        if (!planeBoundingBox || !size) { return }
        return planeBoundingBox.height / size * .5 * item.itemAttributes.itemHeight
    }, [planeBoundingBox, size])


    const itemPosition = useMemo(() => {
        if (!slotsPlane || !itemWidth || !itemHeight) { return }

        // Calc position to set in (0,0)
        const x0 = (slotsPlane.position.x) - (planeBoundingBox.width) - (planeBoundingBox.width * itemWidth / planeBoundingBox.width / size)
        const y0 = (slotsPlane.position.y) + (planeBoundingBox.height / 2) + (planeBoundingBox.height * itemHeight / planeBoundingBox.height / size)
        const z0 = slotsPlane.position.z

        // Get item location
        const [locationX, locationY] = String(item.slot).split(',').map(item => Number(item))
        console.log(locationX, locationY)
        // Translate position based on provided location data
        const offsetX = locationX+.5 * (planeBoundingBox.width / size)
        const offsetY = locationY+.5 * (planeBoundingBox.height / size)

        const x = x0 + offsetX /* * item.itemAttributes.itemWidth */
        const y = y0 - offsetY /* * item.itemAttributes.itemHeight */
        const z = z0

        return new THREE.Vector3(x, y, z)
    }, [slotsPlane, itemWidth, itemHeight])

    // console.log(slotsPlane)

    useFrame(() => {
        if (ref.current) {
            ref.current.rotation.y += 0.01
        }
    })

    // Return nothing if no plane ref for placing item
    if (!slotsPlane) {
        return <></>
    }

    return (
        <Box ref={ref} position={itemPosition} args={[itemWidth, itemHeight, itemWidth]}>
            <meshBasicMaterial color={'red'} />
        </Box>
        /* <ReuseModel gltf={gltf.current.sword} /> */
    )
}

export default BackpackItem