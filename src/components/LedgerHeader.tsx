import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ledgerStyles as s } from '../utils/ledgerTheme';

export default function LedgerHeader({
  title,
  subtitle,
  onBack,
  right,
  onSubtitleChange,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  onSubtitleChange?: (value: string) => void;
}) {
  return (
    <View style={s.header}>
      {onBack ? (
        <Pressable onPress={onBack} style={({ pressed }) => [s.iconCircle, pressed && s.pressedGlass]}>
          <Ionicons name="chevron-back" size={20} color="#1f2937" />
        </Pressable>
      ) : (
        <View style={s.headerSideSpacer} />
      )}
      <View style={s.headerTitleWrap}>
        <Text style={s.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle !== undefined && subtitle !== ''
          ? onSubtitleChange
            ? (
                <TextInput
                  value={subtitle}
                  onChangeText={onSubtitleChange}
                  style={[s.headerSubtitle, { padding: 0 }]}
                  placeholder="Merchant name"
                  placeholderTextColor="rgba(31,41,55,0.45)"
                />
              )
            : (
                <Text style={s.headerSubtitle}>{subtitle}</Text>
              )
          : null}
      </View>
      {right || <View style={s.headerSideSpacer} />}
    </View>
  );
}
