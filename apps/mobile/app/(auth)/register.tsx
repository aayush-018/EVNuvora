import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Input, Button } from '../../components/ui';
import { colors, spacing, typography } from '../../theme';
import { useAuthStore } from '../../store/auth.store';
import { api } from '../../services/api';

export default function RegisterScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'driver' | 'host' | 'driver_host'>('driver');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      setError('Please provide full name, email, and password.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        password,
        role,
      });

      if (response.data?.success && response.data?.data) {
        const { user, tokens } = response.data.data;
        setAuth(user, tokens.accessToken, tokens.refreshToken);
        router.replace(user.role === 'host' ? '/(host)/dashboard' : '/(driver)/(home)');
      } else {
        throw new Error('Registration failed');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Create Account</Text>
      <Text style={styles.subheading}>Join India's community-driven EV charging network</Text>

      {error && <Text style={styles.errorBanner}>{error}</Text>}

      <Input
        label="Full Name"
        placeholder="e.g. Rahul Sharma"
        value={fullName}
        onChangeText={setFullName}
      />

      <Input
        label="Email Address"
        placeholder="name@example.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Input
        label="Indian Phone Number (Optional)"
        placeholder="+919876543210"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Input
        label="Password"
        placeholder="At least 8 characters"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={styles.roleLabel}>I want to:</Text>
      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleOption, role === 'driver' && styles.roleOptionActive]}
          onPress={() => setRole('driver')}
        >
          <Text style={[styles.roleTitle, role === 'driver' && styles.roleTextActive]}>
            Find Chargers
          </Text>
          <Text style={styles.roleDesc}>Drive & charge easily</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleOption, role === 'host' && styles.roleOptionActive]}
          onPress={() => setRole('host')}
        >
          <Text style={[styles.roleTitle, role === 'host' && styles.roleTextActive]}>
            Host Charger
          </Text>
          <Text style={styles.roleDesc}>Monetize home socket</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleOption, role === 'driver_host' && styles.roleOptionActive]}
          onPress={() => setRole('driver_host')}
        >
          <Text style={[styles.roleTitle, role === 'driver_host' && styles.roleTextActive]}>
            Both
          </Text>
          <Text style={styles.roleDesc}>Drive & earn</Text>
        </TouchableOpacity>
      </View>

      <Button
        title="Sign Up"
        variant="primary"
        loading={loading}
        onPress={handleRegister}
        style={styles.btn}
      />

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.loginLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
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
    marginBottom: spacing.lg,
  },
  errorBanner: {
    backgroundColor: colors.errorSoft,
    color: colors.error,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    fontSize: typography.sizes.sm,
  },
  roleLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  roleOption: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    borderRadius: 8,
    padding: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  roleOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  roleTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  roleTextActive: {
    color: colors.primary,
  },
  roleDesc: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  btn: {
    marginTop: spacing.sm,
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
  loginLink: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
});
