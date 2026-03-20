import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { useConvex } from 'convex/react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SESSION_TOKEN_KEY = "better-auth.session_token";
const CONVEX_JWT_KEY = "better-auth.convex_jwt";

export default function Index() {
  const { isAuthenticated, isLoading, user, refreshSession } = useAuth();
  const convex = useConvex();
  const [isWaiting, setIsWaiting] = React.useState(true);
  const [isSyncingFromStorage, setIsSyncingFromStorage] = React.useState(true);

  console.log("[Index] Render state:", { 
    isAuthenticated, 
    isLoading, 
    isWaiting,
    isSyncingFromStorage,
    hasUser: !!user,
    userName: (user as any)?.name
  });

  useEffect(() => {
    // Give storage/auth a bit more time to settle
    const timer = setTimeout(() => {
      console.log("[Index] Settlement timer finished");
      setIsWaiting(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const syncAndCheck = async () => {
      if (Platform.OS === 'web') {
        setIsSyncingFromStorage(false);
        return;
      }

      try {
        console.log("[Index] Checking SecureStore for existing tokens...");
        const convexJwt = await SecureStore.getItemAsync(CONVEX_JWT_KEY).catch(() => null);
        const sessionToken = await SecureStore.getItemAsync(SESSION_TOKEN_KEY).catch(() => null);
        
        console.log("[Index] Storage check result:", { 
          hasConvexJwt: !!convexJwt, 
          hasSessionToken: !!sessionToken 
        });

        if (convexJwt) {
          console.log("[Index] Pre-syncing Convex auth from storage");
          await convex.setAuth(() => Promise.resolve(convexJwt));
        }

        // If we have tokens but session is not detected, force a refresh
        if (sessionToken && !isAuthenticated && !isLoading) {
           console.log("[Index] Session token present but no active session object. Attempting refreshSession...");
           try {
             const res = await refreshSession();
             if (!res.data) {
                console.warn("[Index] refreshSession failed to return data. Clearing tokens to break loop.");
                await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY).catch(() => {});
                await SecureStore.deleteItemAsync(CONVEX_JWT_KEY).catch(() => {});
             } else {
                console.log("[Index] refreshSession SUCCESSFUL");
             }
           } catch (e) {
             console.error("[Index] refreshSession EXCEPTION:", e);
             await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY).catch(() => {});
             await SecureStore.deleteItemAsync(CONVEX_JWT_KEY).catch(() => {});
           }
        }
      } catch (error) {
        console.error("[Index] syncAndCheck failed:", error);
      } finally {
        setIsSyncingFromStorage(false);
      }
    };
    
    if (!isLoading && !isWaiting) {
      syncAndCheck();
    }
  }, [convex, isAuthenticated, isLoading, isWaiting, refreshSession]);

  if (isLoading || isWaiting || isSyncingFromStorage) {
    return <LoadingSpinner text="Starting Practice..." />;
  }

  if (!isAuthenticated) {
    console.log("[Index] Final decision: Not authenticated, redirecting to login");
    return <Redirect href="/(auth)/login" />;
  }

  console.log("[Index] Final decision: Authenticated, checking onboarding status...");
  // If user exists but hasn't completed onboarding/sport selection
  const profile = user; 
  if (profile && !profile.preferredSport) {
    console.log("[Index] User lacks preferredSport, redirecting to sport-selection");
    return <Redirect href="/onboarding/sport-selection" />;
  }
  
  if (profile && !profile.onboardingCompleted) {
    console.log("[Index] User onboarding not completed, redirecting to tutorial");
    return <Redirect href="/onboarding/tutorial" />;
  }

  console.log("[Index] All good, redirecting to (main)/(tabs)");
  return <Redirect href="/(main)/(tabs)" />;
}
