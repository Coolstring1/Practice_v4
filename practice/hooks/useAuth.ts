import { useQuery, useMutation, useConvex } from "convex/react";
import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { expoClient } from "@better-auth/expo/client";
import { api } from "../convex/_generated/api";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { useEffect, useState } from "react";

const SESSION_TOKEN_KEY = "better-auth.session_token";
const CONVEX_JWT_KEY = "better-auth.convex_jwt";

async function getStoredToken(): Promise<string | null> {
  if (Platform.OS !== "web") {
    try {
      return await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
    } catch {
      return null;
    }
  }
  return null;
}

async function getStoredConvexJwt(): Promise<string | null> {
  if (Platform.OS !== "web") {
    try {
      return await SecureStore.getItemAsync(CONVEX_JWT_KEY);
    } catch {
      return null;
    }
  }
  return null;
}

// Export for use in _layout.tsx
export { getStoredConvexJwt as getConvexJwt };

const siteUrl = (process.env.EXPO_PUBLIC_CONVEX_SITE_URL || "").replace(/\/+$/, "");

const authClient = createAuthClient({
  baseURL: siteUrl + "/api/auth",
  fetchOptions: {
    headers: async () => {
      const headers: Record<string, string> = {};
      
      // Inject session token for Better Auth (Client-side identity)
      const token = await SecureStore.getItemAsync(SESSION_TOKEN_KEY).catch(() => null);
      if (token) {
        console.log("[authClient] Injecting Authorization header");
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      // Inject Convex JWT for Convex auth via Better Auth (Server-side context)
      if (Platform.OS !== "web") {
        const jwt = await SecureStore.getItemAsync(CONVEX_JWT_KEY).catch(() => null);
        if (jwt) {
          console.log("[authClient] Injecting x-convex-jwt header");
          headers["x-convex-jwt"] = jwt;
        }
      }
      return headers;
    }
  } as any,
  plugins: [
    expoClient({
      storage: SecureStore,
    }),
    convexClient(),
  ],
});

export function useAuth() {
  const convex = useConvex();
  const { data: session, isPending: isSessionLoading, error: sessionError } = authClient.useSession();
  const authQuery = useQuery(api.auth.getCurrentUser);
  const ensureProfile = useMutation(api.auth.ensureUserProfile);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Derived states
  const user = authQuery?.user ?? null;
  const isConvexAuthenticated = authQuery?.isAuthenticated ?? false;

  // We are authenticated if (EITHER Better Auth session exists OR Convex has a valid identity)
  // AND we are not currently in the process of logging out.
  const isAuthenticated = (!!session || isConvexAuthenticated) && !isLoggingOut;

  // We are loading if we're still checking storage, OR session is pending, OR syncing, OR Convex query hasn't finished
  const isLoading = isInitializing || isSessionLoading || isSyncing || authQuery === undefined;

  // 1. Immediate sync on mount (if we have a stored JWT)
  useEffect(() => {
    const initSync = async () => {
      try {
        const storedJwt = await SecureStore.getItemAsync(CONVEX_JWT_KEY).catch(() => null);
        if (storedJwt) {
          console.log("[useAuth] Hook mount: Initializing Convex auth from storage");
          await convex.setAuth(() => Promise.resolve(storedJwt));
        }
      } catch (e) {
        console.warn("[useAuth] Failed to load stored JWT on mount:", e);
      } finally {
        setIsInitializing(false);
      }
    };
    initSync();
  }, [convex]);

  // 2. React to Better Auth session changes and sync with Convex
  useEffect(() => {
    const syncAuth = async () => {
      if (session) {
        console.log("[useAuth] Session detected, ensuring Convex is in sync...");
        setIsSyncing(true);
        try {
          // Get a fresh Convex token from the Better Auth server
          const { data, error: tokenError } = await authClient.convex.getToken();
          if (data?.token) {
            console.log("[useAuth] Successfully got fresh Convex JWT from authClient");
            await SecureStore.setItemAsync(CONVEX_JWT_KEY, data.token);
            await convex.setAuth(() => Promise.resolve(data.token));
          } else {
            console.warn("[useAuth] Could not get fresh token from authClient:", tokenError);
            // Fallback to what we have, but it might be expired
            const storedJwt = await SecureStore.getItemAsync(CONVEX_JWT_KEY).catch(() => null);
            if (storedJwt) {
              await convex.setAuth(() => Promise.resolve(storedJwt));
            }
          }
        } catch (err) {
          console.error("[useAuth] Failed to sync auth with Convex:", err);
        } finally {
          setIsSyncing(false);
        }
      } else if (session === null && !isSessionLoading) {
        console.log("[useAuth] No session active. Clearing Convex auth state (memory only).");
        await convex.setAuth(() => Promise.resolve(null));
      }
    };
    syncAuth();
  }, [session, convex, isSessionLoading]);

  if (sessionError) {
    console.error("[useAuth] Better Auth session error:", sessionError);
  }

  const refreshSession = async () => {
    console.log("[useAuth] Manually refreshing session...");
    return await authClient.getSession({
      fetchOptions: {
        cache: "no-store",
      },
    });
  };

  const signOut = async () => {
    console.log("[useAuth] Signing out...");
    setIsLoggingOut(true);
    try {
      // 1. Tell Better Auth server to sign out
      await authClient.signOut();
    } catch (e) {
      console.error("[useAuth] Sign out error:", e);
    }

    // 2. Clear tokens from storage
    if (Platform.OS !== "web") {
      await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY).catch(() => {});
      await SecureStore.deleteItemAsync(CONVEX_JWT_KEY).catch(() => {});
    }

    // 3. Clear Convex identity immediately
    await convex.setAuth(() => Promise.resolve(null));
    
    console.log("[useAuth] Sign out complete. Tokens cleared.");
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    session,
    signOut,
    ensureProfile,
    refreshSession,
  };
}

export { authClient };
