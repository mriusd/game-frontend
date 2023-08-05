import styles from './Chat.module.scss'
import { useEventCloud } from 'store/EventCloudContext'

const Chat = () => {
    const { chatLog } = useEventCloud()

    // console.log('chatLog', chatLog)
    return (
        <div className={styles.chat}>
            { chatLog.map((_, i) => (<p key={i}>Hello</p>)) }
        </div>
    )
}

export default Chat