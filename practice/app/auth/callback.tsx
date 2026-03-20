import { useRouter, useLocalSearchParams } from 'expo-router';
import { Center, Text, Spinner } from '@gluestack-ui/themed';
import { useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useConvex } from 'convex/react';

const SESSION_TOKEN_KEY = 'better-auth.session_token';
const CONVEX_JWT_KEY = 'better-auth.convex_jwt';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { refreshSession } = useAuth();
  const convex = useConvex();

  console.log("-----------------------------------------");
  console.log("[AuthCallback] MOUNTED", { params });
  console.log("-----------------------------------------");

  useEffect(() => {
    const handleCallback = async () => {
      const sessionToken = params.st as string | undefined;
      const convexJwt = params.jwt as string | undefined;

      console.log("[AuthCallback] Extracted parameters:", { 
        hasSt: !!sessionToken, 
        st_preview: sessionToken ? `${sessionToken.slice(0, 10)}...` : "NONE",
        hasJwt: !!convexJwt,
        jwt_preview: convexJwt ? `${convexJwt.slice(0, 10)}...` : "NONE"
      });

      if (Platform.OS !== 'web') {
        if (sessionToken) {
          console.log("[AuthCallback] Saving session token to SecureStore...");
          try {
            await SecureStore.setItemAsync(SESSION_TOKEN_KEY, sessionToken);
            console.log("[AuthCallback] Session token saved successfully.");
          } catch (e) {
            console.error("[AuthCallback] FAILED TO SAVE session token:", e);
          }
        }
        if (convexJwt) {
          console.log("[AuthCallback] Saving Convex JWT to SecureStore...");
          try {
            await SecureStore.setItemAsync(CONVEX_JWT_KEY, convexJwt);
            // IMMEDIATE SYNC
            console.log("[AuthCallback] Manually setting Convex auth...");
            convex.setAuth(() => Promise.resolve(convexJwt));
            console.log("[AuthCallback] Convex setAuth complete.");
          } catch (e) {
            console.error("[AuthCallback] FAILED TO SAVE Convex JWT:", e);
          }
        }
      }

      // Explicitly refresh session
      try {
        console.log("[AuthCallback] Triggering refreshSession (authClient.getSession)...");
        const res = await refreshSession();
        console.log("[AuthCallback] refreshSession result:", { 
          hasData: !!res.data, 
          hasError: !!res.error,
          error: res.error 
        });
      } catch (err) {
        console.error("[AuthCallback] Exception in refreshSession:", err);
      }

      console.log("[AuthCallback] Final state check:", {
        sessionTokenInStorage: !!(await SecureStore.getItemAsync(SESSION_TOKEN_KEY)),
        convexJwtInStorage: !!(await SecureStore.getItemAsync(CONVEX_JWT_KEY))
      });

      console.log("[AuthCallback] Waiting 500ms for state to settle...");
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log("[AuthCallback] Navigating to (main)...");
      router.replace('/(main)/(tabs)');
    };

    if (params.st || params.jwt) {
       handleCallback();
    } else {
       console.log("[AuthCallback] No tokens in params, checking if already authenticated...");
       // Maybe just a direct link or something
       router.replace('/index');
    }
  }, [params, router, refreshSession, convex]);

  return (
    <Center flex={1} bg="#F9FAFB">
      <Spinner size="large" color="#155DFC" mb="$4" />
      <Center>
        <Text size="lg" color="#0A0A0A" fontWeight="$bold">
          Finalizing Sign-In
        </Text>
        <Text size="md" color="#4A5565">
          Please wait a moment...
        </Text>
      </Center>
    </Center>
  );
}
