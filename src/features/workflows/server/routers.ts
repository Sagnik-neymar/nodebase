import { db } from "@/db";
import { user, workflow } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { generateSlug } from "random-word-slugs";
import z from "zod";
import { and, desc, eq, getTableColumns, ilike } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { PAGINATION } from "@/config/constants";
import { count } from "drizzle-orm";



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
                    .select(getTableColumns(workflow))
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