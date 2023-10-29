import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";
import { createRef } from "react";

export interface UsePost {
    lights: any[]
    updateLights: (value: any, action: 'add' | 'remove') => void
    bloomObjects: any[]
    updateBloomObjects: (value: any, action: 'add' | 'remove') => void
}

export const usePost = createWithEqualityFn<UsePost>((set, get) => ({
    lights: [],
    updateLights: (light, action) => {
        if (!light) { return }
        const $this = get()
        const index = $this.lights.findIndex(_ => _.current.uuid === light.uuid)
        if (action === 'add' && index === -1) {
            // @ts-expect-error
            const ref = createRef(); ref.current = light
            set({ lights: [...$this.lights, ref] })
            return
        }
        if (action === 'remove' && index !== -1) {
            const updatedLights = [...$this.lights]
            updatedLights.splice(index, 1)
            set({ lights: updatedLights })
            return
        }
    },
    bloomObjects: [],
    updateBloomObjects: (object, action) => {
        if (!object) { return }
        const $this = get()
        const index = $this.bloomObjects.findIndex(_ => _.current.uuid === object.uuid)
        if (action === 'add' && index === -1) {
            // @ts-expect-error
            const ref = createRef(); ref.current = object
            set({ bloomObjects: [...$this.bloomObjects, ref] })
            return
        }
        if (action === 'remove' && index !== -1) {
            const updatedBloomObjects = [...$this.bloomObjects]
            updatedBloomObjects.splice(index, 1)
            set({ bloomObjects: updatedBloomObjects })
            return
        }
    }
}), shallow)
