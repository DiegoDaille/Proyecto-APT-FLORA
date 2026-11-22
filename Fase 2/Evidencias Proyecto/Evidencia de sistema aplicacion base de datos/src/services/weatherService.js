/**
 * weatherService.js - Clima local con Open-Meteo (sin API key) + expo-location.
 *  - La ubicación se redondea a 2 decimales (~1 km) antes de enviarla.
 *  - Caché de 1 h en AsyncStorage; sin red se muestra el último dato guardado.
 *  - Solo SUGIERE (wateringAdvice): no modifica las fechas de la agenda.
 */
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'weather_cache_v1';
const CACHE_MS = 60 * 60 * 1000;
const TIMEOUT_MS = 8000;

const makeError = (code, message) => Object.assign(new Error(message ?? code), { code });

/** Códigos WMO de Open-Meteo -> etiqueta + ícono de Ionicons */
export function describeWeather(code) {
  if (code === 0) return { label: 'Despejado', icon: 'sunny' };
  if (code <= 3) return { label: 'Parcialmente nublado', icon: 'partly-sunny' };
  if (code === 45 || code === 48) return { label: 'Neblina', icon: 'cloudy' };
  if (code >= 51 && code <= 57) return { label: 'Llovizna', icon: 'rainy' };
  if (code >= 61 && code <= 67) return { label: 'Lluvia', icon: 'rainy' };
  if (code >= 71 && code <= 77) return { label: 'Nieve', icon: 'snow' };
  if (code >= 80 && code <= 82) return { label: 'Chubascos', icon: 'rainy' };
  if (code >= 95) return { label: 'Tormenta', icon: 'thunderstorm' };
  return { label: 'Nublado', icon: 'cloud' };
}

export async function hasWeatherPermission() {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status === 'granted';
}

export async function requestWeatherPermission() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

async function readCache() {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw makeError('network', `HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/** @returns {Promise<{temp, humidity, code, tempMax, rainMm, rainProb, label, icon, at, cached?, stale?}>} */
export async function getWeather({ force = false } = {}) {
  const cached = await readCache();
  if (!force && cached && Date.now() - cached.at < CACHE_MS) return { ...cached, cached: true };
  if (!(await hasWeatherPermission())) throw makeError('permission');

  try {
    const pos =
      (await Location.getLastKnownPositionAsync()) ??
      (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }));
    const { latitude, longitude } = pos.coords;

    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude.toFixed(2)}&longitude=${longitude.toFixed(2)}` +
      '&current=temperature_2m,relative_humidity_2m,weather_code' +
      '&daily=temperature_2m_max,precipitation_sum,precipitation_probability_max' +
      '&timezone=auto&forecast_days=1';
    const data = await fetchJson(url);

    const result = {
      temp: Math.round(data.current.temperature_2m),
      humidity: data.current.relative_humidity_2m,
      code: data.current.weather_code,
      tempMax: Math.round(data.daily.temperature_2m_max[0]),
      rainMm: data.daily.precipitation_sum[0] ?? 0,
      rainProb: data.daily.precipitation_probability_max[0] ?? 0,
      at: Date.now(),
      ...describeWeather(data.current.weather_code),
    };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(result)).catch(() => {});
    return result;
  } catch (error) {
    if (cached) return { ...cached, cached: true, stale: true }; // sin red: último dato conocido
    throw error?.code ? error : makeError('network');
  }
}

/** Consejo de riego según el clima. Devuelve texto o null. */
export function wateringAdvice(weather, plants = []) {
  if (!weather) return null;
  const hasOutdoor = plants.some((p) => p.ubicacion === 'exterior');
  if (hasOutdoor && (weather.rainMm >= 3 || weather.rainProb >= 70)) {
    return `Hoy llueve (${weather.rainMm} mm): puedes saltar el riego de tus plantas de exterior.`;
  }
  if (weather.tempMax >= 30) return 'Hace calor: revisa que el sustrato no se seque demasiado.';
  if (weather.tempMax <= 8) return 'Hace frío: las plantas gastan menos agua, evita regar de más.';
  return null;
}
