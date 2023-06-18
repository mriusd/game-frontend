// Used in UserInterface
export const uiUnits = (number: number) => {
    // <depth> has to be the same as <depth> in UserInterface.tsx
    const depth = .1
    // <scale> matched to roughly match coordinate 1 inside the scene
    const scale = .1
    return number * depth * scale
}