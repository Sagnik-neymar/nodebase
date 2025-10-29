// this shows the use of transactions.
// neon HTTP doesnt support transactions
//use none websocket instead to use transactions.

import { db } from "@/db";
import { connection, node, user, workflow } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { generateSlug } from "random-word-slugs";
import z from "zod";
import { and, desc, eq, getTableColumns, ilike } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { PAGINATION } from "@/config/constants";
import { count } from "drizzle-orm";

import type { Node, Edge } from "@xyflow/react";
import type { NodeTypeValue } from "@/db/schema";



export const workflowsRouter = createTRPCRouter({
    // create a workflow (procedure)
    create: protectedProcedure
        .mutation(async ({ ctx }) => {

            const [createdWorkflow] = await db
                .insert(workflow)
                .values({
                    name: generateSlug(3),
                    userId: ctx.auth.user.id,
                })
                .returning();

            const [initialNode] = await db
                .insert(node)
                .values({
                    name: "INITIAL",
                    type: "INITIAL",
                    position: { x: 0, y: 0 },
                    workflowId: createdWorkflow.id
                })
                .returning();

            return {
                ...createdWorkflow,    // this way output shape remains intact with just an addition of all the node attributes
                initialNode
            };
        }),

    // delete a workflow
    remove: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {

            const [removedWorkflow] = await db
                .delete(workflow)
                .where(and(
                    eq(workflow.id, input.id),
                    eq(workflow.userId, ctx.auth.user.id),
                ))
                .returning();

            if (!removedWorkflow) throw new TRPCError({
                code: "NOT_FOUND",
                message: "workflow not found"
            });

            return removedWorkflow;
        }),

    // update workflow state (save)
    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            nodes: z.array(
                z.object({
                    id: z.string(),
                    type: z.string().nullish(),
                    position: z.object({ x: z.number(), y: z.number() }),
                    data: z.record(z.string(), z.any()).optional()
                })
            ),
            edges: z.array(
                z.object({
                    source: z.string(),
                    target: z.string(),
                    sourceHandle: z.string().nullish(),
                    targetHandle: z.string().nullish(),
                })
            )

        }))
        .mutation(async ({ ctx, input }) => {
            const { id, nodes, edges } = input;

            const [existingWorkflow] = await db
                .select()
                .from(workflow)
                .where(and(
                    eq(workflow.id, input.id),
                    eq(workflow.userId, ctx.auth.user.id)
                ));

            if (!existingWorkflow) throw new TRPCError({
                code: "NOT_FOUND",
                message: "workflow not found"
            });

            // transaction to ensure consistency (convert react-flow nodes to db compatible nodes and connections)
            return await db.transaction(async (tx) => {
                // Delete existing nodes and conections (cascade deletes connections)
                await tx
                    .delete(node)
                    .where(eq(node.workflowId, existingWorkflow.id));

                // create nodes
                await tx
                    .insert(node)
                    .values(
                        nodes.map((n) => ({
                            id: n.id,
                            workflowId: id,
                            name: n.type || "unknown",
                            type: n.type as NodeTypeValue,
                            position: n.position,
                            data: n.data || {},
                        }))
                    )
                    .returning();

                // create connections
                await tx
                    .insert(connection)
                    .values(
                        edges.map((e) => ({
                            workflowId: id,
                            fromNodeId: e.source,
                            toNodeId: e.target,
                            fromOutput: e.sourceHandle || "main",
                            toInput: e.targetHandle || "main",
                        })),
                    )
                    .returning();

                // update timestamps for the workflow
                await tx
                    .update(workflow)
                    .set({ updatedAt: new Date() })
                    .where(eq(workflow.id, existingWorkflow.id))
                    .returning();

                return existingWorkflow;
            });
        }),

    // update name of workflow
    updateName: protectedProcedure
        .input(z.object({ id: z.string(), name: z.string() }))
        .mutation(async ({ ctx, input }) => {

            const [updatedWorkflow] = await db
                .update(workflow)
                .set(input)
                .where(and(
                    eq(workflow.id, input.id),
                    eq(workflow.userId, ctx.auth.user.id)
                ))
                .returning();

            if (!updatedWorkflow) throw new TRPCError({
                code: "NOT_FOUND",
                message: "workflow not found"
            });

            return updatedWorkflow;
        }),

    // fetch a single workflow
    getOne: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {

            const [existingWorkflow] = await db
                .select()
                .from(workflow)
                .where(and(
                    eq(workflow.id, input.id),
                    eq(workflow.userId, ctx.auth.user.id)
                ));

            if (!existingWorkflow) throw new TRPCError({
                code: "NOT_FOUND",
                message: "workflow not found"
            });

            const existingNodes = await db
                .select()
                .from(node)
                .where(eq(node.workflowId, existingWorkflow.id));

            // Transform server nodes to react-flow compatible nodes
            const nodes: Node[] = existingNodes.map((node) => ({
                id: node.id,
                type: node.type,
                position: node.position as { x: number, y: number },
                data: (node.data as Record<string, unknown>)
            }));

            const existingConnections = await db
                .select()
                .from(connection)
                .where(eq(connection.workflowId, existingWorkflow.id));

            // Transform server connections to react-flow compatible connections
            const edges: Edge[] = existingConnections.map((connection) => ({
                id: connection.id,
                source: connection.fromNodeId,
                target: connection.toNodeId,
                sourceHandle: connection.fromOutput,
                targetHandle: connection.toInput
            }));

            return {
                id: existingWorkflow.id,
                name: existingWorkflow.name,
                nodes,
                edges
            };
        }),

    // fetch all workflows of a user
    getMany: protectedProcedure
        .input(
            z.object({
                page: z.number().default(PAGINATION.DEFAULT_PAGE),
                pageSize: z
                    .number()
                    .min(PAGINATION.MIN_PAGE_SIZE)
                    .max(PAGINATION.MAX_PAGE_SIZE)
                    .default(PAGINATION.DEFAULT_PAGE_SIZE),
                search: z.string().default(""),
            })
        )
        .query(async ({ ctx, input }) => {
            const { page, pageSize, search } = input;

            // --- perform both queries in parallel ---
            const [items, totalCountResult] = await Promise.all([
                db
                    .select()
                    .from(workflow)
                    .where(
                        and(
                            eq(workflow.userId, ctx.auth.user.id),
                            search ? ilike(workflow.name, `%${search}%`) : undefined
                        )
                    )
                    .orderBy(desc(workflow.name), desc(workflow.id))
                    .limit(pageSize)
                    .offset((page - 1) * pageSize),

                db
                    .select({ count: count() })
                    .from(workflow)
                    .where(
                        and(
                            eq(workflow.userId, ctx.auth.user.id),
                            search ? ilike(workflow.name, `%${search}%`) : undefined
                        )
                    ),
            ]);

            // --- extract total count safely ---
            const totalCount = Number(totalCountResult[0]?.count ?? 0);

            const totalPages = Math.ceil(totalCount / pageSize);
            const hasNextPage = page < totalPages;
            const hasPreviousPage = page > 1;

            return {
                items,
                totalPages,
                totalCount,
                page,
                pageSize,
                hasNextPage,
                hasPreviousPage,
            };
        }),





})