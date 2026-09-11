import React from 'react';
import { Text, View } from 'react-native';
import { STATUS_COLOR, ledgerStyles as s } from '../utils/ledgerTheme';

export default function LedgerStatusPill({ status }: { status: 'onTrack' | 'warning' | 'over' }) {
  const colors = STATUS_COLOR[status];
  const label = status === 'onTrack' ? 'On Track' : status === 'warning' ? 'Watch Spending' : 'Over Budget';
  return (
    <View style={[s.statPill, { backgroundColor: colors.bg }]}>
      <View style={[s.statPillDot, { backgroundColor: colors.dot }]} />
      <Text style={[s.statPillText, { color: colors.text }]}>{label}</Text>
    </View>
  );
}
