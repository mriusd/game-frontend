// Used in UserInterface

// <depth> has to be the same as <depth> in UserInterface.tsx
export const depth = .1
// <scale> matched to roughly match coordinate 1 inside the scene
export const scale = .1

export const uiUnits = (number: number) => {
    return number * depth * scale
}

export const fromUiUnits = (number: number) => {
    return number / depth / scale
}