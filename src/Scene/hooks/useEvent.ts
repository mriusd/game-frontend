import type { Fighter } from "interfaces/fighter.interface"

import { useEffect } from "react"

import { useCloud } from "EventCloud/useCloud"

export const useEvent = (fighter: Fighter, eventType: 'skill' | 'damage', callback: (event: any, removeEvent: any) => void) => {
    const [ events, removeEvent ] = useCloud(state => [state.events, state.removeEvent])
    useEffect(() => {
        const selectedEvents = events.filter((event: any) => event.type === eventType)
        selectedEvents.forEach((skillEvent: any)  => {
            if (skillEvent.fighter?.id === fighter.id) {
                callback && callback(skillEvent, removeEvent)
            }
        })
    }, [events])
}