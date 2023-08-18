import { memo } from "react"
import Npc from "./Npc"
import { useNpc } from "./useNpc"

const NpcList = memo(function NpcList() {
    const npcList = useNpc(state => state.npcList)
    return <>{ npcList.map(npc => <Npc key={npc?.id} npc={npc} />) }</>
})

export default NpcList