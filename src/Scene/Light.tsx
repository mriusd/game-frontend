const Light = () => {
    const colors = {
        WHITE: 0xFFFFFF
    }
    return (
        <>
            <ambientLight color={colors.WHITE} intensity={0.3} />
            <directionalLight color={colors.WHITE} position={[0, 1, -1]} />
            <directionalLight 
                color={colors.WHITE} 
                position={[0, 1, .8]} 
                castShadow={true}
            />
        </>
    )
}

export default Light