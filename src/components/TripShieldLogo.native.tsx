import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function TripShieldLogoNative({ size = 96 }: { size?: number }) {
  return (
    <View style={[styles.logoBase, { width: size, height: size, borderRadius: size / 2 }]}>
      <View
        style={[
          styles.logoCore,
          { width: size * 0.76, height: size * 0.76, borderRadius: size * 0.38 },
        ]}
      >
        <Ionicons name="location" size={size * 0.56} color="rgba(255,255,255,0.92)" />
        <Ionicons
          name="airplane"
          size={size * 0.26}
          color="#B7D4F2"
          style={styles.logoPlaneIcon}
        />
      </View>
    </View>
  );
}

export function TripShieldBrandLockup({
  logoSize = 28,
  nameStyle,
}: {
  logoSize?: number;
  nameStyle?: object;
}) {
  return (
    <View style={styles.brandRow}>
      <TripShieldLogoNative size={logoSize} />
      <Text style={[styles.brandName, nameStyle]}>TripShield</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandName: { color: '#0f172a', fontSize: 15, fontWeight: '900', letterSpacing: -0.3 },
  logoBase: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  logoCore: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'rgba(95,145,202,0.72)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    overflow: 'hidden',
  },
  logoPlaneIcon: {
    position: 'absolute',
    left: '38%',
    top: '36%',
    transform: [{ rotate: '35deg' }],
  },
});
