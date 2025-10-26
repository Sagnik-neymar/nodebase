import { InitialNode } from "@/components/initial-node";
import { nodeType } from "@/db/schema";
import type { NodeTypes } from "@xyflow/react";




export const nodeComponents = {
    [nodeType.INITIAL]: InitialNode,
} as const satisfies NodeTypes;


export type RegisteredNodeType = keyof typeof nodeComponents;

