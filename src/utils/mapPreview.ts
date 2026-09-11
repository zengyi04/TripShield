import type { ActivityType } from '../data/tripRooms';

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

function arcgisStreetExportUrl(lat: number, lng: number, width: number, height: number, zoom: number): string {
  const { west, south, east, north } = bboxForCenter(lat, lng, width, height, zoom);
  const params = new URLSearchParams({
    bbox: `${west},${south},${east},${north}`,
    bboxSR: '4326',
    imageSR: '4326',
    size: `${width},${height}`,
    format: 'jpg',
    f: 'image',
  });
  return `https://services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer/export?${params.toString()}`;
}

export function arcgisStreetPreviewUrl(lat: number, lng: number, width = 640, height = 280, zoom = 16): string {
  return arcgisStreetExportUrl(lat, lng, width, height, zoom);
}

export function yandexStaticPreviewUrl(lat: number, lng: number, width = 640, height = 280, zoom = 16): string {
  return `https://static-maps.yandex.ru/1.x/?lang=en-US&ll=${lng},${lat}&z=${zoom}&l=map&size=${width},${height}&pt=${lng},${lat},pm2rdm`;
}

/** Demo photos: city blocks, terminals, towers — no satellite. */
const PLACE_BUILDING_IMAGES: Record<string, string> = {
  'Shenzhen Baoan International Airport T3':
    'https://upload.wikimedia.org/wikipedia/commons/8/8d/Shenzhen_Bao%27an_Airport.jpg',
  'Renaissance Shenzhen Hotel Futian':
    'https://upload.wikimedia.org/wikipedia/commons/9/9f/SZ_%E6%B7%B1%E5%9C%B3_Shenzhen_%E7%BE%85%E6%B9%96_Luohu_Dongmen_South_Road_Jiabin_Road_%E5%BD%AD%E5%B9%B4%E8%90%AC%E9%BA%97%E9%85%92%E5%BA%97_Panglin_Renaissance_Hotel_Hotel_1252pm_February_2025_R12S_08.jpg',
  'OCT-LOFT Creative Park Shenzhen':
    'https://upload.wikimedia.org/wikipedia/commons/5/59/OCT_LOFT%2C_SHENZHEN_%2822%29.jpg',
  'Huaqiangbei Electronics Market':
    'https://upload.wikimedia.org/wikipedia/commons/5/5f/Entrance_of_Huaqiangbei%2C_2017.jpg',
  'Tencent Binhai Building Shenzhen':
    'https://upload.wikimedia.org/wikipedia/commons/4/4f/Futian_CBD_Shenzhen.jpg',
  'Ping An Finance Center Shenzhen':
    'https://upload.wikimedia.org/wikipedia/commons/4/4f/Futian_CBD_Shenzhen.jpg',
  'Shenzhen Museum Civic Center':
    'https://upload.wikimedia.org/wikipedia/commons/4/4f/Futian_CBD_Shenzhen.jpg',
  'Shenzhen Museum of Contemporary Art':
    'https://upload.wikimedia.org/wikipedia/commons/5/59/OCT_LOFT%2C_SHENZHEN_%2822%29.jpg',
  'Hai Di Lao MixC Shenzhen':
    'https://upload.wikimedia.org/wikipedia/commons/5/5f/Entrance_of_Huaqiangbei%2C_2017.jpg',
  'Narita Airport Terminal 2':
    'https://upload.wikimedia.org/wikipedia/commons/3/3f/Narita_International_Airport_Terminal_1.jpg',
  'Suvarnabhumi Airport':
    'https://upload.wikimedia.org/wikipedia/commons/6/6c/Suvarnabhumi_Airport_%28cropped%29.jpg',
  'Grand Palace Bangkok':
    'https://upload.wikimedia.org/wikipedia/commons/7/7f/Grand_Palace_Bangkok.jpg',
  'Senso-ji Temple Asakusa':
    'https://upload.wikimedia.org/wikipedia/commons/4/4b/Senso-ji_April_2019.jpg',
  'Tokyo National Museum':
    'https://upload.wikimedia.org/wikipedia/commons/4/40/Tokyo_National_Museum%2C_Honkan_2010.jpg',
  'MBK Center Bangkok':
    'https://upload.wikimedia.org/wikipedia/commons/6/6a/MBK_Center%2C_Bangkok.jpg',
};

const TYPE_BUILDING_IMAGES: Record<ActivityType, string> = {
  flight:
    'https://upload.wikimedia.org/wikipedia/commons/8/8d/Shenzhen_Bao%27an_Airport.jpg',
  hotel:
    'https://upload.wikimedia.org/wikipedia/commons/4/4f/Futian_CBD_Shenzhen.jpg',
  food:
    'https://upload.wikimedia.org/wikipedia/commons/5/5f/Entrance_of_Huaqiangbei%2C_2017.jpg',
  attraction:
    'https://upload.wikimedia.org/wikipedia/commons/5/59/OCT_LOFT%2C_SHENZHEN_%2822%29.jpg',
  transport:
    'https://upload.wikimedia.org/wikipedia/commons/5/5f/Entrance_of_Huaqiangbei%2C_2017.jpg',
};

/** Rotating urban / route-themed demo stills when no place match. */
const BUILDING_ROUTE_DEMO_POOL: string[] = [
  'https://upload.wikimedia.org/wikipedia/commons/5/5f/Entrance_of_Huaqiangbei%2C_2017.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/5/59/OCT_LOFT%2C_SHENZHEN_%2822%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/4/4f/Futian_CBD_Shenzhen.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/8/8d/Shenzhen_Bao%27an_Airport.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/3/3f/Narita_International_Airport_Terminal_1.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/4/4b/Senso-ji_April_2019.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/6/6a/MBK_Center%2C_Bangkok.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/7/7f/Grand_Palace_Bangkok.jpg',
];

function pickFromPool(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash + key.charCodeAt(i) * (i + 3)) % BUILDING_ROUTE_DEMO_POOL.length;
  }
  return BUILDING_ROUTE_DEMO_POOL[hash];
}

export function resolveRoutePreviewImage(
  mapsQuery: string,
  activityType: ActivityType,
  previewImageUrl?: string,
): string {
  if (previewImageUrl) return previewImageUrl;
  if (PLACE_BUILDING_IMAGES[mapsQuery]) return PLACE_BUILDING_IMAGES[mapsQuery];
  return TYPE_BUILDING_IMAGES[activityType] ?? pickFromPool(mapsQuery);
}

/** Street maps + building demo photo only (no satellite). */
export function buildRouteMapPreviewUrls(
  lat: number,
  lng: number,
  options: {
    previewImageUrl?: string;
    mapsQuery: string;
    activityType: ActivityType;
  },
  width = 640,
  height = 280,
): string[] {
  const demo = resolveRoutePreviewImage(options.mapsQuery, options.activityType, options.previewImageUrl);
  return [
    demo,
    arcgisStreetPreviewUrl(lat, lng, width, height, 16),
    yandexStaticPreviewUrl(lat, lng, width, height, 16),
  ];
}

/** @deprecated use resolveRoutePreviewImage */
export function resolvePlacePreviewUrl(mapsQuery: string, previewImageUrl?: string): string | undefined {
  if (previewImageUrl) return previewImageUrl;
  return PLACE_BUILDING_IMAGES[mapsQuery];
}
