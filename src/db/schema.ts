import { pgTable, text, timestamp, boolean, pgEnum, json, jsonb } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid"

export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
});

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
});

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
});

export const workflow = pgTable("workflow", {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    name: text("name").notNull(),
    userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
})



///////////////////////////////////////////////////// React flow stuff //////////////////////////////////////////


export const nodeTypeEnum = pgEnum("node_type", [
    "INITIAL",
    "MANUAL_TRIGGER",
    "HTTP_REQUEST"
])

export const nodeType = {
    INITIAL: "INITIAL",
    MANUAL_TRIGGER: "MANUAL_TRIGGER",
    HTTP_REQUEST: "HTTP_REQUEST",
} as const;


// reperesents Nodes
export const node = pgTable("node", {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    workflowId: text("workflowId").notNull().references(() => workflow.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: nodeTypeEnum("type").notNull(),   // maybe needs fixing
    position: json("position").notNull(),
    data: json("data").default("{}"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
})


// represents Edges
export const connection = pgTable("connection", {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    workflowId: text("workflowId").notNull().references(() => workflow.id, { onDelete: "cascade" }),

    fromNodeId: text("fromNodeId").notNull().references(() => node.id, { onDelete: "cascade" }).unique(),
    fromNode: text("fromNode").notNull().references(() => node.id, { onDelete: "cascade" }),
    toNodeId: text("toNodeId").notNull().references(() => node.id, { onDelete: "cascade" }).unique(),
    toNode: text("toNode").notNull().references(() => node.id, { onDelete: "cascade" }),

    fromOutput: text("fromOutput").default("main").unique(),
    toInput: text("toInput").default("main").unique(),
    
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
})