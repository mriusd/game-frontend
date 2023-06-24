import { Flex, Box } from "@react-three/flex"
import { Box as Cube } from "@react-three/drei"
import { uiUnits } from "Scene/utils/uiUnits"
import Button from "./Button"
import { useBackpackStore } from "store/backpackStore" 

const BottomMenu = () => {
    const toggleBackpack = useBackpackStore(state => state.toggle)
    return (
        <Flex position={[0, 0, uiUnits(-1)]} flexDir="row" name="bottom-menu" size={[uiUnits(4), 0, 0]}>
            <Box>
                <Button name="backpack-button" onClick={toggleBackpack} position={[0, uiUnits(-4), 0]} args={[uiUnits(1), uiUnits(.3)]}>Backpack</Button>
            </Box>
        </Flex>
    )
}

export default BottomMenu