import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '../../../theme';
import { Card, Button, Badge } from '../../../components/ui';
import { useAuthStore } from '../../../store/auth.store';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, setActiveRole } = useAuthStore();

  const handleSwitchToHost = () => {
    setActiveRole('host');
    router.replace('/(host)/dashboard');
  };

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/welcome');
  };

  return (
    <View style={styles.container}>
      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.fullName?.[0] || 'U'}</Text>
        </View>
        <Text style={styles.name}>{user?.fullName || 'EV Driver'}</Text>
        <Text style={styles.contact}>{user?.email || 'driver@chargekaro.in'}</Text>
        <Badge label="Verified Driver" variant="success" style={styles.badge} />
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Account Modes</Text>
        <Button
          title="⚡ Switch to Host Mode"
          variant="secondary"
          onPress={handleSwitchToHost}
          style={styles.switchBtn}
        />
      </Card>

      <Button
        title="Logout"
        variant="danger"
        onPress={handleLogout}
        style={styles.logoutBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  profileCard: {
    alignItems: 'center',
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: typography.weights.bold,
    color: colors.textInverse,
  },
  name: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  contact: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    marginTop: spacing.md,
  },
  sectionCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  switchBtn: {
    width: '100%',
  },
  logoutBtn: {
    marginTop: 'auto',
  },
});
