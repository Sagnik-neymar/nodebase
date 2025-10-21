import { z } from 'zod';
import { baseProcedure, createTRPCRouter, protectedProcedure } from '../init';
import { inngest } from '@/inngest/client';
export const appRouter = createTRPCRouter({
    // find all workflows of the user
    getWorkflows: protectedProcedure.query(({ ctx }) => {
        // return workflows
    }),

    // create a workflow
    createWorkflow: protectedProcedure.mutation(({ ctx }) => {
        // create workflow logic
    }),

    testAi: baseProcedure.mutation(async () => {
        await inngest.send({
            name: "execute-ai"
        });

        return { success: true, message: "job queued" }
    })

});


export type AppRouter = typeof appRouter;