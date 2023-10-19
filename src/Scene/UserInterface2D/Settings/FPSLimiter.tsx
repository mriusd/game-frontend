// @ts-nocheck

import React from "react"
import { useFrame } from "@react-three/fiber"
import { useThree } from "@react-three/fiber"

function FPSLimiter({ fps, children }) {
    const set = useThree((state) => state.set)
    const get = useThree((state) => state.get)
    const advance = useThree((state) => state.advance)
    const frameloop = useThree((state) => state.frameloop)

    React.useLayoutEffect(() => {
        const initFrameloop = get().frameloop
        return () => {
            set({ frameloop: initFrameloop })
        }
    }, [])

    useFrame((state) => {
        if (state.get().blocked) return
        state.set({ blocked: true })

        setTimeout(() => {
            state.set({ blocked: false })

            state.advance()
        }, Math.max(0, 1000 / fps - state.clock.getDelta()))
    })

    React.useEffect(() => {
        if (frameloop !== 'never') {
            set({ frameloop: 'never' })
            advance()
        }
    }, [frameloop])

    return <>{children}</>
}

export default FPSLimiter