import { db } from "@/db";
import { user, workflow } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { generateSlug } from "random-word-slugs";
import z from "zod";
import { and, eq, getTableColumns } from "drizzle-orm";
import { TRPCError } from "@trpc/server";



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

            return createdWorkflow;
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

    // update name of workflow
    updateName: protectedProcedure
        .input(z.object({ id: z.string(), name: z.string() }))
        .mutation(async ({ ctx, input }) => {

            const [updatedWorkflow] = await db
                .update(workflow)
                .set(input)
                .where(and(
                    eq(workflow.id, input.id),
                    eq(user.id, ctx.auth.user.id)
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
                .select(getTableColumns(workflow))
                .from(workflow)
                .where(and(
                    eq(workflow.id, input.id),
                    eq(workflow.userId, ctx.auth.user.id)
                ));

            if (!existingWorkflow) throw new TRPCError({
                code: "NOT_FOUND",
                message: "workflow not found"
            });

            return existingWorkflow;
        }),

    // fetch all workflows of a user
    getMany: protectedProcedure
        .query(async ({ ctx }) => {

            const data = await db
                .select(getTableColumns(workflow))
                .from(workflow)
                .where(eq(workflow.userId, ctx.auth.user.id));


            return data;
        })


})