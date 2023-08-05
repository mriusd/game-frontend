import styles from './CommandLine.module.scss'

const CommandsPlaceholder = () => {
    return (
        <div className={styles.CommandsPlaceholder}>
            <pre>{`
Commandments
                
FOR PLAYERS
/move <map name> - teleport map 
/trade - initiate trade (point at other player)
/party - join/initiate party (point at other player)
<text> - local chat
~<text> - party chat
@<text> - guild chat

FOR DEVS
/slide <x: int> <z: int> - move char to coords
/spawn <npcName: string> - spawn an NPC (eg: spider, bull)
/make <itemName: string> [+<lvl>] [+<add points>] [l] [exc]  - make item (eg: /make brass armour +9 +8 l exc  | /make nodachi)
/makeset <setName: string> [+<lvl>] - make item (eg: /makeset legendary +15)  
            `}</pre>
        </div>
    )
}

export default CommandsPlaceholder