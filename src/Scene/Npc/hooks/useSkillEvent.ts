import { Fighter } from "interfaces/fighter.interface"
import { useEffect } from "react"
import { useEventCloud } from "store/EventCloudContext"

export const useSkillEvent = (npc: Fighter, callback: (event: any, removeEvent: any) => void) => {
    const { events, removeEvent } = useEventCloud()
    useEffect(() => {
        const skillEvents = events.filter((event: any) => event.type === 'skill')
        skillEvents.forEach((skillEvent: any)  => {
            if (skillEvent.fighter?.id === npc.id) {
                callback && callback(skillEvent, removeEvent)
            }
        })
    }, [events])
}