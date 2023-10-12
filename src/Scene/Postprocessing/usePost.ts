import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

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
        const index = $this.lights.findIndex(_ => _.uuid === light.uuid)
        if (action === 'add' && index === -1) {
            set({ lights: [...$this.lights, light] })
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
        const index = $this.bloomObjects.findIndex(_ => _.uuid === object.uuid)
        if (action === 'add' && index === -1) {
            set({ bloomObjects: [...$this.bloomObjects, object] })
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
