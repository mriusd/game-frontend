import { memo } from "react"
import Npc from "./Npc"
import { useNpc } from "./useNpc"

const NpcList = memo(function NpcList() {
    const list = useNpc(state => state.npcList)
    return <>{ list.map(npc => <Npc key={npc?.id} npc={npc} />) }</>
})

export default NpcList