import { useTexture } from "@react-three/drei"
import { useMemo } from "react"
import { useCore } from "Scene/useCore"

export const useLocationTextures = () => {
    const [location, worldSize, chunkSize, chunksPerAxis] = useCore(state => [state.location, state.worldSize, state.chunkSize, state.chunksPerAxis])
    const textureUrls = useMemo(() => {
        const data = {}
        for (let i = 0; i < chunksPerAxis + 1; i++) {
            for (let j = 0; j < chunksPerAxis + 1; j++) {
                // data[`${i}_${j}`] = {
                //     map: `worlds/${location.toLowerCase()}/map/${i}_${j}.png`,
                //     // normalMap: `worlds/${location.toLowerCase()}/normalMap/${i}_${j}.png`,
                //     // roughnessMap: `worlds/${location.toLowerCase()}/roughnessMap/${i}_${j}.png`,
                //     // metalnessMap: `worlds/${location.toLowerCase()}/metalnessMap/${i}_${j}.png`,
                // }
                // TODO: Rewrite useTetxure for our needs
                data[`${i}_${j}/map`] = `worlds/${location.toLowerCase()}/map/${i}_${j}.png`
                data[`${i}_${j}/normalMap`] = `worlds/${location.toLowerCase()}/normalMap/${i}_${j}.png`
                data[`${i}_${j}/roughnessMap`] = `worlds/${location.toLowerCase()}/roughnessMap/${i}_${j}.png`
                data[`${i}_${j}/metalnessMap`] = `worlds/${location.toLowerCase()}/metalnessMap/${i}_${j}.png`
                data[`${i}_${j}/displacementMap`] = `worlds/${location.toLowerCase()}/heightMap/${i}_${j}.png`
            }
        }
        return data
    }, [location, worldSize, chunkSize, chunksPerAxis])
    const textures = useTexture(textureUrls)
    return textures
}