import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { buildRouteMapPreviewUrls } from '../utils/mapPreview';

type RouteMapPreviewProps = {
  lat: number;
  lng: number;
  previewImageUrl?: string;
  style?: ViewStyle;
  height?: number;
};

export function RouteMapPreview({ lat, lng, previewImageUrl, style, height = 140 }: RouteMapPreviewProps) {
  const urls = useMemo(
    () => buildRouteMapPreviewUrls(lat, lng, previewImageUrl, 640, Math.round(height * 2)),
    [lat, lng, previewImageUrl, height],
  );
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failedAll, setFailedAll] = useState(false);

  const uri = urls[Math.min(index, urls.length - 1)];

  return (
    <View style={[styles.frame, { height }, style]}>
      {!failedAll ? (
        <>
          {loading ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color="#2563eb" />
            </View>
          ) : null}
          <Image
            key={uri}
            source={{ uri }}
            style={styles.image}
            resizeMode="cover"
            accessibilityLabel="Route map preview"
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              if (index < urls.length - 1) {
                setIndex(prev => prev + 1);
                setLoading(true);
              } else {
                setLoading(false);
                setFailedAll(true);
              }
            }}
          />
        </>
      ) : (
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>Map preview unavailable — use Open in Google Maps below.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#dbeafe',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(219,234,254,0.65)',
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  fallbackText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1e3a8a',
    textAlign: 'center',
    lineHeight: 16,
  },
});
