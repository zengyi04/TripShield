import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../types';
import { CATEGORY_COLOR, CATEGORY_ICON, ledgerStyles as s } from '../utils/ledgerTheme';

export default function LedgerCategoryIcon({ category, size = 20 }: { category: Category; size?: number }) {
  return (
    <View style={[s.categoryIconWrap, { backgroundColor: `${CATEGORY_COLOR[category]}26` }]}>
      <Ionicons name={CATEGORY_ICON[category] as any} size={size} color={CATEGORY_COLOR[category]} />
    </View>
  );
}
