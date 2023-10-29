import React from "react"
import * as THREE from 'three'
import { useThree } from "@react-three/fiber"
import { useSettings } from "./useSettings"

const FPSLimiter = ({ children }) => {
    const invalidate = useThree(state => state.invalidate)
    const clock = React.useMemo(() => new THREE.Clock(), [])
    const fps = useSettings(state => state.clipFps)

    React.useEffect(() => {
        let rq = null
        let delta = 0
        const interval = 1/fps
        const update = () => {
            rq = requestAnimationFrame(update)
            delta += clock.getDelta()

            if (delta > interval) {
                invalidate()
                delta = delta % interval
            }
        }

        update()
        return () => cancelAnimationFrame(rq)
    }, [fps])

    return <>{children}</>
}

export default FPSLimiter