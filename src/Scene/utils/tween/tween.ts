/**
 * @author Den Kravchu <denkravchu@gmail.com>
 * @fileoverview Light optimised tween 2022
 * @version 1.0.0
 */
import Ease, { Lerp } from "./easing"
export interface TweenState {
    value: any
    state: {
        hole: number
        nothole: number
    }
}

const Tween = {
    to(from: any, to: any, { duration = 1000, renderDelay = 0, delay = 0, onChange = (context: TweenState) => {}, onComplete = () => {}, ease = Ease.Line }) {
        const MainStartTime = performance.now()
        let startTime = MainStartTime
        let complete = false
        const saveDelay = delay
        requestAnimationFrame(function render( time ) {
            const t = {
                hole: (time - MainStartTime) / ( duration + saveDelay ),
                nothole: (time - ( MainStartTime + saveDelay )) / duration
            }
            let value = {}
            complete = (t.hole >= 1.0)
            if ( time - startTime > renderDelay && time - startTime > delay ) {
                delay = 0
                startTime = performance.now()
                
                if (typeof from === 'number') {
                    value = Lerp(from, to, ease(t.nothole))
                } else {
                    deepObject(from, to, value, t.nothole)
                }
                onChange({ value, state: t })
            }
            // @ts-expect-error
            if ( complete ) { onComplete({ value, state: t }) }
            if ( !complete ) { requestAnimationFrame(render) }
        })

        function deepObject(from: any, to: any, value: any, t: number) {
            Object.keys(from).forEach(key => {
                if (typeof from[key] === 'number') {
                    value[key] = Lerp(from[key], to[key], ease(t))
                } else {
                    value[key] = {}
                    deepObject(from[key], to[key], value[key], t)
                }
            })
        } 
    },
}

export default Tween