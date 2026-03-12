# Auth Migration Implementation Plan

**Branch:** `feat/better-auth-integration`
**Created:** 2026-03-11

---

## Research Summary

### Better Auth + Convex Integration

Better Auth has a **first-party Convex integration** via `@convex-dev/better-auth`. This is maintained by Convex and simplifies the setup significantly.

**Key Components:**
1. **Backend (Convex):** Better Auth runs as a Convex component
2. **Database:** Uses Convex's built-in database
3. **HTTP Routes:** Auth endpoints are served from Convex's HTTP router
4. **Client:** React client with Convex integration

### Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Expo App      │────▶│   Convex HTTP   │────▶│  Better Auth    │
│   (Client)      │     │   (Backend)     │     │  (Component)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                                                │
        │                                                ▼
        │                                       ┌─────────────────┐
        └──────────────────────────────────────▶│  Convex DB      │
                                                │  (Users, etc)   │
                                                └─────────────────┘
```

### Google OAuth Flow for Mobile

1. User taps "Sign in with Google"
2. App opens Google OAuth via `expo-web-browser`
3. User authenticates with Google
4. Google redirects to callback URL (Convex HTTP endpoint)
5. Better Auth creates session, redirects back to app via deep link
6. App stores session token

---

## Implementation Phases

### Phase 1: Dependencies & Setup (30 min)

**Tasks:**
1. Install Better Auth packages:
   ```bash
   npm install better-auth@1.4.9 --save-exact
   npm install @convex-dev/better-auth
   ```

2. Remove Convex Auth:
   ```bash
   npm uninstall @convex-dev/auth
   ```

3. Generate auth secret:
   ```bash
   npx convex env set BETTER_AUTH_SECRET $(openssl rand -base64 32)
   ```

**Files to Modify:**
- `practice/package.json`
- Convex environment variables

---

### Phase 2: Convex Backend Setup (1-2 hours)

**Tasks:**
1. Create `convex/betterAuth/convex.config.ts` (component definition)
2. Create `convex/convex.config.ts` (app definition)
3. Create `convex/betterAuth/auth.ts` (Better Auth instance)
4. Update `convex/auth.config.ts` to use Better Auth provider
5. Generate schema: `npx auth generate`
6. Create `convex/betterAuth/api.ts` (adapter functions)
7. Update `convex/http.ts` to register auth routes

**Key Configuration:**
```typescript
// convex/betterAuth/auth.ts
import { betterAuth } from "better-auth";
import { convex } from "@convex-dev/better-auth/plugins";

export const createAuthOptions = (ctx) => ({
  appName: "Practice",
  baseURL: process.env.SITE_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: authComponent.adapter(ctx),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [convex({ authConfig })],
});
```

---

### Phase 3: Google OAuth Setup (30 min)

**Tasks:**
1. Check existing GCP project (`lobter`) for OAuth credentials
2. Create new OAuth 2.0 client ID if needed
3. Configure authorized redirect URIs:
   - Development: `https://dapper-loris-122.convex.site/api/auth/callback/google`
   - Production: (TBD - production Convex URL)
4. Set environment variables in Convex:
   ```bash
   npx convex env set GOOGLE_CLIENT_ID "..."
   npx convex env set GOOGLE_CLIENT_SECRET "..."
   npx convex env set SITE_URL "https://dapper-loris-122.convex.site"
   ```

**GCP Console Steps:**
1. Go to APIs & Services → Credentials
2. Create OAuth client ID (Web application)
3. Add redirect URIs
4. Copy client ID and secret

---

### Phase 4: Frontend Migration (1-2 hours)

**Tasks:**
1. Create auth client: `lib/auth-client.ts`
2. Update `app/_layout.tsx`:
   - Replace `ConvexAuthProvider` with `ConvexBetterAuthProvider`
3. Update `hooks/useAuth.ts`:
   - Use Better Auth client instead of Convex Auth
   - Remove dev bypass logic
4. Update `app/(auth)/login.tsx`:
   - Replace password form with Google OAuth button
5. Remove `app/(auth)/signup.tsx` (not needed for OAuth)

**Auth Client Setup:**
```typescript
// lib/auth-client.ts
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_CONVEX_SITE_URL,
  plugins: [convexClient()],
});
```

**Google Sign In Button:**
```typescript
const handleGoogleSignIn = async () => {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: "practice://auth/callback", // Deep link
  });
};
```

---

### Phase 5: Deep Linking Setup (30 min)

**Tasks:**
1. Configure deep linking in `app.json`:
   ```json
   {
     "expo": {
       "scheme": "practice"
     }
   }
   ```
2. Create callback handler: `app/auth/callback.tsx`
3. Handle session token storage

---

### Phase 6: Dev Bypass Cleanup (15 min)

**Tasks:**
1. Set `EXPO_PUBLIC_DEV_BYPASS_AUTH=false` in `.env.local`
2. Comment out (don't delete) bypass logic in `convex/auth.ts`
3. Remove bypass from `hooks/useAuth.ts`
4. Document emergency re-enable procedure

---

### Phase 7: Testing & Bug Investigation (1 hour)

**Tasks:**
1. Test full OAuth flow
2. Test session persistence
3. Test sign out
4. Reproduce and document analysis error
5. Verify fix after auth migration

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Deep linking issues on mobile | Medium | High | Test early, use expo-linking |
| Google OAuth redirect mismatch | Low | Medium | Carefully configure redirect URIs |
| Session persistence issues | Low | High | Use ConvexBetterAuthProvider |
| Existing user migration | N/A | N/A | No existing users to migrate |

---

## Questions for Team

1. **Production URL:** What's the production Convex deployment URL?
2. **Google Cloud:** Should I use the existing `lobter` project or create a new one?
3. **Session Duration:** Any preference for session timeout?
4. **Multiple Providers:** Should we support other OAuth providers (Apple, etc.)?

---

## Rollback Plan

If Better Auth causes issues:
1. Revert to `master` branch
2. Re-enable dev bypass temporarily
3. Keep Convex Auth as fallback

---

*Document version: 1.0*
*Last updated: 2026-03-11 23:00*
