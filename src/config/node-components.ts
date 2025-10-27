import { InitialNode } from "@/components/initial-node";
import { nodeType } from "@/db/schema";
import { HttpResquestNode } from "@/features/executions/components/http-request/node";
import type { NodeTypes } from "@xyflow/react";
import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/node";




export const nodeComponents = {
    [nodeType.INITIAL]: InitialNode,
    [nodeType.HTTP_REQUEST]: HttpResquestNode,
    [nodeType.MANUAL_TRIGGER]: ManualTriggerNode,
} as const satisfies NodeTypes;


export type RegisteredNodeType = keyof typeof nodeComponents;

