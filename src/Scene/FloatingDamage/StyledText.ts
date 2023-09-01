import { useMemo } from 'react'
import {Text} from 'troika-three-text'


export const StyledText = () => {
    const text = new Text()

    text.text = 'Hello world!'
    text.fontSize = 0.2
    text.position.z = -2
    text.color = 0x9966FF

}