import { query } from "./_generated/server";

export const checkUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("user").collect();
    const appUsers = await ctx.db.query("users").collect();
    const sessions = await ctx.db.query("session").collect();
    const accounts = await ctx.db.query("account").collect();
    return {
      betterAuthUsers: users.length,
      appUsers: appUsers.length,
      sessions: sessions.length,
      accounts: accounts.length,
      userEmails: users.map(u => u.email),
    };
  },
});
