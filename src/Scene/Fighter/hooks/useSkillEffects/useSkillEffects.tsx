import React from "react"
import { useTwistingSlash } from "./skills/useTwistingSlash"
import { getIs } from "Scene/utils/utils"
import { usePost } from "Scene/Postprocessing/usePost"

// TODO: Create SkillEffect Manager
// Now we create new SkillEffects instance for every new player on the scene
// For optimization purpose we should find method to prerender all effects
// And then just swap them & use
export const useSkillEffects = () => {
    const twistingSlash = useTwistingSlash()
    // React.useEffect(() => {
    //     setInterval(() => twistingSlash.play(), 500)
    // },[])

    const play = React.useCallback((event: any) => {
        const is = getIs(event.skill.name)
        console.log('skillName', event.skill.name)
        if (is('malee')) { return }
        if (is('slash')) { twistingSlash.play(); return }
        if (is('arrow')) { /* Effect here */; return }
        if (is('tripple', 'shot')) { /* Effect here */; return }
        if (is('dark', 'spirits')) { /* Effect here */; return }
    }, [])
    
    return {
        effects: [twistingSlash.mesh],
        play
    }
}