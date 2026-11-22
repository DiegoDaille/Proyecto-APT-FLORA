// flora_app/src/components/SeasonalClimateCard.js
/**
 * SeasonalClimateCard - Tarjeta de clima estacional (hemisferio sur, hora de Santiago).
 * Se muestra justo debajo de las métricas del escaneo y adapta el consejo a lo detectado:
 *   <SeasonalClimateCard symptom="falta" baseDays={7} />          (diagnóstico: hojas secas)
 *   <SeasonalClimateCard verdict="ideal" species={...} />          (compatibilidad)
 * Cero llamadas externas: se calcula en el teléfono (Offline-First, 0 ms).
 */
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../context/ThemeContext';
import { buildSeasonalAdvice } from '../utils/seasonal';

export default function SeasonalClimateCard({
  species = null,
  symptom = null,
  verdict = null,
  ubicacion = null,
  light = null,
  baseDays = null,
  date,
  style,
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const advice = useMemo(
    () =>
      buildSeasonalAdvice({
        date: date ?? new Date(),
        species,
        symptom,
        verdict,
        ubicacion,
        light,
        baseDays,
      }),
    [date, species, symptom, verdict, ubicacion, light, baseDays]
  );

  const opacity = useRef(new Animated.Value(0)).current;
  const shift = useRef(new Animated.Value(10)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.timing(shift, { toValue: 0, duration: 320, useNativeDriver: true }),
    ]).start();
  }, [opacity, shift]);

  const tone = {
    ok: { bg: colors.tint, fg: colors.primaryDark, icon: 'checkmark-circle' },
    warning: { bg: colors.warningTint ?? '#FFF3E0', fg: colors.warning, icon: 'alert-circle' },
    info: { bg: colors.accentTint, fg: colors.accentDark ?? colors.accent, icon: 'information-circle' },
  }[advice.tone];

  return (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: tone.bg, opacity, transform: [{ translateY: shift }] },
        style,
      ]}
      accessibilityLabel={`Clima estacional, ${advice.label}. ${advice.headline}. ${advice.body}`}
    >
      <View style={styles.header}>
        <View style={[styles.seasonBadge, { borderColor: tone.fg }]}>
          <MaterialCommunityIcons name={advice.icon} size={22} color={tone.fg} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.kicker}>Clima estacional</Text>
          <Text style={[styles.season, { color: tone.fg }]}>
            {advice.label} · hemisferio sur
          </Text>
        </View>
        <Ionicons name={tone.icon} size={22} color={tone.fg} />
      </View>

      <Text style={styles.headline}>{advice.headline}</Text>
      <Text style={styles.body}>{advice.body}</Text>

      {advice.tips.map((tip) => (
        <View key={tip} style={styles.tipRow}>
          <Ionicons name="checkmark" size={16} color={tone.fg} style={styles.tipIcon} />
          <Text style={styles.tipText}>{tip}</Text>
        </View>
      ))}

      {advice.frequency ? (
        <View style={[styles.freq, { borderColor: tone.fg }]}>
          <Ionicons name="water-outline" size={16} color={tone.fg} />
          <Text style={styles.freqText}>
            Sugerencia de esta estación: cada ~{advice.frequency.suggestedDays} días
            {' '}(base {advice.frequency.baseDays}). Tu agenda no cambia.
          </Text>
        </View>
      ) : null}

      <View style={styles.footer}>
        <Ionicons name="phone-portrait-outline" size={12} color={colors.textMuted} />
        <Text style={styles.footerText}>Calculado en tu teléfono con la fecha de Santiago, sin conexión.</Text>
      </View>
    </Animated.View>
  );
}

const makeStyles = (c) => ({
  card: { borderRadius: 18, padding: 14 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  seasonBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  kicker: { fontSize: 11, color: c.textMuted, fontWeight: '600' },
  season: { fontSize: 14, fontWeight: '800' },
  headline: { fontSize: 15, fontWeight: '700', color: c.text },
  body: { fontSize: 13, color: c.text, lineHeight: 19, marginTop: 4 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 6 },
  tipIcon: { marginTop: 1 },
  tipText: { flex: 1, fontSize: 13, color: c.text, lineHeight: 18 },
  freq: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  freqText: { flex: 1, fontSize: 12, fontWeight: '600', color: c.text },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 },
  footerText: { flex: 1, fontSize: 10, color: c.textMuted },
});