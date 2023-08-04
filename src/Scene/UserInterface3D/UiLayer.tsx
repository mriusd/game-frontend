import { uiUnits } from "Scene/utils/uiUnits"

export type UizType = 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100 | -10 | -20 | -30 | -40 | -50 | -60 | -70 | -80 | -90 | -100

interface Props {
    z: UizType
    children?: any 
}
const UiLayer = ({ z, children }: Props) => {
    return (
        <group name="ui-layer" position={[0, 0, uiUnits(z)]} userData={{ z }}>
            { children }
        </group>
    )
}

export default UiLayer