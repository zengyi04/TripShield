export interface WeatherSnapshot {
  icon: 'sunny' | 'partly-sunny' | 'cloudy' | 'rainy' | 'thunderstorm' | 'snow';
  emoji: string;
  condition: string;
  tempC: number;
  feelsLikeC: number;
  humidity: number;
  windKph: number;
  precipChance: number;
  source: string;
  live: boolean;
}

const WMO: { max: number; icon: WeatherSnapshot['icon']; emoji: string; condition: string }[] = [
  { max: 0, icon: 'sunny', emoji: '☀️', condition: 'Clear sky' },
  { max: 2, icon: 'partly-sunny', emoji: '⛅', condition: 'Partly cloudy' },
  { max: 3, icon: 'cloudy', emoji: '☁️', condition: 'Overcast' },
  { max: 48, icon: 'cloudy', emoji: '🌫️', condition: 'Fog' },
  { max: 57, icon: 'rainy', emoji: '🌦️', condition: 'Drizzle' },
  { max: 67, icon: 'rainy', emoji: '🌧️', condition: 'Rain' },
  { max: 77, icon: 'snow', emoji: '❄️', condition: 'Snow' },
  { max: 82, icon: 'rainy', emoji: '🌧️', condition: 'Rain showers' },
  { max: 86, icon: 'snow', emoji: '❄️', condition: 'Snow showers' },
  { max: 99, icon: 'thunderstorm', emoji: '⛈️', condition: 'Thunderstorm' },
];

function decodeWmo(code: number) {
  return WMO.find(row => code <= row.max) ?? WMO[WMO.length - 1];
}

export function parseHour(time: string): number {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 12;
  let hour = Number(match[1]);
  const mer = match[3].toUpperCase();
  if (mer === 'PM' && hour !== 12) hour += 12;
  if (mer === 'AM' && hour === 12) hour = 0;
  return hour;
}

export async function fetchPlaceWeather(
  lat: number,
  lng: number,
  isoDate: string,
  timeLabel: string,
  timezone: string,
  fallback: WeatherSnapshot,
): Promise<WeatherSnapshot> {
  try {
    const hour = parseHour(timeLabel);
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
      `&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m` +
      `&start_date=${isoDate}&end_date=${isoDate}&timezone=${encodeURIComponent(timezone)}`;
    const res = await fetch(url);
    if (!res.ok) return fallback;
    const data = await res.json();
    const times: string[] = data?.hourly?.time ?? [];
    const stamp = `${isoDate}T${String(hour).padStart(2, '0')}:00`;
    let idx = times.findIndex((t: string) => t.startsWith(stamp));
    if (idx < 0) idx = times.findIndex((t: string) => t.startsWith(isoDate));
    if (idx < 0) return fallback;
    const code = Number(data.hourly.weather_code?.[idx] ?? 2);
    const decoded = decodeWmo(code);
    return {
      icon: decoded.icon,
      emoji: decoded.emoji,
      condition: decoded.condition,
      tempC: Math.round(Number(data.hourly.temperature_2m?.[idx] ?? fallback.tempC)),
      feelsLikeC: Math.round(Number(data.hourly.apparent_temperature?.[idx] ?? fallback.feelsLikeC)),
      humidity: Math.round(Number(data.hourly.relative_humidity_2m?.[idx] ?? fallback.humidity)),
      windKph: Math.round(Number(data.hourly.wind_speed_10m?.[idx] ?? fallback.windKph)),
      precipChance: Math.round(Number(data.hourly.precipitation_probability?.[idx] ?? fallback.precipChance)),
      source: 'OpenWeather-compatible · Open-Meteo live',
      live: true,
    };
  } catch {
    return fallback;
  }
}
