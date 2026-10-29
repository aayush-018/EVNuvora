import { z } from 'zod';

export const chargerSearchQuerySchema = z.object({
  latitude: z.string().transform(Number).refine(n => !isNaN(n) && n >= -90 && n <= 90, 'Invalid latitude'),
  longitude: z.string().transform(Number).refine(n => !isNaN(n) && n >= -180 && n <= 180, 'Invalid longitude'),
  radiusKm: z.string().transform(Number).optional(),
  connectorTypes: z.string().transform(s => s.split(',')).optional(),
  chargingType: z.enum(['AC', 'DC', 'AC_DC']).optional(),
  minPowerKw: z.string().transform(Number).optional(),
  maxPricePerUnit: z.string().transform(Number).optional(),
  listingType: z.enum(['public', 'shared', 'private']).optional(),
  isReservable: z.string().transform(s => s === 'true').optional(),
  availabilityStatus: z.enum(['available', 'in_use']).optional(),
  sortBy: z.enum(['distance', 'price', 'rating']).optional(),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
});

export const createChargerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  address: z.string().min(5, 'Address is required'),
  approximateArea: z.string().min(2, 'Approximate area is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  listingType: z.enum(['public', 'shared', 'private']).default('public'),
  chargingType: z.enum(['AC', 'DC', 'AC_DC']).default('AC'),
  pricingModel: z.enum(['per_kwh', 'per_hour', 'per_slot', 'fixed']).default('per_kwh'),
  pricePerUnit: z.number().int().positive('Price per unit in paise must be positive'),
  parkingFee: z.number().int().nonnegative().optional().nullable(),
  operatingHours: z.record(z.any()).optional(),
  accessInstructions: z.string().optional(),
  isReservable: z.boolean().default(true),
  connectors: z.array(z.object({
    connectorType: z.enum(['type2', 'ccs2', 'chademo', 'iec60309', 'indian_socket', 'gbt_ac', 'gbt_dc']),
    powerKw: z.number().positive(),
    quantity: z.number().int().positive().default(1),
  })).min(1, 'At least one connector must be specified'),
  photos: z.array(z.object({
    url: z.string().url('Invalid photo URL'),
    caption: z.string().optional(),
    isPrimary: z.boolean().optional(),
  })).optional(),
});

export const updateAvailabilitySchema = z.object({
  status: z.enum(['available', 'in_use', 'offline']),
  source: z.enum(['api_confirmed', 'hardware_confirmed', 'host_confirmed', 'user_reported', 'unknown']).optional(),
});
