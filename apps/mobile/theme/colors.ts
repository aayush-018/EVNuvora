/**
 * ChargeKaro Design System - Colors
 * High-contrast, accessibility-checked colors tailored for Indian EV mobility.
 */
export const colors = {
  // Brand colors
  primary: '#00B86B',         // Electric Green
  primaryDark: '#008F53',
  primaryLight: '#33C689',
  primarySoft: '#E6F8F0',     // Light green background tint

  secondary: '#1A1A2E',       // Deep Navy
  secondaryDark: '#0F0F1B',
  secondaryLight: '#2C2C47',

  accent: '#FFB800',          // Warm Amber (Status / Warning)
  accentSoft: '#FFF8E6',

  // Status & Semantics
  success: '#00B86B',
  successSoft: '#E6F8F0',
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
  error: '#EF4444',
  errorSoft: '#FEE2E2',
  info: '#3B82F6',
  infoSoft: '#EFF6FF',

  // Neutrals / Surfaces
  background: '#F8FAFC',
  card: '#FFFFFF',
  surface: '#F1F5F9',
  surfaceBorder: '#E2E8F0',

  // Typography
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Indian EV Connector Color Coding
  connectors: {
    type2: '#3B82F6',         // Blue (Standard AC)
    ccs2: '#00B86B',          // Fast Green (DC Fast)
    chademo: '#8B5CF6',       // Purple
    iec60309: '#06B6D4',      // Cyan
    indian_socket: '#F97316', // Orange
    gbt_ac: '#EC4899',        // Pink
    gbt_dc: '#10B981',        // Emerald
  }
};
