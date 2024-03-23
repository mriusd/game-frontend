import { ThreeEvent } from "@react-three/fiber"

export const getSlotModel = (e: ThreeEvent<PointerEvent>) => {
    const name = 'slot-model'
    const model = e.object.parent.children.find(object => object.name === name)
    return model || null
}