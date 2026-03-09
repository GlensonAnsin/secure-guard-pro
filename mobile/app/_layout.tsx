import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { AppColors, Spacing, FontSizes, FontWeights } from '../constants/theme';
import { useNetInfo } from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const netInfo = useNetInfo();

  useEffect(() => {
    if (isLoading) return;

    const onLoginPage = segments[0] === 'login';

    if (!isAuthenticated && !onLoginPage) {
      router.replace('/login');
    } else if (isAuthenticated && onLoginPage) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, router, segments]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.accent} />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="profile"
          options={{
            headerShown: false,
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
      </Stack>
      {netInfo.isConnected === false && (
        <View style={styles.offlineBanner}>
          <WifiOff size={16} color={AppColors.white} />
          <Text style={styles.offlineText}>Offline Mode - Changes will sync when reconnected</Text>
        </View>
      )}
      <StatusBar style="light" />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.primary,
  },
  offlineBanner: {
    backgroundColor: AppColors.danger,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  offlineText: {
    color: AppColors.white,
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
    marginLeft: Spacing.sm,
  },
});
