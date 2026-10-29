/**
 * Pricing constants and utility types.
 * 
 * All prices are in PAISE (1 INR = 100 paise).
 * This avoids floating-point errors in monetary calculations.
 * 
 * Example: ₹49.50 = 4950 paise
 */

/** Platform service fee percentage (applied to booking total) */
export const PLATFORM_SERVICE_FEE_PERCENT = 10; // 10%

/** Minimum booking amount in paise (₹50) */
export const MIN_BOOKING_AMOUNT_PAISE = 5000;

/** Maximum booking amount in paise (₹10,000) */
export const MAX_BOOKING_AMOUNT_PAISE = 1000000;

/** Currency code */
export const CURRENCY = 'INR' as const;

/** Currency symbol */
export const CURRENCY_SYMBOL = '₹';

/**
 * Format paise amount to INR display string.
 * 
 * @example
 * formatPaise(4950)  // "₹49.50"
 * formatPaise(100)   // "₹1.00"
 * formatPaise(0)     // "₹0.00"
 */
export function formatPaise(paise: number): string {
  const rupees = paise / 100;
  return `${CURRENCY_SYMBOL}${rupees.toFixed(2)}`;
}

/**
 * Format paise to a compact display.
 * 
 * @example
 * formatPaiseCompact(4950)  // "₹49.50"
 * formatPaiseCompact(4900)  // "₹49"
 * formatPaiseCompact(500)   // "₹5"
 */
export function formatPaiseCompact(paise: number): string {
  const rupees = paise / 100;
  if (rupees % 1 === 0) {
    return `${CURRENCY_SYMBOL}${rupees}`;
  }
  return `${CURRENCY_SYMBOL}${rupees.toFixed(2)}`;
}

/**
 * Calculate platform service fee.
 * Rounds up to nearest paisa to avoid undercharging.
 */
export function calculateServiceFee(baseAmountPaise: number): number {
  return Math.ceil(baseAmountPaise * PLATFORM_SERVICE_FEE_PERCENT / 100);
}

/**
 * Pricing model display labels.
 */
export const PRICING_MODEL_LABELS = {
  per_kwh: '/kWh',
  per_hour: '/hr',
  per_slot: '/slot',
  fixed: ' flat',
} as const;
