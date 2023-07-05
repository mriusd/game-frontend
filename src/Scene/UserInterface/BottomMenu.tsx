import { Flex, Box } from "@react-three/flex"
import Button from "./Button"
import { useBackpackStore } from "store/backpackStore" 

const BottomMenu = () => {
    const toggleBackpack = useBackpackStore(state => state.toggle)
    return (
        <Flex position={[0, 0, 0]} flexDir="row" name="bottom-menu" size={[10, 0, 0]}>
            <Box>
                <Button name="backpack-button" onClick={toggleBackpack} position={[0, -350, 0]} args={[100, 40]}>Backpack</Button>
            </Box>
        </Flex>
    )
}

export default BottomMenu