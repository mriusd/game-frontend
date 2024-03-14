import type { ModelLoadItem } from "interfaces/gltfloader.interface"

import { fighter } from "./fighter"
import { inventory } from "./inventory"
import { npc } from "./npc"
import { shared } from "./shared"
import { decor } from "./decor"
import { fragments } from "./fragments"

import { lorencia } from "./maps/lorencia"

export const models: ModelLoadItem[] = [
    ...fighter,
    ...inventory,
    ...npc,
    ...shared,
    ...decor,
    ...fragments,


    ...lorencia
]