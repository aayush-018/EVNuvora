import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, radii, typography } from '../../theme';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  style,
  textStyle,
}) => {
  const getBadgeColors = () => {
    switch (variant) {
      case 'success':
        return { bg: colors.successSoft, text: colors.success };
      case 'warning':
        return { bg: colors.warningSoft, text: colors.warning };
      case 'error':
        return { bg: colors.errorSoft, text: colors.error };
      case 'info':
        return { bg: colors.infoSoft, text: colors.info };
      case 'neutral':
        return { bg: colors.surface, text: colors.textSecondary };
      case 'primary':
      default:
        return { bg: colors.primarySoft, text: colors.primary };
    }
  };

  const currentColors = getBadgeColors();

  return (
    <View style={[styles.badge, { backgroundColor: currentColors.bg }, style]}>
      <Text style={[styles.badgeText, { color: currentColors.text }, textStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
});
