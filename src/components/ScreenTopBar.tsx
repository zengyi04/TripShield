import React from 'react';
import { Pressable, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ledgerStyles as s } from '../utils/ledgerTheme';

type ScreenTopBarProps = {
  title: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  style?: ViewStyle;
};

/** Shared top bar — matches Ledger header theme (size, color, padding). */
export function ScreenTopBar({ title, left, right, style }: ScreenTopBarProps) {
  return (
    <View style={[s.header, style]}>
      {left ?? <View style={s.headerSideSpacer} />}
      <View style={s.headerTitleWrap}>
        <Text style={s.headerTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>
      {right ?? <View style={s.headerSideSpacer} />}
    </View>
  );
}

export function HeaderIconButton({
  onPress,
  children,
  accessibilityLabel,
}: {
  onPress?: () => void;
  children: React.ReactNode;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [s.iconCircle, pressed && s.pressedGlass]}
    >
      {children}
    </Pressable>
  );
}

/** Left back control — same pattern as Buy Window. */
export function HeaderBackButton({
  onPress,
  accessibilityLabel = 'Back',
}: {
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  return (
    <HeaderIconButton onPress={onPress} accessibilityLabel={accessibilityLabel}>
      <Ionicons name="chevron-back" size={20} color="#1f2937" />
    </HeaderIconButton>
  );
}
