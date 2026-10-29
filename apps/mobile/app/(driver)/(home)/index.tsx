import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../../theme';
import { Card, Badge, Button } from '../../../components/ui';

export default function DriverHomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search Header Bar */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Search stations in Bengaluru, Delhi, Mumbai...</Text>
        </View>
      </View>

      {/* Map Placeholder Hero */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapIcon}>📍</Text>
          <Text style={styles.mapTitle}>Live PostGIS Interactive Map</Text>
          <Text style={styles.mapSubtitle}>Configured with Google Maps & GPS discovery</Text>
          <Badge label="GPS Ready" variant="success" style={styles.gpsBadge} />
        </View>
      </View>

      {/* Nearby Chargers Bottom Peek */}
      <ScrollView style={styles.sheet} contentContainerStyle={styles.sheetContent}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sectionTitle}>Nearest Chargers</Text>
          <Text style={styles.filterAction}>Filter (2)</Text>
        </View>

        {/* Sample Mock Station Card */}
        <Card style={styles.chargerCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.stationName}>GreenWatt Hub - Indiranagar</Text>
              <Text style={styles.stationDistance}>1.4 km • Indiranagar 100ft Rd</Text>
            </View>
            <Badge label="Host Verified" variant="success" />
          </View>

          <View style={styles.connectorRow}>
            <Badge label="CCS2 (60kW)" variant="primary" />
            <Badge label="Type 2 (22kW)" variant="info" />
            <Text style={styles.pricing}>₹18/kWh</Text>
          </View>

          <View style={styles.actionRow}>
            <Button
              title="Reserve Slot"
              size="sm"
              variant="primary"
              style={styles.reserveBtn}
              onPress={() => {}}
            />
            <Button
              title="Navigate"
              size="sm"
              variant="outline"
              style={styles.navBtn}
              onPress={() => {}}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    height: 44,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: spacing.sm,
    fontSize: 16,
  },
  searchPlaceholder: {
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
  },
  mapContainer: {
    height: '42%',
    backgroundColor: colors.surfaceBorder,
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E8F0',
  },
  mapIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  mapTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  mapSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  gpsBadge: {
    marginTop: spacing.sm,
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sheetContent: {
    padding: spacing.lg,
  },
  sheetHeader: {
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
  filterAction: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  chargerCard: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  stationName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  stationDistance: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  connectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginVertical: spacing.sm,
  },
  pricing: {
    marginLeft: 'auto',
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  reserveBtn: {
    flex: 1,
  },
  navBtn: {
    flex: 1,
  },
});
