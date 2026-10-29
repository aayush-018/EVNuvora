import { query } from '../config/database';
import { NotFoundError } from '../utils/errors';
import {
  Charger,
  ChargerSearchResult,
  ChargerSearchParams,
  ChargerStatus,
  ListingType,
  ChargingType,
  PricingModel,
  VerificationStatus,
  AvailabilitySource,
} from '@EVNuvora/shared';

export interface CreateChargerInput {
  name: string;
  address: string;
  approximateArea: string;
  latitude: number;
  longitude: number;
  listingType?: ListingType;
  chargingType?: ChargingType;
  pricingModel?: PricingModel;
  pricePerUnit: number; // In paise
  parkingFee?: number | null;
  operatingHours?: any;
  accessInstructions?: string;
  isReservable?: boolean;
  connectors: {
    connectorType: string;
    powerKw: number;
    quantity?: number;
  }[];
  photos?: {
    url: string;
    caption?: string;
    isPrimary?: boolean;
  }[];
}

export class ChargerService {
  /**
   * Search nearby chargers using PostGIS ST_DWithin and ST_DistanceSphere.
   */
  static async search(params: ChargerSearchParams): Promise<{
    chargers: ChargerSearchResult[];
    total: number;
    page: number;
    limit: number;
  }> {
    const radiusMeters = (params.radiusKm || 15) * 1000;
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = [
      `status = 'approved'`,
      `ST_DWithin(location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)`,
    ];
    const values: any[] = [params.longitude, params.latitude, radiusMeters];
    let valIdx = 4;

    if (params.chargingType) {
      conditions.push(`charging_type = $${valIdx}`);
      values.push(params.chargingType);
      valIdx++;
    }

    if (params.listingType) {
      conditions.push(`listing_type = $${valIdx}`);
      values.push(params.listingType);
      valIdx++;
    }

    if (params.maxPricePerUnit !== undefined) {
      conditions.push(`price_per_unit <= $${valIdx}`);
      values.push(params.maxPricePerUnit);
      valIdx++;
    }

    if (params.isReservable !== undefined) {
      conditions.push(`is_reservable = $${valIdx}`);
      values.push(params.isReservable);
      valIdx++;
    }

    if (params.availabilityStatus) {
      conditions.push(`availability_status = $${valIdx}`);
      values.push(params.availabilityStatus);
      valIdx++;
    }

    // Connector type filtering via JOIN
    let connectorJoin = '';
    if (params.connectorTypes && params.connectorTypes.length > 0) {
      connectorJoin = `JOIN charger_connectors cc_filter ON cc_filter.charger_id = c.id AND cc_filter.connector_type = ANY($${valIdx})`;
      values.push(params.connectorTypes);
      valIdx++;
    }

    // Power kw filter
    if (params.minPowerKw !== undefined) {
      connectorJoin += ` JOIN charger_connectors cc_pwr ON cc_pwr.charger_id = c.id AND cc_pwr.power_kw >= $${valIdx}`;
      values.push(params.minPowerKw);
      valIdx++;
    }

    const whereClause = conditions.join(' AND ');

    let orderBy = 'distance_meters ASC';
    if (params.sortBy === 'price') {
      orderBy = 'c.price_per_unit ASC, distance_meters ASC';
    } else if (params.sortBy === 'rating') {
      orderBy = 'c.average_rating DESC NULLS LAST, distance_meters ASC';
    }

    const countQuery = `
      SELECT COUNT(DISTINCT c.id) as total
      FROM chargers c
      ${connectorJoin}
      WHERE ${whereClause}
    `;
    const countRes = await query(countQuery, values);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const searchQuery = `
      SELECT
        c.id,
        c.name,
        c.approximate_area,
        ST_Y(c.location::geometry) as latitude,
        ST_X(c.location::geometry) as longitude,
        c.listing_type,
        c.charging_type,
        c.pricing_model,
        c.price_per_unit,
        c.is_reservable,
        c.verification_status,
        c.average_rating,
        c.total_reviews,
        c.availability_status,
        c.availability_source,
        c.availability_updated_at,
        ROUND((ST_Distance(c.location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) / 1000)::numeric, 2) as distance_km,
        ST_Distance(c.location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) as distance_meters,
        (SELECT url FROM charger_photos WHERE charger_id = c.id ORDER BY is_primary DESC, created_at ASC LIMIT 1) as primary_photo_url,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'connectorType', conn.connector_type,
            'powerKw', conn.power_kw,
            'quantity', conn.quantity
          )) FROM charger_connectors conn WHERE conn.charger_id = c.id),
          '[]'::json
        ) as connectors
      FROM chargers c
      ${connectorJoin}
      WHERE ${whereClause}
      GROUP BY c.id
      ORDER BY ${orderBy}
      LIMIT $${valIdx} OFFSET $${valIdx + 1}
    `;

    const searchValues = [...values, limit, offset];
    const searchRes = await query(searchQuery, searchValues);

    const chargers: ChargerSearchResult[] = searchRes.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      approximateArea: row.approximate_area,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      listingType: row.listing_type,
      chargingType: row.charging_type,
      pricingModel: row.pricing_model,
      pricePerUnit: parseInt(row.price_per_unit, 10),
      isReservable: row.is_reservable,
      verificationStatus: row.verification_status,
      primaryPhotoUrl: row.primary_photo_url || null,
      averageRating: row.average_rating ? parseFloat(row.average_rating) : null,
      totalReviews: parseInt(row.total_reviews, 10),
      distanceKm: parseFloat(row.distance_km),
      availabilityStatus: row.availability_status,
      availabilitySource: row.availability_source,
      availabilityUpdatedAt: row.availability_updated_at,
      connectors: row.connectors || [],
    }));

    return { chargers, total, page, limit };
  }

  /**
   * Get single charger details by ID.
   */
  static async getById(id: string, viewerId?: string): Promise<Charger> {
    const res = await query(
      `SELECT
        c.id,
        c.host_id,
        u.email as host_email,
        p.full_name as host_name,
        c.name,
        c.address,
        c.approximate_area,
        ST_Y(c.location::geometry) as latitude,
        ST_X(c.location::geometry) as longitude,
        c.listing_type,
        c.status,
        c.charging_type,
        c.pricing_model,
        c.price_per_unit,
        c.parking_fee,
        c.operating_hours,
        c.access_instructions,
        c.is_reservable,
        c.verification_status,
        c.average_rating,
        c.total_reviews,
        c.availability_status,
        c.availability_source,
        c.availability_updated_at,
        c.created_at,
        c.updated_at,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', conn.id,
            'chargerId', conn.charger_id,
            'connectorType', conn.connector_type,
            'powerKw', conn.power_kw,
            'quantity', conn.quantity,
            'isOperational', conn.is_operational
          )) FROM charger_connectors conn WHERE conn.charger_id = c.id),
          '[]'::json
        ) as connectors,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', cp.id,
            'chargerId', cp.charger_id,
            'url', cp.url,
            'caption', cp.caption,
            'isPrimary', cp.is_primary,
            'createdAt', cp.created_at
          )) FROM charger_photos cp WHERE cp.charger_id = c.id),
          '[]'::json
        ) as photos
      FROM chargers c
      JOIN users u ON u.id = c.host_id
      LEFT JOIN user_profiles p ON p.user_id = u.id
      WHERE c.id = $1`,
      [id]
    );

    if (res.rows.length === 0) {
      throw new NotFoundError('Charger listing not found');
    }

    const row = res.rows[0];
    const isOwner = viewerId && viewerId === row.host_id;

    return {
      id: row.id,
      hostId: row.host_id,
      hostName: row.host_name || 'EV Host',
      name: row.name,
      // Privacy rule: Only show exact address and instructions to owner (or confirmed bookings later)
      address: isOwner || row.listing_type === 'public' ? row.address : `${row.approximate_area} (Address revealed upon booking)`,
      approximateArea: row.approximate_area,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      listingType: row.listing_type,
      status: row.status,
      chargingType: row.charging_type,
      pricingModel: row.pricing_model,
      pricePerUnit: parseInt(row.price_per_unit, 10),
      parkingFee: row.parking_fee ? parseInt(row.parking_fee, 10) : null,
      operatingHours: row.operating_hours,
      accessInstructions: isOwner ? row.access_instructions : null,
      isReservable: row.is_reservable,
      verificationStatus: row.verification_status,
      averageRating: row.average_rating ? parseFloat(row.average_rating) : null,
      totalReviews: parseInt(row.total_reviews, 10),
      distanceKm: null,
      availabilityStatus: row.availability_status,
      availabilitySource: row.availability_source,
      availabilityUpdatedAt: row.availability_updated_at,
      connectors: row.connectors,
      photos: row.photos,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Create a new charger listing (Host action).
   */
  static async create(hostId: string, input: CreateChargerInput): Promise<Charger> {
    await query('BEGIN');
    try {
      const chargerRes = await query(
        `INSERT INTO chargers (
          host_id, name, address, approximate_area, location, listing_type,
          status, charging_type, pricing_model, price_per_unit, parking_fee,
          operating_hours, access_instructions, is_reservable
        ) VALUES (
          $1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326)::geography, $7,
          'approved', $8, $9, $10, $11, $12, $13, $14
        ) RETURNING id`,
        [
          hostId,
          input.name,
          input.address,
          input.approximateArea,
          input.longitude,
          input.latitude,
          input.listingType || 'public',
          input.chargingType || 'AC',
          input.pricingModel || 'per_kwh',
          input.pricePerUnit,
          input.parkingFee || null,
          input.operatingHours || {},
          input.accessInstructions || null,
          input.isReservable ?? true,
        ]
      );
      const chargerId = chargerRes.rows[0].id;

      for (const conn of input.connectors) {
        await query(
          `INSERT INTO charger_connectors (charger_id, connector_type, power_kw, quantity)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (charger_id, connector_type) DO UPDATE SET power_kw = EXCLUDED.power_kw, quantity = EXCLUDED.quantity`,
          [chargerId, conn.connectorType, conn.powerKw, conn.quantity || 1]
        );
      }

      if (input.photos && input.photos.length > 0) {
        for (const p of input.photos) {
          await query(
            `INSERT INTO charger_photos (charger_id, url, caption, is_primary)
             VALUES ($1, $2, $3, $4)`,
            [chargerId, p.url, p.caption || null, p.isPrimary ?? false]
          );
        }
      }

      await query('COMMIT');
      return await this.getById(chargerId, hostId);
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  }

  /**
   * Update charger availability status.
   */
  static async updateAvailability(
    chargerId: string,
    hostId: string,
    status: 'available' | 'in_use' | 'offline',
    source: AvailabilitySource = 'host_confirmed'
  ): Promise<void> {
    const res = await query(
      `UPDATE chargers
       SET availability_status = $1,
           availability_source = $2,
           availability_updated_at = NOW(),
           updated_at = NOW()
       WHERE id = $3 AND host_id = $4
       RETURNING id`,
      [status, source, chargerId, hostId]
    );

    if (res.rows.length === 0) {
      throw new NotFoundError('Charger not found or permission denied');
    }
  }
}
