import { useQuery, useMutation } from "convex/react";
import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { api } from "../convex/_generated/api";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const SESSION_TOKEN_KEY = "better_auth_session_token";
const CONVEX_JWT_KEY = "better_auth_convex_jwt";

async function getStoredToken(): Promise<string | null> {
  if (Platform.OS !== "web") {
    try {
      return await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
    } catch {}
  }
  return null;
}

async function getConvexJwt(): Promise<string | null> {
  if (Platform.OS !== "web") {
    try {
      return await SecureStore.getItemAsync(CONVEX_JWT_KEY);
    } catch {}
  }
  return null;
}

// Export for use in _layout.tsx
export { getConvexJwt };

const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_CONVEX_SITE_URL,
  plugins: [
    convexClient(),
    {
      id: "native-token",
      // On native, send the session token via a custom header
      // Better Auth reads this via session.headerName config
      fetchOptions: async () => {
        if (Platform.OS !== "web") {
          const token = await getStoredToken();
          if (token) {
            return {
              headers: {
                // Raw token value, no "Bearer" prefix
                "x-better-auth-session-token": token,
              },
            };
          }
        }
        return {};
      },
    } as any,
  ],
});

export function useAuth() {
  const { data: session, isPending: isLoading } = authClient.useSession();
  const user = useQuery(api.auth.getCurrentUser);
  const ensureProfile = useMutation(api.auth.ensureUserProfile);

  const isAuthenticated = !!session;

  const signOut = async () => {
    await authClient.signOut();
    if (Platform.OS !== "web") {
      await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
      await SecureStore.deleteItemAsync(CONVEX_JWT_KEY);
    }
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    session,
    signOut,
    ensureProfile,
  };
}

export { authClient };
