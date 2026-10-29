import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Input, Button } from '../../components/ui';
import { colors, spacing, typography } from '../../theme';
import { useAuthStore } from '../../store/auth.store';
import { api } from '../../services/api';

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
      const response = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      if (response.data?.success && response.data?.data) {
        const { user, tokens } = response.data.data;
        setAuth(user, tokens.accessToken, tokens.refreshToken);
        router.replace(user.role === 'host' ? '/(host)/dashboard' : '/(driver)/(home)');
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Login failed. Please check credentials.';
      setError(msg);
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
        label="Email Address"
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

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.signupLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.guestLink}
        onPress={() => router.replace('/(driver)/(home)')}
      >
        <Text style={styles.guestText}>Continue as Guest</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.huge,
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  signupLink: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  guestLink: {
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  guestText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
});
