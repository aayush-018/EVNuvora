import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '../../../theme';
import { Card, Button, Badge } from '../../../components/ui';
import { useAuthStore } from '../../../store/auth.store';

export default function HostDashboardScreen() {
  const router = useRouter();
  const setActiveRole = useAuthStore((s) => s.setActiveRole);

  const handleSwitchToDriver = () => {
    setActiveRole('driver');
    router.replace('/(driver)/(home)');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Earnings Overview Card */}
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Earnings</Text>
        <Text style={styles.summaryAmount}>₹12,450.00</Text>
        <View style={styles.statRow}>
          <View style={styles.statCol}>
            <Text style={styles.statNumber}>18</Text>
            <Text style={styles.statText}>Completed Bookings</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statText}>Active Listings</Text>
          </View>
        </View>
      </Card>

      {/* Host Chargers Listing */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Chargers</Text>
        <Badge label="Verified Host" variant="success" />
      </View>

      <Card style={styles.listingCard}>
        <View style={styles.listingHeader}>
          <Text style={styles.chargerTitle}>7.4kW Type 2 - Home Garage</Text>
          <Badge label="Active" variant="success" />
        </View>
        <Text style={styles.chargerAddress}>Indiranagar Stage 2, Bengaluru</Text>
        <Text style={styles.chargerRate}>Rate: ₹12/hr • Available 09:00 - 18:00</Text>
      </Card>

      <Button
        title="+ List New EV Charger"
        variant="primary"
        style={styles.addBtn}
        onPress={() => {}}
      />

      <Button
        title="🚗 Switch Back to Driver Mode"
        variant="outline"
        style={styles.switchBtn}
        onPress={handleSwitchToDriver}
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
  summaryCard: {
    backgroundColor: colors.secondary,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
  },
  summaryAmount: {
    color: colors.textInverse,
    fontSize: typography.sizes.display,
    fontWeight: typography.weights.bold,
    marginVertical: spacing.xs,
  },
  statRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.secondaryLight,
    paddingTop: spacing.md,
  },
  statCol: {
    flex: 1,
  },
  statNumber: {
    color: colors.primary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  statText: {
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  listingCard: {
    marginBottom: spacing.md,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chargerTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  chargerAddress: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chargerRate: {
    fontSize: typography.sizes.xs,
    color: colors.primaryDark,
    fontWeight: typography.weights.medium,
    marginTop: spacing.xs,
  },
  addBtn: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  switchBtn: {
    marginBottom: spacing.xl,
  },
});
