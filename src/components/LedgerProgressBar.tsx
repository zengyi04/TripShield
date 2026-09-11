import React from 'react';
import { View } from 'react-native';
import { ledgerStyles as s } from '../utils/ledgerTheme';

export default function LedgerProgressBar({
  value,
  max,
  color,
  light,
}: {
  value: number;
  max: number;
  color: string;
  light?: boolean;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <View style={light ? s.progressTrackLight : s.progressTrack}>
      <View style={[s.progressFill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}
