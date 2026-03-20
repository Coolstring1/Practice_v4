import React, { useState } from 'react';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { useConvex } from 'convex/react';
import { ENV } from '../../config/env';
import {
  VStack,
  Box,
  Text,
  Heading,
  Center,
  Toast,
  useToast,
  ToastTitle,
  ToastDescription,
} from '@gluestack-ui/themed';
import { TouchableOpacity } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, refreshSession } = useAuth();
  const convex = useConvex();
  const router = useRouter();
  const toast = useToast();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(main)/(tabs)');
    }
  }, [isAuthenticated]);

  const handleGoogleSignIn = async () => {
    console.log("==========================================================================");
    console.log("==================== [Login] handleGoogleSignIn CALLED ===================");
    console.log("==========================================================================");
    setLoading(true);
    try {
      const signInUrl = `${ENV.CONVEX_SITE_URL}/api/auth/google`;
      const redirectUri = "practice://auth/callback";
      console.log("[Login] ENV.CONVEX_SITE_URL:", ENV.CONVEX_SITE_URL);
      console.log("[Login] Final signInUrl:", signInUrl);
      console.log("[Login] Expecting redirect back to:", redirectUri);

      const response = await WebBrowser.openAuthSessionAsync(
        signInUrl,
        redirectUri
      );

      console.log("[Login] WebBrowser response received:", {
        type: response.type,
        url: (response as any).url ? `${(response as any).url.slice(0, 30)}...` : "NONE",
      });

      if (response.type === "success" && (response as any).url) {
        const url = (response as any).url;
        console.log("[Login] Auth success, processing URL for tokens...");
        
        // Manual parsing since we're in the same context
        const queryParams = new URL(url.replace("practice://", "http://")).searchParams;
        const st = queryParams.get("st");
        const jwt = queryParams.get("jwt");

        console.log("[Login] Extracted tokens:", { hasSt: !!st, hasJwt: !!jwt });

        if (st && jwt) {
          console.log("[Login] Saving tokens to SecureStore...");
          await SecureStore.setItemAsync("better-auth.session_token", st);
          await SecureStore.setItemAsync("better-auth.convex_jwt", jwt);
          
          console.log("[Login] Tokens saved. Manually setting Convex auth and refreshing session...");
          // CRITICAL: Immediately set auth so the next query uses it
          await convex.setAuth(() => Promise.resolve(jwt));
          
          // CRITICAL: Refresh the Better Auth client session object
          await refreshSession();
          
          console.log("[Login] State synced. Navigating to (main)...");
          router.replace('/(main)/(tabs)');
        } else {
          console.error("[Login] Tokens missing from callback URL");
        }
      } else {
        console.log("[Login] Auth browser did NOT return success:", response.type);
      }
    } catch (err: any) {
      console.error("[Login] Google sign-in error (exception):", err);
      toast.show({
        placement: "top",
        render: ({ id }) => {
          return (
            <Toast nativeID={"toast-" + id} action="error" variant="accent">
              <VStack space="xs">
                <ToastTitle>Sign In Failed</ToastTitle>
                <ToastDescription>{err.message || 'Could not sign in with Google.'}</ToastDescription>
              </VStack>
            </Toast>
          );
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center flex={1} px="$6" bg="#F9FAFB">
      <VStack space="lg" w="$full">
        <Box alignItems="center" mb="$4">
          <Text fontSize={40} mb="$2">🎾</Text>
          <Heading size="3xl" color="#0A0A0A" mb="$2">Welcome Back</Heading>
          <Text size="md" color="#4A5565" textAlign="center">
            Sign in to continue your practice journey
          </Text>
        </Box>

        <TouchableOpacity onPress={handleGoogleSignIn} disabled={loading}>
          <LinearGradient
            colors={['#155DFC', '#9810FA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingVertical: 16,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: loading ? 0.7 : 1,
            }}
          >
            <Text color="white" fontWeight="$bold" size="lg">
              {loading ? 'Signing In...' : 'Sign in with Google'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <Box flexDirection="row" justifyContent="center" mt="$4">
          <Text size="md" color="#4A5565">Don't have an account? </Text>
          <Link href="/(auth)/signup" asChild>
            <Text size="md" color="#155DFC" fontWeight="$bold">
              Get Started
            </Text>
          </Link>
        </Box>
      </VStack>
    </Center>
  );
}
