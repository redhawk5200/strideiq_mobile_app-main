import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { colors } from '../lib/theme';

export type TextProps = RNTextProps & {
  intent?: 'default' | 'muted' | 'heading';
  testID?: string;
  accessibilityLabel?: string;
};

export const Text: React.FC<TextProps> = ({
  intent = 'default',
  style,
  children,
  testID,
  accessibilityLabel,
  ...rest
}) => {
  let textStyle = styles.default;
  if (intent === 'muted') textStyle = styles.muted;
  if (intent === 'heading') textStyle = styles.heading;

  return (
    <RNText
      style={[textStyle, style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      {...rest}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  default: {
    color: colors.text,
    fontSize: 16,
  },
  muted: {
    color: colors.muted,
    fontSize: 14,
  },
  heading: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 28,
  },
});
