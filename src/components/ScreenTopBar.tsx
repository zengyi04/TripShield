import React from 'react';
import { Pressable, Text, View, ViewStyle } from 'react-native';
import { appThemeStyles } from '../utils/appThemeStyles';

type ScreenTopBarProps = {
  title: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  style?: ViewStyle;
};

export function ScreenTopBar({ title, left, right, style }: ScreenTopBarProps) {
  return (
    <View style={[appThemeStyles.homeHeaderBar, appThemeStyles.screenHeaderRow, style]}>
      {left ?? <View style={appThemeStyles.headerSideSlot} />}
      <Text style={appThemeStyles.screenHeaderTitle} numberOfLines={1}>
        {title}
      </Text>
      {right ?? <View style={appThemeStyles.headerSideSlot} />}
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
      style={({ pressed }) => [appThemeStyles.headerIconBtn, pressed && { opacity: 0.85 }]}
    >
      {children}
    </Pressable>
  );
}
