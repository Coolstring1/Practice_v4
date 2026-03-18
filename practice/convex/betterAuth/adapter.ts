import { createApi } from "@convex-dev/better-auth";
import { createAuthOptions } from "./auth";
import schema from "./schema";

const api = createApi(schema, createAuthOptions);

// Export under both "api" and "adapter" namespaces
// The convexAdapter expects functions at adapter.create, adapter.findOne, etc.
export const {
  create,
  findOne,
  findMany,
  updateOne,
  updateMany,
  deleteOne,
  deleteMany,
} = api;

// Re-export as an adapter object for the component resolver
export const adapter = api;
