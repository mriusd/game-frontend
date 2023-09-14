import React from "react"
import { useOtherFighter } from "./useOtherFighter"

import OtherFighter from "./OtherFighter"

const OtherFighterList = React.memo(function OtherFighterList() {
    const otherFighterList = useOtherFighter(state => state.otherFighterList)
    return <>{ otherFighterList.map(fighter => <OtherFighter key={fighter?.id} fighter={fighter} />) }</>
})

export default OtherFighterList