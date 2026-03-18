import { useRouter, useLocalSearchParams } from 'expo-router';
import { Center, Text } from '@gluestack-ui/themed';
import { useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SESSION_TOKEN_KEY = 'better_auth_session_token';
const CONVEX_JWT_KEY = 'better_auth_convex_jwt';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const sessionToken = params.st as string | undefined;
      const convexJwt = params.jwt as string | undefined;

      if (Platform.OS !== 'web') {
        if (sessionToken) {
          await SecureStore.setItemAsync(SESSION_TOKEN_KEY, sessionToken);
        }
        if (convexJwt) {
          await SecureStore.setItemAsync(CONVEX_JWT_KEY, convexJwt);
        }
      }

      // Navigate to main app after a brief delay for storage to settle
      setTimeout(() => {
        router.replace('/(main)/(tabs)');
      }, 500);
    };

    handleCallback();
  }, []);

  return (
    <Center flex={1} bg="#F9FAFB">
      <Text size="lg" color="#4A5565">
        Signing you in...
      </Text>
    </Center>
  );
}
