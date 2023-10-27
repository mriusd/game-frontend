import React from "react"
import { useThree, useFrame } from "@react-three/fiber"
import { useSettings } from "./useSettings"
export const DPRLimiter = () => {
    const clipDPR = useSettings(state => state.clipDPR)
    const setDpr = useThree((state) => state.setDpr)
    const performance = useThree((state) => state.performance)
    const gl = useThree(state => state.gl)

    React.useEffect(() => { gl.setPixelRatio(.1); setDpr(.1); console.log(clipDPR) }, [clipDPR])
    React.useEffect(() => {console.log('performance', performance)}, [performance])
    return null
}