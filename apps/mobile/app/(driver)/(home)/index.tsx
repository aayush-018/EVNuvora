import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { colors, spacing, typography } from '../../../theme';
import { Card, Badge, Button } from '../../../components/ui';
import { api } from '../../../services/api';
import { ChargerSearchResult } from '@EVNuvora/shared';

// Default Indian Cities fallback (Connaught Place, New Delhi)
const DEFAULT_LATITUDE = 28.6315;
const DEFAULT_LONGITUDE = 77.2167;

export default function DriverHomeScreen() {
  const router = useRouter();

  // Location State
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: DEFAULT_LATITUDE,
    longitude: DEFAULT_LONGITUDE,
  });
  const [locationName, setLocationName] = useState('New Delhi');
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [chargers, setChargers] = useState<ChargerSearchResult[]>([]);
  const [loadingChargers, setLoadingChargers] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter Modal State
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedConnector, setSelectedConnector] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  // Fetch device GPS on mount
  useEffect(() => {
    (async () => {
      try {
        setLoadingLocation(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setCoords({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
          setLocationName('Current Location');
        }
      } catch (err) {
        // Fallback silently to default coordinates
      } finally {
        setLoadingLocation(false);
      }
    })();
  }, []);

  // Fetch chargers whenever coords or active filters change
  const fetchNearbyChargers = async () => {
    setLoadingChargers(true);
    setErrorMsg(null);
    try {
      const params: Record<string, any> = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        radiusKm: 25,
        sortBy: 'distance',
      };

      if (selectedConnector) {
        params.connectorTypes = selectedConnector;
      }
      if (selectedType) {
        params.chargingType = selectedType;
      }
      if (maxPrice) {
        params.maxPricePerUnit = maxPrice * 100; // Rupee to paise
      }

      const res = await api.get('/chargers/search', { params });
      if (res.data?.success && Array.isArray(res.data?.data)) {
        // Defensive mapping to guard against unexpected nulls
        const safeList: ChargerSearchResult[] = res.data.data.map((item: any) => ({
          id: item.id || '',
          name: item.name || 'EV Station',
          approximateArea: item.approximateArea || item.address || 'Nearby',
          latitude: Number(item.latitude) || 0,
          longitude: Number(item.longitude) || 0,
          listingType: item.listingType || 'public',
          chargingType: item.chargingType || 'AC',
          pricingModel: item.pricingModel || 'per_kwh',
          pricePerUnit: Number(item.pricePerUnit) || 0,
          isReservable: Boolean(item.isReservable),
          verificationStatus: item.verificationStatus || 'unverified',
          primaryPhotoUrl: item.primaryPhotoUrl || null,
          averageRating: item.averageRating ? Number(item.averageRating) : null,
          totalReviews: Number(item.totalReviews) || 0,
          distanceKm: Number(item.distanceKm) || 0,
          availabilityStatus: item.availabilityStatus || 'unknown',
          availabilitySource: item.availabilitySource || 'unknown',
          availabilityUpdatedAt: item.availabilityUpdatedAt || null,
          connectors: Array.isArray(item.connectors) ? item.connectors : [],
        }));
        setChargers(safeList);
      } else {
        setChargers([]);
      }
    } catch (err: any) {
      setErrorMsg('Unable to load nearby chargers. Tap to retry.');
    } finally {
      setLoadingChargers(false);
    }
  };

  useEffect(() => {
    fetchNearbyChargers();
  }, [coords.latitude, coords.longitude, selectedConnector, selectedType, maxPrice]);

  // Open native maps for turn-by-turn navigation
  const openDirections = (destLat: number, destLng: number, label: string) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${destLat},${destLng}`;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });
    if (url) Linking.openURL(url);
  };

  const filteredList = chargers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.approximateArea.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeFilterCount = (selectedConnector ? 1 : 0) + (selectedType ? 1 : 0) + (maxPrice ? 1 : 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search Header Bar */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={`Search near ${locationName}...`}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
          onPress={() => setFilterVisible(true)}
        >
          <Text style={[styles.filterButtonText, activeFilterCount > 0 && styles.filterButtonTextActive]}>
            ⚡ {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filters'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* PostGIS Spatial Radar & Quick Stats */}
      <View style={styles.radarCard}>
        <View style={styles.radarInfo}>
          <Text style={styles.radarTitle}>📍 {locationName}</Text>
          <Text style={styles.radarSubtitle}>
            {loadingLocation ? 'Detecting GPS...' : `Radius 25 km • ${filteredList.length} stations active`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.gpsButton}
          onPress={async () => {
            try {
              setLoadingLocation(true);
              const loc = await Location.getCurrentPositionAsync({});
              setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
              setLocationName('My GPS');
            } catch (err) {
              // Ignore
            } finally {
              setLoadingLocation(false);
            }
          }}
        >
          <Text style={styles.gpsButtonText}>{loadingLocation ? '...' : '🎯 GPS'}</Text>
        </TouchableOpacity>
      </View>

      {/* Chargers List */}
      <ScrollView
        style={styles.sheet}
        contentContainerStyle={styles.sheetContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sheetHeader}>
          <Text style={styles.sectionTitle}>Nearest EV Stations</Text>
          {loadingChargers && <ActivityIndicator size="small" color={colors.primary} />}
        </View>

        {errorMsg && (
          <TouchableOpacity style={styles.errorBanner} onPress={fetchNearbyChargers}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </TouchableOpacity>
        )}

        {!loadingChargers && filteredList.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔌</Text>
            <Text style={styles.emptyTitle}>No chargers found nearby</Text>
            <Text style={styles.emptySubtitle}>
              Try widening your filters or search in another area.
            </Text>
            <Button
              title="Reset Filters"
              size="sm"
              variant="outline"
              style={styles.resetBtn}
              onPress={() => {
                setSelectedConnector(null);
                setSelectedType(null);
                setMaxPrice(null);
              }}
            />
          </View>
        )}

        {filteredList.map((charger) => {
          const isAvailable = charger.availabilityStatus === 'available';
          const priceRupees = (charger.pricePerUnit / 100).toFixed(0);

          return (
            <Card key={charger.id} style={styles.chargerCard}>
              <View style={styles.cardHeader}>
                <View style={styles.titleArea}>
                  <Text style={styles.stationName} numberOfLines={1}>{charger.name}</Text>
                  <Text style={styles.stationDistance}>
                    {charger.distanceKm} km away • {charger.approximateArea}
                  </Text>
                </View>

                <Badge
                  label={isAvailable ? 'Available' : charger.availabilityStatus.toUpperCase()}
                  variant={isAvailable ? 'success' : 'warning'}
                />
              </View>

              {/* Connectors Chips */}
              <View style={styles.connectorRow}>
                {charger.connectors.map((c, idx) => (
                  <View key={idx} style={styles.connectorChip}>
                    <Text style={styles.connectorText}>
                      {c.connectorType.toUpperCase()} ({c.powerKw}kW)
                    </Text>
                  </View>
                ))}
                <Text style={styles.pricing}>₹{priceRupees}/kWh</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <Button
                  title="Station Details"
                  size="sm"
                  variant="primary"
                  style={styles.reserveBtn}
                  onPress={() => router.push(`/charger/${charger.id}` as any)}
                />
                <Button
                  title="Navigate ↗"
                  size="sm"
                  variant="outline"
                  style={styles.navBtn}
                  onPress={() => openDirections(charger.latitude, charger.longitude, charger.name)}
                />
              </View>
            </Card>
          );
        })}
      </ScrollView>

      {/* Filter Modal */}
      <Modal visible={filterVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Stations</Text>
              <TouchableOpacity onPress={() => setFilterVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Connector standard */}
              <Text style={styles.filterSectionTitle}>Connector Type</Text>
              <View style={styles.optionsWrap}>
                {['ccs2', 'type2', 'indian_socket', 'chademo', 'iec60309'].map((conn) => (
                  <TouchableOpacity
                    key={conn}
                    style={[styles.filterChip, selectedConnector === conn && styles.filterChipActive]}
                    onPress={() => setSelectedConnector(selectedConnector === conn ? null : conn)}
                  >
                    <Text style={[styles.filterChipText, selectedConnector === conn && styles.filterChipTextActive]}>
                      {conn.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Charging Speed */}
              <Text style={styles.filterSectionTitle}>Charging Type</Text>
              <View style={styles.optionsWrap}>
                {['AC', 'DC', 'AC_DC'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.filterChip, selectedType === type && styles.filterChipActive]}
                    onPress={() => setSelectedType(selectedType === type ? null : type)}
                  >
                    <Text style={[styles.filterChipText, selectedType === type && styles.filterChipTextActive]}>
                      {type === 'AC_DC' ? 'Fast & Standard (Both)' : type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Maximum Price */}
              <Text style={styles.filterSectionTitle}>Max Price (₹/kWh)</Text>
              <View style={styles.optionsWrap}>
                {[15, 20, 25, 30].map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.filterChip, maxPrice === p && styles.filterChipActive]}
                    onPress={() => setMaxPrice(maxPrice === p ? null : p)}
                  >
                    <Text style={[styles.filterChipText, maxPrice === p && styles.filterChipTextActive]}>
                      Under ₹{p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title="Reset"
                variant="outline"
                style={{ flex: 1, marginRight: spacing.sm }}
                onPress={() => {
                  setSelectedConnector(null);
                  setSelectedType(null);
                  setMaxPrice(null);
                }}
              />
              <Button
                title="Apply Filters"
                variant="primary"
                style={{ flex: 2 }}
                onPress={() => setFilterVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
    gap: spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    height: 44,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: spacing.xs,
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
  },
  clearIcon: {
    fontSize: 14,
    color: colors.textMuted,
    paddingHorizontal: spacing.xs,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  filterButtonTextActive: {
    color: colors.primaryDark,
  },
  radarCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  radarInfo: {
    flex: 1,
  },
  radarTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  radarSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  gpsButton: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  gpsButtonText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  sheet: {
    flex: 1,
  },
  sheetContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
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
    marginBottom: spacing.md,
  },
  resetBtn: {
    width: 140,
  },
  chargerCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  titleArea: {
    flex: 1,
    marginRight: spacing.sm,
  },
  stationName: {
    fontSize: typography.sizes.sm,
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
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  connectorChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  connectorText: {
    fontSize: 10,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  pricing: {
    marginLeft: 'auto',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  reserveBtn: {
    flex: 2,
  },
  navBtn: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  closeBtn: {
    fontSize: 18,
    color: colors.textSecondary,
    padding: spacing.xs,
  },
  filterSectionTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
    textTransform: 'uppercase',
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  filterChipText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
  modalFooter: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
});
