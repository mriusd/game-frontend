import { Flex, Box } from "@react-three/flex"
import Button from "./Button"
import { useBackpack } from "Scene/UserInterface3D/Backpack/useBackpack" 
import { useCharStats } from "Scene/UserInterface3D/CharStats/useCharStats" 
import { Plane, useTexture } from "@react-three/drei"
import { useRef } from "react"
import { ThreeEvent } from "@react-three/fiber"

const BottomMenu = () => {
    const toggleBackpack = useBackpack(state => state.toggle)
    const toggleCharStats = useCharStats(state => state.toggle)
    const [map, mapHover] = useTexture(['/assets/backpack-icon.png', '/assets/backpack-icon-hover.png'])
    const onPointerEnter = (e: ThreeEvent<PointerEvent>) => {
        // @ts-expect-error
        e.object.material.map = mapHover
    }
    const onPointerLeave = (e: ThreeEvent<PointerEvent>) => {
        // @ts-expect-error
        e.object.material.map = map
    }
    return (
        <Flex position={[0, 0, 0]} flexDir="row" name="bottom-menu" size={[10, 0, 0]}>
            {/* <Box>
                <Button name="backpack-button" onClick={toggleBackpack} position={[0, -350, 0]} args={[100, 40]}>Backpack</Button>
            </Box> */}
            <Box>
                <Button name="backpack-button" onClick={toggleBackpack} position={[-50, -350, 0]}>
                    <Plane onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave} args={[80, 80]}>
                        <meshBasicMaterial map={map} transparent={true} />
                    </Plane>
                </Button>
                <Button name="stats-button" onClick={toggleCharStats} position={[50, -350, 0]}>
                    <Plane onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave} args={[80, 80]}>
                        <meshBasicMaterial map={map} transparent={true} />
                    </Plane>
                </Button>
            </Box>
        </Flex>
    )
}

export default BottomMenu