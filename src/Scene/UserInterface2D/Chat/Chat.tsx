import styles from './Chat.module.scss'
import ChatMessage from './ChatMessage'
import { useEvents } from 'store/EventStore'


const Chat = () => {
    const chatLog = useEvents(state => state.chatLog)
    return (
        <div className={styles.chat}>
            { chatLog.map((message, i) => <ChatMessage key={i} message={message} />) }
        </div>
    )
}

export default Chat