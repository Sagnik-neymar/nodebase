import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";  // ✅ import the schema

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,              // ✅ this is the critical part
    }),

    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },

    socialProviders: {},
});
