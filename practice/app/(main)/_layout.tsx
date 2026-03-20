import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { Box, Spinner, Text } from '@gluestack-ui/themed';

export default function MainLayout() {
  const { isAuthenticated, isLoading, user, ensureProfile, session } = useAuth();
  const [isEnsuringProfile, setIsEnsuringProfile] = React.useState(false);

  console.log("[MainLayout] Render state:", { 
    isAuthenticated, 
    isLoading, 
    hasUser: !!user,
    hasSession: !!session,
    isEnsuringProfile,
    authQueryUser: user?._id
  });

  React.useEffect(() => {
    const handleProfile = async () => {
      console.log("[MainLayout] handleProfile check:", { isAuthenticated, userExists: !!user, isLoading, isEnsuringProfile });
      
      // ONLY trigger if we are authenticated AND the user query has returned NULL (not undefined/loading)
      // This means the profile is missing in the database.
      if (isAuthenticated && user === null && !isLoading && !isEnsuringProfile) {
        setIsEnsuringProfile(true);
        console.log("[MainLayout] App profile is missing (null). Creating via ensureProfile mutation...");
        try {
          const result = await ensureProfile();
          console.log("[MainLayout] Profile ensured successfully, result:", result?._id);
        } catch (err) {
          console.error("[MainLayout] Failed to ensure profile:", err);
        } finally {
          setIsEnsuringProfile(false);
        }
      } else if (isAuthenticated && user) {
        console.log("[MainLayout] Profile already exists:", user._id);
      }
    };
    handleProfile();
  }, [isAuthenticated, user, isLoading, isEnsuringProfile, ensureProfile, session]);

  if (isLoading || isEnsuringProfile) {
    console.log("[MainLayout] Loading state active, showing spinner...");
    return (
      <Box flex={1} justifyContent="center" alignItems="center" bg="$backgroundLight0">
        <Spinner size="large" color="$primary500" />
        <Box mt="$4">
          <Text size="md" color="$primary500">
            {isEnsuringProfile ? "Setting up your profile..." : "Loading..."}
          </Text>
        </Box>
      </Box>
    );
  }

  if (!isAuthenticated) {
    console.log("[MainLayout] AUTHENTICATION REQUIRED. Current state:", { 
      isAuthenticated, 
      isLoading, 
      hasSessionObject: !!session,
      hasUserObject: !!user 
    });
    return <Redirect href="/(auth)/login" />;
  }

  // Optional: Redirect to onboarding if not completed (can also be done in index)
  // if (user && !user.onboardingCompleted) {
  //   return <Redirect href="/onboarding" />;
  // }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="analysis/[id]" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}