import React, { useState } from 'react';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
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

export default function SignupScreen() {
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const toast = useToast();

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(main)/(tabs)');
    }
  }, [isAuthenticated]);

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      const signInUrl = `${ENV.CONVEX_SITE_URL}/api/auth/google`;

      const response = await WebBrowser.openAuthSessionAsync(
        signInUrl,
        "practice://auth/callback"
      );

      if (response.type === "success" && response.url) {
        // The callback screen handles token storage and routing
      }
    } catch (err: any) {
      console.error("Google sign-up error:", err);
      toast.show({
        placement: "top",
        render: ({ id }) => {
          return (
            <Toast nativeID={"toast-" + id} action="error" variant="accent">
              <VStack space="xs">
                <ToastTitle>Sign Up Failed</ToastTitle>
                <ToastDescription>{err.message || 'Could not sign up with Google.'}</ToastDescription>
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
          <Text fontSize={40} mb="$2">🚀</Text>
          <Heading size="3xl" color="#0A0A0A" mb="$2">Get Started</Heading>
          <Text size="md" color="#4A5565" textAlign="center">
            Join Practice to improve your skills with AI
          </Text>
        </Box>

        <TouchableOpacity onPress={handleGoogleSignUp} disabled={loading}>
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
              {loading ? 'Creating Account...' : 'Sign up with Google'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <Box flexDirection="row" justifyContent="center" mt="$4">
          <Text size="md" color="#4A5565">Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <Text size="md" color="#155DFC" fontWeight="$bold">
              Sign In
            </Text>
          </Link>
        </Box>
      </VStack>
    </Center>
  );
}
