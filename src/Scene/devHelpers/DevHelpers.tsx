import { ShowOccupiedCoords } from "./ShowOccupiedCoords"
import { useCore } from "Scene/useCore"
export const DevHelpers = () => {
    const dev = useCore(state => state.devMode)

    if (!dev) { return null }

    return (
        <group name="dev-helpers">
            <ShowOccupiedCoords/>
        </group>
    )
}