export const subscribeDisableContextMenu = () => {
    document.addEventListener('contextmenu', handleContextMenu);
}
export const unsubscribeDisableContextMenu = () => {
    document.addEventListener('contextmenu', handleContextMenu);
}

const handleContextMenu = (event: PointerEvent) => {
    event.preventDefault()
}