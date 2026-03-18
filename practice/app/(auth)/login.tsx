import React, { useState } from 'react';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
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
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const toast = useToast();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(main)/(tabs)');
    }
  }, [isAuthenticated]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      // Open our /api/auth/google endpoint which uses a real HTML form POST
      // to Better Auth's sign-in endpoint. Form submissions are browser-level
      // navigations, so Safari reliably persists cookies from the response.
      const signInUrl = "https://dapper-loris-122.convex.site/api/auth/google";

      const response = await WebBrowser.openAuthSessionAsync(
        signInUrl,
        "practice://auth/callback"
      );

      if (response.type === "success" && response.url) {
        // The callback screen handles token storage and routing
      }
    } catch (err: any) {
      console.error("Google sign-in error:", err);
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
