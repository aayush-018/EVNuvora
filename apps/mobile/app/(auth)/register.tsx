import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Input, Button } from '../../components/ui';
import { colors, spacing, typography } from '../../theme';
import { useAuthStore } from '../../store/auth.store';

export default function RegisterScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'driver' | 'host' | 'driver_host'>('driver');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    setTimeout(() => {
      setAuth(
        {
          id: 'mock-user-2',
          email,
          phone,
          fullName,
          avatarUrl: null,
          role,
          isVerified: false,
          createdAt: new Date().toISOString(),
        },
        'mock-jwt-token',
        'mock-refresh-token'
      );
      setLoading(false);
      router.replace(role === 'host' ? '/(host)/dashboard' : '/(driver)/(home)');
    }, 600);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Create Account</Text>
      <Text style={styles.subheading}>Join India's community-driven EV charging network</Text>

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
        label="Indian Phone Number"
        placeholder="+91 98765 43210"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Input
        label="Password"
        placeholder="Create a strong password"
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
            🚗 Drive & Charge
          </Text>
          <Text style={styles.roleDesc}>Find and reserve public/private charging</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleOption, role === 'driver_host' && styles.roleOptionActive]}
          onPress={() => setRole('driver_host')}
        >
          <Text style={[styles.roleTitle, role === 'driver_host' && styles.roleTextActive]}>
            ⚡ Both (Driver + Host)
          </Text>
          <Text style={styles.roleDesc}>Charge your EV and share your charger</Text>
        </TouchableOpacity>
      </View>

      <Button
        title="Register"
        variant="primary"
        loading={loading}
        onPress={handleRegister}
        style={styles.submitBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
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
  roleLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  roleContainer: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  roleOption: {
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.card,
  },
  roleOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  roleTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  roleTextActive: {
    color: colors.primaryDark,
  },
  roleDesc: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
});
