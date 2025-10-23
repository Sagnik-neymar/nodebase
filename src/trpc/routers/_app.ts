import { db } from '@/db';
import { baseProcedure, createTRPCRouter, protectedProcedure } from '../init';
import { workflowsRouter } from '@/features/workflows/server/routers';
import { eq, getTableColumns } from 'drizzle-orm';
import { user } from '@/db/schema';



export const appRouter = createTRPCRouter({
    workflows: workflowsRouter,

    getUsers: protectedProcedure
        .query(async ({ ctx }) => {
            const [existingUser] = await db
                .select(getTableColumns(user))
                .from(user)
                .where(eq(user.id, ctx.auth.user.id));

            return existingUser;
        })
});


export type AppRouter = typeof appRouter;