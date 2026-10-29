import { z } from 'zod';

export const createVehicleSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().int().min(2000).max(new Date().getFullYear() + 1),
  batteryCapacityKwh: z.number().positive().optional(),
  rangeKm: z.number().int().positive().optional(),
  connectorTypes: z.array(z.enum([
    'type2',
    'ccs2',
    'chademo',
    'iec60309',
    'indian_socket',
    'gbt_ac',
    'gbt_dc'
  ])).min(1, 'At least one connector type is required'),
  isDefault: z.boolean().optional(),
});
