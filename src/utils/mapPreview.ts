function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function bboxForCenter(lat: number, lng: number, width: number, height: number, zoom: number) {
  const scale = (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);
  const latDelta = ((height / 2) * scale) / 111320;
  const lngDelta = ((width / 2) * scale) / (111320 * Math.cos((lat * Math.PI) / 180));
  return {
    west: lng - lngDelta,
    south: clamp(lat - latDelta, -85, 85),
    east: lng + lngDelta,
    north: clamp(lat + latDelta, -85, 85),
  };
}

function arcgisExportUrl(
  service: 'World_Imagery' | 'World_Street_Map',
  lat: number,
  lng: number,
  width: number,
  height: number,
  zoom: number,
): string {
  const { west, south, east, north } = bboxForCenter(lat, lng, width, height, zoom);
  const params = new URLSearchParams({
    bbox: `${west},${south},${east},${north}`,
    bboxSR: '4326',
    imageSR: '4326',
    size: `${width},${height}`,
    format: 'jpg',
    f: 'image',
  });
  return `https://services.arcgisonline.com/arcgis/rest/services/${service}/MapServer/export?${params.toString()}`;
}

/** Satellite-style map export (works on mobile without API keys). */
export function arcgisImageryPreviewUrl(lat: number, lng: number, width = 640, height = 280, zoom = 14): string {
  return arcgisExportUrl('World_Imagery', lat, lng, width, height, zoom);
}

/** Street map export fallback. */
export function arcgisStreetPreviewUrl(lat: number, lng: number, width = 640, height = 280, zoom = 14): string {
  return arcgisExportUrl('World_Street_Map', lat, lng, width, height, zoom);
}

export function yandexStaticPreviewUrl(lat: number, lng: number, width = 640, height = 280, zoom = 14): string {
  return `https://static-maps.yandex.ru/1.x/?lang=en-US&ll=${lng},${lat}&z=${zoom}&l=map&size=${width},${height}&pt=${lng},${lat},pm2rdm`;
}

/** Ordered fallbacks: real map imagery first, then optional place photo. */
export function buildRouteMapPreviewUrls(
  lat: number,
  lng: number,
  previewImageUrl?: string,
  width = 640,
  height = 280,
): string[] {
  const urls = [
    arcgisImageryPreviewUrl(lat, lng, width, height, 14),
    arcgisStreetPreviewUrl(lat, lng, width, height, 14),
    yandexStaticPreviewUrl(lat, lng, width, height, 14),
  ];
  if (previewImageUrl) urls.unshift(previewImageUrl);
  return urls;
}

/** Optional Wikimedia / CDN photos keyed by mapsQuery. */
export const PLACE_PREVIEW_IMAGES: Record<string, string> = {
  'Shenzhen Baoan International Airport T3':
    'https://upload.wikimedia.org/wikipedia/commons/8/8d/Shenzhen_Bao%27an_Airport.jpg',
  'Renaissance Shenzhen Hotel Futian':
    'https://upload.wikimedia.org/wikipedia/commons/9/9f/SZ_%E6%B7%B1%E5%9C%B3_Shenzhen_%E7%BE%85%E6%B9%96_Luohu_Dongmen_South_Road_Jiabin_Road_%E5%BD%AD%E5%B9%B4%E8%90%AC%E9%BA%97%E9%85%92%E5%BA%97_Panglin_Renaissance_Hotel_Hotel_1252pm_February_2025_R12S_08.jpg',
  'OCT-LOFT Creative Park Shenzhen':
    'https://upload.wikimedia.org/wikipedia/commons/5/59/OCT_LOFT%2C_SHENZHEN_%2822%29.jpg',
};

export function resolvePlacePreviewUrl(mapsQuery: string, previewImageUrl?: string): string | undefined {
  if (previewImageUrl) return previewImageUrl;
  return PLACE_PREVIEW_IMAGES[mapsQuery];
}
