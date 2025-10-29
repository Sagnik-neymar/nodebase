"use client"

import { Node, NodeProps, useReactFlow } from "@xyflow/react"
import { GlobeIcon } from "lucide-react"
import { memo, useState } from "react"
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node"
import { type FormType, HttpRequestDialog } from "./dialog"


type HttpResquestNodeData = {
    endpoint?: string;
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
    body?: string;
    [key: string]: unknown;
};

type HttpResquestNodeType = Node<HttpResquestNodeData>;


export const HttpResquestNode = memo((props: NodeProps<HttpResquestNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    const { setNodes } = useReactFlow();

    const handleOpenSettings = () => setDialogOpen(true);

    const handleSubmit = (values: FormType) => {
        setNodes((nodes) => nodes.map((node) => {
            if (node.id === props.id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        endpoint: values.endpoint,
                        method: values.method,
                        body: values.body,
                    }
                }
            }
            return node;
        }))
    }

    const nodeData = props.data;
    const description = nodeData?.endpoint
        ? `${nodeData.method || "GET"}: ${nodeData.endpoint}`
        : "Not configured";

    const nodeStatus = "initial";



    return (
        <>
            <HttpRequestDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultEndpoint={nodeData.endpoint}
                defaultMethod={nodeData.method}
                defaultBody={nodeData.body}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon={GlobeIcon}
                name="HTTP Request"
                status={nodeStatus}
                description={description}
                onSettings={handleOpenSettings}
                ondoubleClick={handleOpenSettings}
            />
        </>
    )
})

HttpResquestNode.displayName = "HttpRequestNode";