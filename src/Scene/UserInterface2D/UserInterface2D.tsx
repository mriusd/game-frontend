import styles from './UserInterface2D.module.scss'

import Chat from './Chat/Chat'
import CommandLine from './CommandLine/CommandLine'

const UserInterface2D = () => {
    return (
        <div className={styles.UserInterface2D}>
            <Chat/>
            <CommandLine/>
        </div>
    )
}

export default UserInterface2D