export const moveInWorld = ({
    speed = 1,
    onStart = () => {}, 
    onChange = (state) => {},
    onComplete = () => {},
}) => {
    onStart()
    Tween.to(currentWorldPosition, nextWorldPosition,
        {
            duration: 200 / speed,
            onChange(state) {
                onChange(state)
            },
            onComplete() {
                onComplete()
            },
        }
    )
}