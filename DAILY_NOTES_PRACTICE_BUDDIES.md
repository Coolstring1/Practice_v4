# Daily Notes - Practice Buddies

Tracking daily progress on Practice app development from the Practice Buddies group chat.

---

## 2026-03-11

### Tasks Assigned

1. **Fix Auth** - Migrate from Convex Auth to Better Auth with Google OAuth
2. **Dev Bypass Cleanup** - Disable dev bypass once auth is fixed (keep config for emergencies)
3. **Bug Investigation** - Investigate analysis error in Expo preview (potentially auth-related)

### Current Status

**Branch:** `feat/better-auth-integration`

#### Task Breakdown

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Auth Migration → Better Auth | 🔄 In Progress | Research complete, ready to implement |
| 1.1 | Install dependencies | ⏳ Pending | `better-auth`, `@convex-dev/better-auth` |
| 1.2 | Google OAuth setup | ⏳ Blocked | Need GCP credentials |
| 1.3 | Backend migration | ⏳ Pending | ~1-2 hours |
| 1.4 | Frontend migration | ⏳ Pending | ~1-2 hours |
| 1.5 | Deep linking setup | ⏳ Pending | ~30 min |
| 2 | Dev Bypass Disable | ⏳ Pending | After auth is working |
| 3 | Analysis Bug Investigation | ⏳ Pending | May be resolved by auth fix |

#### Progress Updates

**23:05** - Research phase complete
- Created comprehensive implementation plan
- Better Auth has first-class Convex support via `@convex-dev/better-auth`
- Architecture: Expo App → Convex HTTP → Better Auth Component
- Need Google OAuth credentials from GCP Console

**22:55** - Started work on auth migration
- Created feature branch
- Analyzed current auth setup (Convex Auth with password provider)
- Documented dev bypass mechanism
- Created task tracking documents

### Key Decisions

1. **Using `@convex-dev/better-auth`** - First-party Convex integration
2. **Google OAuth only** - Per team request
3. **Keep dev bypass as config** - For emergency demo use

### Blockers / Questions

🚧 **Need Google OAuth Credentials**
- GCP project `lobter` is available
- Need to create OAuth 2.0 client ID in Console
- Redirect URI: `https://dapper-loris-122.convex.site/api/auth/callback/google`

### Next Steps

1. Get Google OAuth credentials (client ID + secret)
2. Install Better Auth packages
3. Begin backend migration

---

## Task Checklist Summary

| Task | Status | Notes |
|------|--------|-------|
| Auth Migration → Better Auth | 🔄 In Progress | Research phase done |
| Google OAuth Setup | ⏳ Blocked | Need GCP credentials |
| Dev Bypass Disable | ⏳ Pending | After auth is working |
| Analysis Bug Investigation | ⏳ Pending | After auth fix |

---

## Documents Created

- `AUTH_MIGRATION_TASKS.md` - Detailed task tracking
- `AUTH_MIGRATION_PLAN.md` - Implementation plan with phases
- `DAILY_NOTES_PRACTICE_BUDDIES.md` - This file

---

*Last updated: 2026-03-11 23:05*
