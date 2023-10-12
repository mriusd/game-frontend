import { useCore } from "Scene/useCore"
import { useUi } from "./useUI"


const Button = ({ children, name, fontSize = 16, color = 'black', onClick, args = [100, 30], ...props }) => {
    
    const [setHoveredItems] = useCore(state => [state.setHoveredItems])
    const setCursor = useUi(state => state.setCursor)
    
    const handlePointerEnter = () => {
        setCursor('pointer')
        // Just for test, cuz its wrong to hoveredItems provide this way
        // I think ill change this after ill move to another store
        // @ts-expect-error
        setHoveredItems({ id: name }, 'add')
    }
    const handlePointerLeave = () => {
        setCursor('default')
        // Just for test
        // @ts-expect-error
        setHoveredItems({ id: name }, 'remove')
    }
    
    return (
        <group 
            {...props} 
            name={"button_"+name}
            onClick={onClick}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
        >
            { children }
        </group>
    )
}

export default Button