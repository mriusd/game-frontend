import { uiUnits } from "Scene/utils/uiUnits"

export type UizType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | -1 | -2 | -3 | -4 | -5 | -6 | -7 | -8 | -9 | -10

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