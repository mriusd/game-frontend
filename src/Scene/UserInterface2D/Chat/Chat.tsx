import styles from './Chat.module.scss'
import { useEventCloud } from 'store/EventCloudContext'
import ChatMessage from './ChatMessage'


const Chat = () => {
    const { chatLog } = useEventCloud()
    return (
        <div className={styles.chat}>
            { chatLog.map((message, i) => <ChatMessage key={i} message={message} />) }
        </div>
    )
}

export default Chat