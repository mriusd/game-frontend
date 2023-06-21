import { useSceneContext } from "store/SceneContext"
import { Box as Cube, ScreenSpace, Html } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { Box, Flex } from "@react-three/flex"
import { useMemo } from "react"
import { memo } from "react"

import Backpack from "./Backpack/Backpack"
import BottomMenu from "./BottomMenu"

const UserInterface = memo(function UserInterface() {
    const store = useSceneContext()
    const { camera } = useThree() 

    return (
        <ScreenSpace name="user-interface" depth={.1}>
            <Backpack/>
            {/* <Flex flexDir="row">
                <Box centerAnchor margin={.1}>
                    <Cube args={[1, 1, 1]}/>
                </Box>
            </Flex> */}
            {/* <Cube position={[0, 0, -5]} args={[1, 1, 1]}/> */}
            <BottomMenu/>
        </ScreenSpace>
    )
})

export default UserInterface