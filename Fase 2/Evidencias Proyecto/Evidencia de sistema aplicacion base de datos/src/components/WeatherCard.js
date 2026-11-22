/**
 * WeatherCard.js - Clima local y consejo de riego (Open-Meteo). Pide el permiso solo al tocar el botón.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../context/ThemeContext';
import {
  getWeather,
  hasWeatherPermission,
  requestWeatherPermission,
  wateringAdvice,
} from '../services/weatherService';

export default function WeatherCard({ plants = [] }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [state, setState] = useState('loading'); // loading | ready | denied | error
  const [weather, setWeather] = useState(null);

  const load = useCallback(async () => {
    setState('loading');
    try {
      setWeather(await getWeather());
      setState('ready');
    } catch (error) {
      setState(error?.code === 'permission' ? 'denied' : 'error');
    }
  }, []);

  useEffect(() => {
    hasWeatherPermission()
      .then((ok) => (ok ? load() : setState('denied')))
      .catch(() => setState('error'));
  }, [load]);

  const enable = async () => {
    try {
      if (await requestWeatherPermission()) load();
    } catch {
      setState('error');
    }
  };

  if (state === 'loading') {
    return (
      <View style={styles.card}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (state === 'denied' || state === 'error') {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={state === 'denied' ? enable : load}
        accessibilityRole="button"
      >
        <View style={styles.row}>
          <Ionicons name="partly-sunny-outline" size={22} color={colors.primary} />
          <Text style={styles.cta}>
            {state === 'denied'
              ? 'Activar clima local (usa tu ubicación)'
              : 'No pudimos cargar el clima. Toca para reintentar'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  const advice = wateringAdvice(weather, plants);
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Ionicons name={weather.icon} size={30} color={colors.primary} />
        <View style={styles.info}>
          <Text style={styles.temp}>
            {weather.temp}°C · {weather.label}
          </Text>
          <Text style={styles.sub}>
            Humedad {weather.humidity}% · Lluvia hoy {weather.rainMm} mm
            {weather.stale ? ' · sin conexión' : ''}
          </Text>
        </View>
      </View>
      {advice ? <Text style={styles.advice}>{advice}</Text> : null}
    </View>
  );
}

const makeStyles = (c) => ({
  card: { backgroundColor: c.tint, borderRadius: 14, padding: 12, marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  info: { flex: 1 },
  temp: { fontSize: 15, fontWeight: '700', color: c.text },
  sub: { fontSize: 12, color: c.textMuted, marginTop: 2 },
  advice: { fontSize: 12, color: c.primaryDark, marginTop: 8, fontWeight: '600' },
  cta: { flex: 1, fontSize: 13, fontWeight: '600', color: c.primaryDark },
});
