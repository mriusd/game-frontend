import { Flex, Box } from "@react-three/flex"
import Button from "./Button"
import { useBackpack } from "Scene/UserInterface3D/Backpack/useBackpack" 
import { Plane, useTexture } from "@react-three/drei"
import { useCallback, useEffect, useRef } from "react"
import { ThreeEvent } from "@react-three/fiber"
import { useCloud } from "EventCloud/useCloud"

const BottomMenu = () => {
    const requestVault = useCloud(state => state.requestVault)
    const [toggleBackpack, openBackpack] = useBackpack(state => [state.toggle, state.open])
    const [toggleVault, openVault] = useBackpack(state => [state.toggleVault, state.openVault])
    // Request Vault on btn Mount to already have data
    useEffect(() => {requestVault()}, [])
    const handleVault = useCallback(() => {
        const $state = useBackpack.getState()
        if (!$state.isOpenedVault) {
            requestVault()
        }
        if ($state.isOpened && !$state.isOpenedVault) {
            openVault()
            return
        }

        toggleVault()
        toggleBackpack()
    }, [requestVault, toggleVault])

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
                <Button name="backpack-button" onClick={toggleBackpack} position={[0, -350, 0]}>
                    <Plane onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave} args={[80, 80]}>
                        <meshBasicMaterial map={map} transparent={true} />
                    </Plane>
                </Button>
            </Box>
            <Box>
                <Button name="backpack-button" onClick={handleVault} position={[0, -350, 0]}>
                    <Plane onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave} args={[80, 80]}>
                        <meshBasicMaterial map={map} transparent={true} />
                    </Plane>
                </Button>
            </Box>
        </Flex>
    )
}

export default BottomMenu