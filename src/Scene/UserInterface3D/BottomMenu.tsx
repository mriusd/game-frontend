import { Flex, Box } from "@react-three/flex"
import Button from "./Button"
import { useBackpack } from "Scene/UserInterface3D/Backpack/useBackpack" 
import { Plane, useTexture } from "@react-three/drei"
import { useCallback, useEffect, useRef } from "react"
import { ThreeEvent } from "@react-three/fiber"
import { useCloud } from "EventCloud/useCloud"

const BottomMenu = () => {
    const requestVault = useCloud(state => state.requestVault)
    const requestShop = useCloud(state => state.requestShop)
    const [toggleBackpack, openBackpack] = useBackpack(state => [state.toggle, state.open])
    const [toggleVault, openVault, closeVault] = useBackpack(state => [state.toggleVault, state.openVault, state.closeVault])
    const [toggleShop, openShop, closeShop] = useBackpack(state => [state.toggleShop, state.openShop, state.closeShop])

    // Request Vault on btn Mount to already have data
    useEffect(() => {requestVault(); requestShop()}, [])
    const handleVault = useCallback(() => {
        const $state = useBackpack.getState()
        if (!$state.isOpenedVault) {
            requestVault()
        }
        if ($state.isOpened && !$state.isOpenedVault) {
            openVault()
            closeShop()
            return
        }

        toggleVault()
        toggleBackpack()
        closeShop()
    }, [requestVault, toggleVault])
    const handleShop = useCallback(() => {
        const $state = useBackpack.getState()
        if (!$state.isOpenedShop) {
            requestShop()
        }
        if ($state.isOpened && !$state.isOpenedShop) {
            openShop()
            closeVault()
            return
        }
        toggleShop()
        toggleBackpack()
        closeVault()
    }, [requestShop])

    const [map, mapHover] = useTexture(['/assets/backpack-icon.png', '/assets/backpack-icon-hover.png'])
    const [map2, mapHover2] = useTexture(['/assets/vault-icon.png', '/assets/vault-icon-hover.png'])
    const [map3, mapHover3] = useTexture(['/assets/shop-icon.png', '/assets/shop-icon-hover.png'])

    const onPointerEnter = (e: ThreeEvent<PointerEvent>) => {
        // @ts-expect-error
        e.object.material.map = e.object.userData.mapHover
    }
    const onPointerLeave = (e: ThreeEvent<PointerEvent>) => {
        // @ts-expect-error
        e.object.material.map = e.object.userData.map
    }
    return (
        <Flex position={[-80, 0, 0]} flexDir="row" name="bottom-menu" size={[10, 0, 0]}>
            {/* <Box>
                <Button name="backpack-button" onClick={toggleBackpack} position={[0, -350, 0]} args={[100, 40]}>Backpack</Button>
            </Box> */}
            <Box>
                <Button name="backpack-button" onClick={handleShop} position={[0, -350, 0]}>
                    <Plane userData={{mapHover: mapHover3, map: map3}} onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave} args={[80, 80]}>
                        <meshBasicMaterial map={map3} transparent={true} />
                    </Plane>
                </Button>
            </Box>
            <Box>
                <Button name="backpack-button" onClick={toggleBackpack} position={[0, -350, 0]}>
                    <Plane userData={{mapHover: mapHover, map: map}} onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave} args={[80, 80]}>
                        <meshBasicMaterial map={map} transparent={true} />
                    </Plane>
                </Button>
            </Box>
            <Box>
                <Button name="backpack-button" onClick={handleVault} position={[0, -350, 0]}>
                    <Plane userData={{mapHover: mapHover2, map: map2}} onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave} args={[80, 80]}>
                        <meshBasicMaterial map={map2} transparent={true} />
                    </Plane>
                </Button>
            </Box>
        </Flex>
    )
}

export default BottomMenu