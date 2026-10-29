import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/auth.store';
import { colors, typography, spacing } from '../theme';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, activeRole } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.replace('/(auth)/welcome');
      } else if (activeRole === 'host') {
        router.replace('/(host)/dashboard');
      } else {
        router.replace('/(driver)/(home)');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [isAuthenticated, activeRole]);

  return (
    <View style={styles.container}>
      <View style={styles.logoBadge}>
        <Text style={styles.logoIcon}>⚡</Text>
      </View>
      <Text style={styles.title}>ChargeKaro</Text>
      <Text style={styles.subtitle}>Charge kar, tension chhod</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoIcon: {
    fontSize: 36,
  },
  title: {
    fontSize: typography.sizes.display,
    fontWeight: typography.weights.bold,
    color: colors.textInverse,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
