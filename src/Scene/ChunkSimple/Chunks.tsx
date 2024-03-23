
import { memo } from "react"
import { useTexture } from "@react-three/drei"
import { useCore } from "Scene/useCore"
import { Plane } from "@react-three/drei"


const Chunks = memo(function Chunks({}) {
    const [ worldSize, chunkSize, location ] = useCore(state => [state.worldSize, state.chunkSize, state.location])


    const mapTextures = useTexture({ map: `/worlds/${location.toLowerCase()}/map.png` })

    return (
        <>
            <Plane receiveShadow args={[chunkSize, chunkSize]} rotation={[Math.PI / -2, 0, 0]} position={[0,-0.1,0]}>
                <meshStandardMaterial color={'white'} {...mapTextures} depthWrite={false} />
            </Plane>
        </>
    )
})


export default Chunks