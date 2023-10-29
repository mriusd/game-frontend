import React from "react"
import { useTwistingSlash } from "./skills/useTwistingSlash"
import { getIs } from "Scene/utils/utils"
import { usePost } from "Scene/Postprocessing/usePost"

// TODO: Create SkillEffect Manager
// Now we create new SkillEffects instance for every new player on the scene
// For optimization purpose we should find method to prerender all effects
// And then just swap them & use
export const useSkillEffects = () => {
    const twistingSlash = useTwistingSlash({})
    const arrow = useTwistingSlash({color: { r:0, g: 0, b: 800 }})
    const trippleShot = useTwistingSlash({color: { r:0, g: 255, b: 0 }})
    const darkSpirits = useTwistingSlash({color: { r:255, g: 0, b: 0 }})


    // React.useEffect(() => {
    //     setInterval(() => twistingSlash.play(), 500)
    // },[])

    const play = React.useCallback((event: any) => {
        const is = getIs(event.skill.name)
        // console.log('skillName', event.skill.name)
        if (is('malee')) { return }
        if (is('slash')) { twistingSlash.play(); return }
        if (is('arrow')) { arrow.play(); return }
        if (is('tripple', 'shot')) { trippleShot.play(); return }
        if (is('dark', 'spirits')) { darkSpirits.play(); return }
    }, [])
    
    return {
        effects: [twistingSlash.mesh, arrow.mesh, trippleShot.mesh, darkSpirits.mesh],
        play
    }
}