import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { components } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import authConfig from "../auth.config";
import schema from "./schema";

// Better Auth Component
// @ts-expect-error - SlimComponentApi type mismatch between package versions, runtime works fine
export const authComponent = createClient<DataModel, typeof schema>(
  components.betterAuth,
  {
    local: { schema },
    verbose: true,
  }
);

// Better Auth Options
export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
  const siteURL = process.env.SITE_URL!;
  return {
    baseURL: siteURL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: authComponent.adapter(ctx),
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },
    trustedOrigins: [
      siteURL,
      "https://dapper-loris-122.convex.site",
      "https://dapper-loris-122.convex.cloud",
    ],
    session: {
      // Accept session token from custom header (needed for React Native
      // which can't send Cookie headers). Must match the header name in useAuth.ts
      headerName: "x-better-auth-session-token",
      cookieCache: {
        enabled: true,
      },
    },
    plugins: [convex({ authConfig })],
  } satisfies BetterAuthOptions;
};

// For `auth` CLI schema generation
export const options = createAuthOptions({} as GenericCtx<DataModel>);

// Better Auth Instance
export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth(createAuthOptions(ctx));
};
