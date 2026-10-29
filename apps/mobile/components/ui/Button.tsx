import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, spacing, radii, typography } from '../../theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  ...props
}) => {
  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'secondary':
        return {
          container: { backgroundColor: colors.secondary },
          text: { color: colors.textInverse },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: colors.primary,
          },
          text: { color: colors.primary },
        };
      case 'ghost':
        return {
          container: { backgroundColor: 'transparent' },
          text: { color: colors.textPrimary },
        };
      case 'danger':
        return {
          container: { backgroundColor: colors.error },
          text: { color: colors.textInverse },
        };
      case 'primary':
      default:
        return {
          container: { backgroundColor: colors.primary },
          text: { color: colors.textInverse },
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md, height: 36 },
          text: { fontSize: typography.sizes.sm },
        };
      case 'lg':
        return {
          container: { paddingVertical: spacing.md, paddingHorizontal: spacing.xxl, height: 56 },
          text: { fontSize: typography.sizes.lg },
        };
      case 'md':
      default:
        return {
          container: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, height: 48 },
          text: { fontSize: typography.sizes.md },
        };
    }
  };

  const vStyles = getVariantStyles();
  const sStyles = getSizeStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={disabled || loading}
      style={[
        styles.baseButton,
        vStyles.container,
        sStyles.container,
        disabled && styles.disabledButton,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={vStyles.text.color} size="small" />
      ) : (
        <Text
          style={[
            styles.baseText,
            vStyles.text,
            sStyles.text,
            disabled && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  baseText: {
    fontWeight: typography.weights.semibold,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: colors.textMuted,
  },
});
