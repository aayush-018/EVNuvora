import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, typography } from '../../theme';
import { Card, Badge, Button } from '../../components/ui';
import { api } from '../../services/api';
import { Charger } from '@EVNuvora/shared';

export default function ChargerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [charger, setCharger] = useState<Charger | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        setErrorMsg(null);
        const res = await api.get(`/chargers/${id}`);
        if (res.data?.success && res.data?.data) {
          setCharger(res.data.data);
        } else {
          setErrorMsg('Failed to load charger details.');
        }
      } catch (err: any) {
        setErrorMsg(err.response?.data?.error?.message || 'Station information unavailable.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const openDirections = () => {
    if (!charger) return;
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${charger.latitude},${charger.longitude}`;
    const url = Platform.select({
      ios: `${scheme}${charger.name}@${latLng}`,
      android: `${scheme}${latLng}(${charger.name})`,
    });
    if (url) Linking.openURL(url);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading station specifications...</Text>
      </SafeAreaView>
    );
  }

  if (errorMsg || !charger) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>{errorMsg || 'Charger not found'}</Text>
        <Button
          title="Back to Stations"
          variant="outline"
          onPress={() => router.back()}
          style={{ marginTop: spacing.md }}
        />
      </SafeAreaView>
    );
  }

  const isAvailable = charger.availabilityStatus === 'available';
  const priceRupees = (charger.pricePerUnit / 100).toFixed(2);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Navigation */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>{charger.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Station Header */}
        <View style={styles.heroSection}>
          <View style={styles.statusRow}>
            <Badge
              label={isAvailable ? 'AVAILABLE NOW' : charger.availabilityStatus.toUpperCase()}
              variant={isAvailable ? 'success' : 'warning'}
            />
            <Badge
              label={charger.listingType === 'public' ? 'Public Station' : 'Community Shared'}
              variant="info"
            />
          </View>
          <Text style={styles.stationTitle}>{charger.name}</Text>
          <Text style={styles.addressText}>📍 {charger.address}</Text>
          <Text style={styles.hostSubtitle}>Hosted by {charger.hostName}</Text>
        </View>

        {/* Pricing Card */}
        <Card style={styles.specCard}>
          <Text style={styles.sectionHeading}>Pricing & Rates</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceValue}>₹{priceRupees}</Text>
            <Text style={styles.priceUnit}>/ kWh ({charger.pricingModel.replace('_', ' ')})</Text>
          </View>
          {charger.parkingFee ? (
            <Text style={styles.parkingFeeText}>
              + ₹{(charger.parkingFee / 100).toFixed(0)} flat parking fee
            </Text>
          ) : (
            <Text style={styles.parkingFeeText}>✓ Free Parking Included</Text>
          )}
        </Card>

        {/* Connectors & Fast Charging */}
        <Card style={styles.specCard}>
          <Text style={styles.sectionHeading}>Supported Connectors ({charger.chargingType})</Text>
          {charger.connectors.map((c, i) => (
            <View key={i} style={styles.connectorItem}>
              <View style={styles.connectorLeft}>
                <Text style={styles.connectorType}>{c.connectorType.toUpperCase()}</Text>
                <Text style={styles.connectorPower}>{c.powerKw} kW Power Output</Text>
              </View>
              <Badge
                label={`${c.quantity} ${c.quantity > 1 ? 'Ports' : 'Port'}`}
                variant="primary"
              />
            </View>
          ))}
        </Card>

        {/* Location & Directions Card */}
        <Card style={styles.specCard}>
          <Text style={styles.sectionHeading}>Navigation & Access</Text>
          <Text style={styles.subInfoText}>
            Coordinates: {charger.latitude.toFixed(4)}° N, {charger.longitude.toFixed(4)}° E
          </Text>
          <Button
            title="Open Turn-by-Turn GPS Navigation ↗"
            variant="outline"
            onPress={openDirections}
            style={{ marginTop: spacing.md }}
          />
        </Card>
      </ScrollView>

      {/* Sticky Bottom Booking Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPrice}>
          <Text style={styles.bottomPriceText}>₹{priceRupees}</Text>
          <Text style={styles.bottomPriceUnit}>/ kWh</Text>
        </View>
        <Button
          title={charger.isReservable ? 'Book Charging Slot' : 'Drop-in Only'}
          variant="primary"
          style={styles.bookButton}
          disabled={!charger.isReservable}
          onPress={() => router.push(`/(driver)/bookings` as any)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: colors.error,
    textAlign: 'center',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  backButton: {
    paddingVertical: spacing.xs,
  },
  backButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  navTitle: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.huge * 1.5,
  },
  heroSection: {
    marginBottom: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  stationTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  addressText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  hostSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  specCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  sectionHeading: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.xs,
  },
  priceValue: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  priceUnit: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  parkingFeeText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  connectorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  connectorLeft: {
    flex: 1,
  },
  connectorType: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  connectorPower: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  subInfoText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  bottomPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bottomPriceText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  bottomPriceUnit: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginLeft: 2,
  },
  bookButton: {
    flex: 1,
    marginLeft: spacing.lg,
  },
});
