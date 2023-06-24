import { ScreenSpace } from "@react-three/drei"
import { useEffect, useRef } from "react"
import { Plane } from "@react-three/drei"
import { memo } from "react"

import { useUiStore } from "store/uiStore"

import Backpack from "./Backpack/Backpack"
import BottomMenu from "./BottomMenu"

import { depth, uiUnits } from "Scene/utils/uiUnits"

import UiLayer from "./UiLayer"
import { shallow } from "zustand/shallow"

const UserInterface = memo(function UserInterface() {
    const [eventsNode, userInterface, intersectionPlane] = useUiStore(state => [state.eventsNode ,state.userInterface, state.intersectionPlane], shallow)
    return (
        <ScreenSpace ref={userInterface} name="user-interface" depth={depth}>
            <UiLayer z={-10}>
                <Backpack/>

                <UiLayer z={10}>
                    <BottomMenu/>
                </UiLayer>

                {/* Layer -10 + 1 (<layer "9">) is used for intersection */}
                <UiLayer z={1}>
                    <Plane ref={intersectionPlane} name='intersection-plane' visible={false} args={[uiUnits(40), uiUnits(40), 1]}></Plane>
                </UiLayer>
            </UiLayer>
        </ScreenSpace>
    )
})

export default UserInterface