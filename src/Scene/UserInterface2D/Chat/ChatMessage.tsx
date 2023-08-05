import { useMemo } from 'react'
import styles from './Chat.module.scss'

interface Props { 
    message: {
        author: string
        msg: string
        msgType: 'local' | 'error'
    } 
}
const ChatMessage = ({ message }: Props) => {
    const color = useMemo(() => {
        if (message.msgType === 'error') {
            return 'red'
        }
        return 'rgba(255, 255, 255, .5)'
    }, [message])

    return (
        <div className={styles.message} style={{ color }}>{ message.author }: { message.msg }</div>
    )
}

export default ChatMessage