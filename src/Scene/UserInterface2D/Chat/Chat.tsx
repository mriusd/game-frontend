import styles from './Chat.module.scss'
import ChatMessage from './ChatMessage'
import { useCloud } from 'EventCloud/useCloud'


const Chat = () => {
    const chatLog = useCloud(state => state.chatLog)
    return (
        <div className={styles.chat}>
            { chatLog.map((message, i) => <ChatMessage key={i} message={message} />) }
        </div>
    )
}

export default Chat