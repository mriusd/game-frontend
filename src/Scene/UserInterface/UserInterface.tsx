import { ScreenSpace } from "@react-three/drei"
import { Plane, Hud } from "@react-three/drei"
import { memo } from "react"

import { useUiStore } from "store/uiStore"

import Backpack from "./Backpack/Backpack"
import BottomMenu from "./BottomMenu"

import { shallow } from "zustand/shallow"

import { OrthographicCamera } from "@react-three/drei"

const UserInterface = memo(function UserInterface() {
    const [userInterface, intersectionPlane] = useUiStore(state => [state.userInterface, state.intersectionPlane], shallow)
    return (
        <Hud>
            <OrthographicCamera makeDefault position={[0, 0, 10]} />
            <ambientLight color={0xFFFFFF} intensity={.5} />
            <directionalLight color={0xFFFFFF} position={[-5, 0, 10]} />
            <group position={[0, 0, -1000]} ref={userInterface} name="user-interface">
                <Backpack/>
                <BottomMenu/>
                <Plane ref={intersectionPlane} name='intersection-plane' visible={false} args={[4000, 4000, 1]}></Plane>
            </group>
        </Hud>
    )
})

export default UserInterface