import { Plane, Text } from "@react-three/drei"
import { setCursorPointer } from "Scene/utils/setCursorPointer"
import { useSceneContext } from "store/SceneContext"


const Button = ({ children, name, fontSize = 16, color = 'black', onClick, args = [100, 30], ...props }) => {
    const { html, setHoveredItems } = useSceneContext()
    
    const handlePointerEnter = () => {
        setCursorPointer(html, true)
        // Just for test, cuz its wrong to hoveredItems provide this way
        // I think ill change this after ill move to another store
        // @ts-expect-error
        setHoveredItems({ id: name }, 'add')
    }
    const handlePointerLeave = () => {
        setCursorPointer(html, false)
        // Just for test
        // @ts-expect-error
        setHoveredItems({ id: name }, 'remove')
    }
    
    return (
        <group {...props} name={"button_"+name}>
            <Plane 
                // @ts-expect-error
                args={args} 
                onClick={onClick}
                onPointerEnter={handlePointerEnter}
                onPointerLeave={handlePointerLeave}
            >
            </Plane>
            <Text
                fontSize={fontSize}
                color={color}
            >
                { children }
            </Text>
        </group>
    )
}

export default Button