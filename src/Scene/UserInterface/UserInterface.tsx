import { useSceneContext } from "store/SceneContext"
import { Box as Cube, ScreenSpace, Html } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { Box, Flex } from "@react-three/flex"
import { useMemo } from "react"
import { memo } from "react"

import Backpack from "./Backpack/Backpack"
import BottomMenu from "./BottomMenu"

const UserInterface = memo(function UserInterface() {
    return (
        <ScreenSpace name="user-interface" depth={.1}>
            <Backpack/>
            <BottomMenu/>
        </ScreenSpace>
    )
})

export default UserInterface