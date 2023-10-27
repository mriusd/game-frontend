import { ScreenSpace } from "@react-three/drei"
import { Plane, Hud } from "@react-three/drei"
import { memo } from "react"
// import { BloomHud } from "Scene/components/r3f/BloomHud"

import { useUi } from "./useUI"
import { useSettings } from "Scene/UserInterface2D/Settings/useSettings"

import Backpack from "./Backpack/Backpack"
import BottomMenu from "./BottomMenu"

import { shallow } from "zustand/shallow"

import { OrthographicCamera } from "@react-three/drei"

const UserInterface3D = memo(function UserInterface() {
    const [userInterface, intersectionPlane] = useUi(state => [state.userInterface, state.intersectionPlane], shallow)
    const enablePost = useSettings(state => state.enablePostprocessing)
    return (
        <Hud renderPriority={enablePost ? 3 : 1}>
            <OrthographicCamera makeDefault position={[0, 0, 10]} />
            <ambientLight color={0xFFFFFF} intensity={.5} />
            <directionalLight color={0xFFFFFF} position={[-5, 0, 10]} intensity={.5} />
            <directionalLight color={0xFFFFFF} position={[5, 0, 10]} intensity={.5} />

            <group position={[0, 0, -1000]} ref={userInterface} name="user-interface">
                <Backpack/>
                <BottomMenu/>
                <Plane ref={intersectionPlane} name='intersection-plane' visible={false} args={[4000, 4000, 1]}></Plane>
            </group>
        </Hud>
    )
})

export default UserInterface3D