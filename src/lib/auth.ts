import { polar, checkout, portal, usage, webhooks } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import { polarClient } from "./polar";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";  // ✅ import the schema

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,              // ✅ this is the critical part
    }),

    plugins: [
        polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            use: [
                checkout({
                    products: [
                        {
                            productId: "4a1eb132-41f6-42ff-8fa2-a8f019987bad",
                            slug: "pro" // Custom slug for easy reference in Checkout URL, e.g. /checkout/Nodeabase-Pro
                        }
                    ],
                    successUrl: process.env.POLAR_SUCCESS_URL,
                    authenticatedUsersOnly: true
                }),
                portal(),
            ],
        })
    ],

    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },

    socialProviders: {},
});
