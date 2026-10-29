import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Input, Button } from '../../components/ui';
import { colors, spacing, typography } from '../../theme';
import { useAuthStore } from '../../store/auth.store';

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      // Direct mock fallback for Phase 1 UI verify
      setAuth(
        {
          id: 'mock-user-1',
          email,
          phone: '+919876543210',
          fullName: 'Demo Driver',
          avatarUrl: null,
          role: 'driver_host',
          isVerified: true,
          createdAt: new Date().toISOString(),
        },
        'mock-access-token',
        'mock-refresh-token'
      );
      router.replace('/(driver)/(home)');
    } catch {
      setError('Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome Back</Text>
      <Text style={styles.subheading}>Enter your credentials to manage EV charging & bookings</Text>

      {error && <Text style={styles.errorBanner}>{error}</Text>}

      <Input
        label="Email or Phone Number"
        placeholder="e.g. driver@example.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Input
        label="Password"
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
        title="Sign In"
        variant="primary"
        loading={loading}
        onPress={handleLogin}
        style={styles.loginBtn}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.signupText}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  heading: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subheading: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  errorBanner: {
    backgroundColor: colors.errorSoft,
    color: colors.error,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    fontSize: typography.sizes.sm,
  },
  loginBtn: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
  },
  signupText: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.sm,
  },
});
