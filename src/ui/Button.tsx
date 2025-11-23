import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, spacing } from '../lib/theme';
import { Text } from './Text';

export type ButtonProps = {
  intent?: 'primary' | 'secondary';
  size?: 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
  children: React.ReactNode;
  testID?: string;
  accessibilityLabel?: string;
  style?: ViewStyle;
};

export const Button: React.FC<ButtonProps> = ({
  intent = 'primary',
  size = 'md',
  disabled,
  loading,
  onPress,
  children,
  testID,
  accessibilityLabel,
  style,
}) => {
  const backgroundColor = intent === 'primary' ? colors.primary : colors.surface;
  const textColor = intent === 'primary' ? colors.onPrimary : colors.primary;
  const height = size === 'lg' ? 56 : 44;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor, height, opacity: disabled ? 0.6 : 1 },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{children}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  text: {
    fontWeight: '600',
    fontSize: 16,
  },
});
