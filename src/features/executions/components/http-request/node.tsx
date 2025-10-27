"use client"

import { Node, NodeProps } from "@xyflow/react"
import { GlobeIcon } from "lucide-react"
import { memo } from "react"
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node"


type HttpResquestNodeData = {
    endpoint?: string;
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
    body?: string;
    [key: string]: unknown;
};

type HttpResquestNodeType = Node<HttpResquestNodeData>;


export const HttpResquestNode = memo((props: NodeProps<HttpResquestNodeType>) => {
    const nodeData = props.data as HttpResquestNodeData;
    const description = nodeData?.endpoint
        ? `${nodeData.method || "GET"}: ${nodeData.endpoint}`
        : "Not configured";

    return (
        <>
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon={GlobeIcon}
                name="HTTP Request"
                description={description}
                onSettings={() => {}}
                ondoubleClick={() => {}}
            />
        </>
    )
})

HttpResquestNode.displayName = "HttpRequestNode";