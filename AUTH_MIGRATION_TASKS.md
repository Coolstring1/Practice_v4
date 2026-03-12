# Auth Migration Tasks - Better Auth Integration

**Branch:** `feat/better-auth-integration`
**Created:** 2026-03-11
**Status:** In Progress - Research Complete

---

## Overview

Migrating from Convex Auth to Better Auth with Google OAuth for the Practice app.

### Current State
- **Auth Provider:** Convex Auth (`@convex-dev/auth` v0.0.90)
- **Provider:** Password-based authentication
- **Dev Bypass:** Enabled via `DEV_BYPASS_AUTH=true` in `.env.local` and Convex dashboard
- **Issue:** Auth feels unreliable; want to try Better Auth for better integration

### Target State
- **Auth Provider:** Better Auth with Google OAuth
- **Dev Bypass:** Disabled by default (keep config for emergencies)
- **Backend:** Convex functions updated to work with Better Auth session verification

---

## Tasks

### Phase 1: Setup & Research
- [x] Research Better Auth + Convex integration patterns
- [ ] Set up Google OAuth credentials in GCP
- [ ] Install Better Auth dependencies

### Phase 2: Backend Migration
- [ ] Create Better Auth configuration
- [ ] Update Convex functions to verify Better Auth sessions
- [ ] Migrate user creation/management logic
- [ ] Remove or deprecate Convex Auth code

### Phase 3: Frontend Migration
- [ ] Update auth hooks (`useAuth.ts`)
- [ ] Update login/signup screens for Google OAuth
- [ ] Update app layout and auth providers
- [ ] Test authentication flow

### Phase 4: Dev Bypass Cleanup
- [ ] Disable `DEV_BYPASS_AUTH` in `.env.local`
- [ ] Remove or comment out bypass logic in `getUserId()` (keep config option)
- [ ] Update frontend bypass handling
- [ ] Document how to re-enable for emergencies

### Phase 5: Bug Investigation
- [ ] Reproduce the analysis error in Expo preview
- [ ] Check Convex logs for auth-related errors
- [ ] Document root cause and fix

---

## Progress Log

### 2026-03-11 23:05 - Research Complete

**Completed:**
- ✅ Created branch `feat/better-auth-integration`
- ✅ Analyzed current auth setup
- ✅ Researched Better Auth + Convex integration
- ✅ Created detailed implementation plan

**Key Findings:**

1. **Better Auth has first-class Convex support** via `@convex-dev/better-auth`
   - Maintained by Convex team
   - Runs as a Convex component
   - Uses Convex database for user storage

2. **Architecture will be:**
   ```
   Expo App → Convex HTTP → Better Auth Component → Convex DB
   ```

3. **Google OAuth for Mobile:**
   - Use `expo-web-browser` for OAuth flow
   - Configure deep linking (`practice://`) for callbacks
   - Convex HTTP endpoint handles the OAuth callback

4. **GCP Project Available:**
   - Project: `lobter` (908171403785)
   - Account: `lobterclaw@gmail.com`
   - Need to create OAuth 2.0 client ID in GCP Console

**Files Created:**
- `AUTH_MIGRATION_TASKS.md` - This file (task tracking)
- `AUTH_MIGRATION_PLAN.md` - Detailed implementation plan
- `DAILY_NOTES_PRACTICE_BUDDIES.md` - Daily progress log

**Next Steps:**
1. Need to create Google OAuth credentials in GCP Console
2. Install Better Auth packages
3. Begin backend migration

**Questions for Team:**
- Should I use the existing `lobter` GCP project for OAuth, or create a new one?
- What's the production Convex URL for redirect URI configuration?

---

### 2026-03-11 22:55 - Initial Assessment

**Completed:**
- Created branch `feat/better-auth-integration`
- Analyzed current auth setup

**Current Auth Architecture:**
```
Frontend:
- app/_layout.tsx → ConvexAuthProvider wrapper
- hooks/useAuth.ts → Auth hook with dev bypass
- config/env.ts → DEV_BYPASS_AUTH config

Backend (Convex):
- convex/auth.ts → getUserId() with bypass logic, getCurrentUser, etc.
- convex/auth.config.ts → Basic Convex Auth config (password provider)
```

**Dev Bypass Mechanism:**
- `EXPO_PUBLIC_DEV_BYPASS_AUTH=true` (frontend)
- `DEV_BYPASS_AUTH=true` (Convex backend - set in dashboard)
- When enabled: bypasses auth, uses test user `vivien14@test.com`

**Key Files to Modify:**
1. `convex/auth.ts` - Core auth logic
2. `hooks/useAuth.ts` - Frontend auth hook
3. `app/_layout.tsx` - Auth provider setup
4. `app/(auth)/login.tsx` - Login screen
5. `app/(auth)/signup.tsx` - Signup screen
6. `.env.local` - Environment config

---

## Learnings & Challenges

### Better Auth + Convex
- Better Auth runs as a Convex component, not a separate server
- The `@convex-dev/better-auth` package provides the integration
- Auth state is managed through Convex's session system
- For React Native, need to handle OAuth via web browser + deep links

### Google OAuth on Mobile
- Can't use native Google Sign-In SDK directly with Better Auth
- Must use web OAuth flow via `expo-web-browser`
- Redirect URI must point to Convex HTTP endpoint
- Deep link brings user back to app after auth

---

## Questions/Blockers

1. **Google OAuth Credentials** - Need to create in GCP Console
   - Can create them myself if given access, or
   - Chris can create and share client ID/secret

2. **Production URL** - Need production Convex URL for OAuth redirect

---

## Files Reference

| File | Purpose | Status |
|------|---------|--------|
| `AUTH_MIGRATION_TASKS.md` | Task tracking | ✅ Created |
| `AUTH_MIGRATION_PLAN.md` | Implementation plan | ✅ Created |
| `DAILY_NOTES_PRACTICE_BUDDIES.md` | Daily progress | ✅ Created |

---

*Last updated: 2026-03-11 23:05*
