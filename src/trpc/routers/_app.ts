import { z } from 'zod';
import { baseProcedure, createTRPCRouter, protectedProcedure } from '../init';
export const appRouter = createTRPCRouter({
    // find all workflows of the user
    getWorkflows: protectedProcedure.query(({ ctx }) => {
        // return workflows
    }),

    // create a workflow
    createWorkflow: protectedProcedure.mutation(({ ctx }) => {
        // create workflow logic
    })

});
// export type definition of API
export type AppRouter = typeof appRouter;