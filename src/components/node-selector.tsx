"use client"

import { createId } from "@paralleldrive/cuid2";
import { Position, useReactFlow } from "@xyflow/react";
import { GlobeIcon, MousePointerIcon, WebhookIcon } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { nodeType } from "@/db/schema";
import { Separator } from "./ui/separator";


export type NodeTypeOptions = {
    type: (typeof nodeType)[keyof typeof nodeType];
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }> | string;
};

const triggerNodes: NodeTypeOptions[] = [
    {
        type: nodeType.MANUAL_TRIGGER,
        label: "Trigger manually",
        description: "Runs the flow on clicking a button.",
        icon: MousePointerIcon
    },
];



const executionNodes: NodeTypeOptions[] = [
    {
        type: nodeType.HTTP_REQUEST,
        label: "HTTP Request",
        description: "Makes an HTTP request.",
        icon: GlobeIcon
    },
];




interface NodeSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode
}

export function NodeSelector({ open, onOpenChange, children }: NodeSelectorProps) {
    const { setNodes, getNodes, screenToFlowPosition } = useReactFlow();

    const handleNodeSelect = useCallback((selection: NodeTypeOptions) => {
        // checking for an existing manual trigger (only 1 can be addded)
        if (selection.type === nodeType.MANUAL_TRIGGER) {
            const nodes = getNodes();
            const hasManualTrigger = nodes.some(
                (node) => node.type === nodeType.MANUAL_TRIGGER,
            )

            if (hasManualTrigger) {
                toast.error("Only 1 manual trigger is allowed per workflow")
                return;
            }
        }

        // if its the initial node, then we will just replace it in position with the slected node
        setNodes((nodes) => {
            const hasInitialTrigger = nodes.some(
                (node) => node.type === nodeType.INITIAL,
            );

            const centerX = window.innerWidth/2;
            const centerY = window.innerHeight/2;

            // convert screen coords to react flow coords
            const flowPosition = screenToFlowPosition({
                x: centerX + (Math.random() - 0.5)*200,
                y: centerY + (Math.random() - 0.5)*200,
            });

            const newNode = {
                id: createId(),
                data: {},
                position: flowPosition,
                type: selection.type
            };

            if (hasInitialTrigger) {
                return [newNode];    // replacing in the list of nodes instead of appending, since it will the first node replacing the initial node
            }

            return [...nodes, newNode]
        });

        onOpenChange(false);
    }, [setNodes, getNodes, onOpenChange, screenToFlowPosition])

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md overflowy-y-auto">
                <SheetHeader>
                    <SheetTitle>What triggers this workflow?</SheetTitle>
                    <SheetDescription>A trigger is a step that starts your workflow</SheetDescription>
                </SheetHeader>
                <div>
                    {triggerNodes.map((node_type) => {
                        const Icon = node_type.icon;

                        return (
                            <div
                                key={node_type.type}
                                className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary"
                                onClick={() => handleNodeSelect(node_type)}
                            >
                                <div className="flex items-center gap-6 w-full overflow-hidden">
                                    {typeof Icon === "string" ? (
                                        <img src={Icon} alt={node_type.label} className="size-5 object-contain rounded-sm" />
                                    ) : (
                                        <Icon className="size-5" />
                                    )}
                                    <div className="flex flex-col items-start text-left">
                                        <span className="font-medium text-sm ">
                                            {node_type.label}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {node_type.description}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
                <Separator />
                <div>
                    {executionNodes.map((node_type) => {
                        const Icon = node_type.icon;

                        return (
                            <div
                                key={node_type.type}
                                className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary"
                                onClick={() => handleNodeSelect(node_type)}
                            >
                                <div className="flex items-center gap-6 w-full overflow-hidden">
                                    {typeof Icon === "string" ? (
                                        <img src={Icon} alt={node_type.label} className="size-5 object-contain rounded-sm" />
                                    ) : (
                                        <Icon className="size-5" />
                                    )}
                                    <div className="flex flex-col items-start text-left">
                                        <span className="font-medium text-sm ">
                                            {node_type.label}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {node_type.description}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </SheetContent>
        </Sheet>
    )
}