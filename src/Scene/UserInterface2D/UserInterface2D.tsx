import styles from './UserInterface2D.module.scss'

import Chat from './Chat/Chat'
import CommandLine from './CommandLine/CommandLine'
import Stats from './Stats/Stats'
import Skills from './Skills/Skills'

import OpenButton from 'Auth/OpenButton'

const UserInterface2D = () => {
    return (
        <div className={styles.UserInterface2D}>
            <Chat/>
            <Stats/>
            <Skills/>
            <CommandLine/>

            {/* Auth Modal */}
            <OpenButton/>
        </div>
    )
}

export default UserInterface2D