import styles from './Chat.module.scss'
import { useEventCloud } from 'EventCloudContext'

const Chat = () => {
    const { chatLog } = useEventCloud()

    // console.log('chatLog', chatLog)
    return (
        <div className={styles.chat}>
            
        </div>
    )
}

export default Chat