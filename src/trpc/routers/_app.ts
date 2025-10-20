import { z } from 'zod';
import { baseProcedure, createTRPCRouter, protectedProcedure } from '../init';
export const appRouter = createTRPCRouter({
    getUsers: protectedProcedure.query(({ ctx }) => {
        console.log({ userId: ctx.auth.user.id });
    })
});
// export type definition of API
export type AppRouter = typeof appRouter;