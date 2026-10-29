import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../../theme';
import { Card, Badge, Button } from '../../../components/ui';
import { api } from '../../../services/api';
import { Booking } from '@EVNuvora/shared';
import { useAuthStore } from '../../../store/auth.store';
import { useRouter } from 'expo-router';

export default function BookingsScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s: any) => s.isAuthenticated);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setErrorMsg(null);
      const res = await api.get('/bookings/driver');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setBookings(res.data.data);
      } else {
        setBookings([]);
      }
    } catch (err: any) {
      setErrorMsg('Failed to load active reservations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [isAuthenticated]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const getStatusVariant = (status: string): 'success' | 'warning' | 'info' | 'primary' => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'in_progress':
        return 'primary';
      default:
        return 'info';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My EV Charging Bookings</Text>
      </View>

      {!isAuthenticated ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>🔒</Text>
          <Text style={styles.emptyTitle}>Sign in to view your bookings</Text>
          <Text style={styles.emptySubtitle}>
            Log in to manage reserved charging slots, view charging history, and make payments.
          </Text>
          <Button
            title="Sign In / Register"
            variant="primary"
            style={{ width: 200, marginTop: spacing.md }}
            onPress={() => router.push('/(auth)/login')}
          />
        </View>
      ) : loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Fetching reservations...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {errorMsg && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {bookings.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyIcon}>⚡</Text>
              <Text style={styles.emptyTitle}>No active reservations</Text>
              <Text style={styles.emptySubtitle}>
                Discover stations and reserve charging slots in advance to guarantee your spot.
              </Text>
              <Button
                title="Find Chargers"
                variant="primary"
                style={{ width: 180, marginTop: spacing.md }}
                onPress={() => router.push('/(driver)/(home)')}
              />
            </View>
          ) : (
            bookings.map((b) => {
              const startFormatted = new Date(b.startTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
              const dateFormatted = new Date(b.startTime).toLocaleDateString();
              const priceRupees = (b.totalAmount / 100).toFixed(2);

              return (
                <Card key={b.id} style={styles.bookingCard}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.stationName} numberOfLines={1}>{b.chargerName}</Text>
                      <Text style={styles.dateText}>{dateFormatted} at {startFormatted} ({b.durationMinutes} mins)</Text>
                    </View>
                    <Badge label={b.status.toUpperCase()} variant={getStatusVariant(b.status)} />
                  </View>

                  <View style={styles.detailsRow}>
                    <View style={styles.detailCol}>
                      <Text style={styles.detailLabel}>Connector</Text>
                      <Text style={styles.detailValue}>{b.connectorType.toUpperCase()}</Text>
                    </View>
                    <View style={styles.detailCol}>
                      <Text style={styles.detailLabel}>Total Fare</Text>
                      <Text style={styles.detailPrice}>₹{priceRupees}</Text>
                    </View>
                  </View>

                  <View style={styles.cardActions}>
                    <Button
                      title="View Station ↗"
                      size="sm"
                      variant="outline"
                      style={{ flex: 1 }}
                      onPress={() => router.push(`/charger/${b.chargerId}` as any)}
                    />
                  </View>
                </Card>
              );
            })
          )}
        </ScrollView>
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    paddingTop: spacing.huge,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: colors.errorSoft,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.xs,
    textAlign: 'center',
  },
  bookingCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  stationName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  dateText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: 6,
    marginVertical: spacing.sm,
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  detailPrice: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
});
