export const setCursorPointer = (html: HTMLElement | null, boolean: boolean = true) => {
    if (html) {
        if (boolean) {
            html.style.cursor = 'pointer'
        } else {
            html.style.removeProperty('cursor')
        }
    }
}