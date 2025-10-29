
import { type NodeProps, Position, useReactFlow } from "@xyflow/react"
import type { LucideIcon } from "lucide-react"
import Image from "next/image"
import { memo, useCallback } from "react"
import { BaseNode, BaseNodeContent } from "../../../components/react-flow/base-node"
import { BaseHandle } from "../../../components/react-flow/base-handle"
import { WorkflowNode } from "../../../components/workflow-node"
import { NodeStatus, NodeStatusIndicator } from "@/components/react-flow/node-status-indicator"


interface BaseTriggerNodeProps extends NodeProps {
    icon: LucideIcon | string;
    name: string;
    description?: string;
    children?: React.ReactNode;
    status?: NodeStatus;
    onSettings?: () => void;
    ondoubleClick?: () => void;
};


export const BaseTriggerNode = memo(
    ({
        id,
        icon: Icon,   // alias
        name,
        description,
        children,
        status = "initial",
        onSettings,
        ondoubleClick
    }: BaseTriggerNodeProps) => {

        const { setNodes, setEdges } = useReactFlow();

        // node delete functionality
        const handleDelete = () => {
            setNodes((currentNodes) => {
                const updatedNodes = currentNodes.filter((node) => node.id !== id);
                return updatedNodes;
            });

            setEdges((currentEdges) => {
                const updatedEdges = currentEdges.filter((edge) => edge.id !== id);
                return updatedEdges;
            });
        }

        return (
            <WorkflowNode
                name={name}
                description={description}
                onDelete={handleDelete}
                onSettings={onSettings}
                showToolbar
            >
                <NodeStatusIndicator
                    status={status}
                    variant="border"
                    className="rounded-l-2xl"
                >
                    <BaseNode status={status} onDoubleClick={ondoubleClick} className="rounded-l-2xl relative group">
                        <BaseNodeContent>
                            {typeof Icon === "string" ? (
                                <Image src={Icon} alt={name} width={16} height={16} />
                            ) : (
                                <Icon className="size-4 text-muted-foreground" />
                            )}
                            {children}
                            {/* only the right handle */}
                            <BaseHandle
                                id={"source-1"}
                                type="source"
                                position={Position.Right}
                            />
                        </BaseNodeContent>
                    </BaseNode>
                </NodeStatusIndicator>
            </WorkflowNode>
        )
    }
)


BaseTriggerNode.displayName = "BaseTriggerNode";