/**
 * ThemePicker.js - Selector de tema. Cada tema se desbloquea con un rango botánico de Espina.
 * v2.3: avisa cuando un rango nuevo desbloquea temas ("¡Nuevo tema desbloqueado!").
 */
import React, { useEffect } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { usePet } from '../context/PetContext';
import { useTheme, useThemedStyles } from '../context/ThemeContext';
import { isUnlocked, THEME_LIST } from '../theme/themes';
import { haptic } from '../utils/haptics';
import { STAGES } from '../utils/petFsm';

const SEEN_KEY = 'flora_theme_seen_level';

export default function ThemePicker() {
  const { themeId, setTheme } = useTheme();
  const { stage } = usePet();
  const styles = useThemedStyles(makeStyles);

  // Aviso al subir de rango. La primera vez solo guarda el nivel (no avisa de lo que ya tenía).
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SEEN_KEY);
        const seen = raw === null ? null : Number(raw);
        if (seen !== null && stage.level > seen) {
          const fresh = THEME_LIST.filter((t) => t.minLevel > seen && t.minLevel <= stage.level);
          if (alive && fresh.length > 0) {
            haptic('stageUp');
            Alert.alert(
              fresh.length === 1 ? '¡Nuevo tema desbloqueado!' : '¡Nuevos temas desbloqueados!',
              `${fresh.map((t) => t.name).join(' y ')} ya ${fresh.length === 1 ? 'está disponible' : 'están disponibles'}. Elígelo en "Tema de la app".`
            );
          }
        }
        if (seen === null || stage.level > seen) await AsyncStorage.setItem(SEEN_KEY, String(stage.level));
      } catch {
        // sin persistencia: simplemente no se avisa
      }
    })();
    return () => {
      alive = false;
    };
  }, [stage.level]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Tema de la app</Text>
      <Text style={styles.sub}>Se desbloquean al subir de rango con tu racha.</Text>
      <View style={styles.row}>
        {THEME_LIST.map((theme) => {
          const unlocked = isUnlocked(theme, stage.level);
          const active = theme.id === themeId;
          const rank = STAGES.find((s) => s.level === theme.minLevel)?.name;
          return (
            <TouchableOpacity
              key={theme.id}
              disabled={!unlocked}
              onPress={() => {
                haptic('tap');
                setTheme(theme.id);
              }}
              style={[styles.item, active && styles.itemActive, !unlocked && styles.itemLocked]}
              accessibilityRole="button"
              accessibilityLabel={`Tema ${theme.name}${unlocked ? '' : `, se desbloquea en ${rank}`}`}
              accessibilityState={{ selected: active, disabled: !unlocked }}
            >
              <View style={[styles.swatch, { backgroundColor: theme.colors.primary }]}>
                {!unlocked ? <Ionicons name="lock-closed" size={14} color="#FFFFFF" /> : null}
                {active ? <Ionicons name="checkmark" size={16} color="#FFFFFF" /> : null}
              </View>
              <Text style={styles.name}>{theme.name}</Text>
              {!unlocked ? (
                <Text style={styles.hint} numberOfLines={2}>
                  {rank}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (c) => ({
  card: {
    backgroundColor: c.surface,
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: c.tint,
  },
  title: { fontSize: 14, fontWeight: '700', color: c.text },
  sub: { fontSize: 12, color: c.textMuted, marginTop: 2, marginBottom: 12 },
  row: { flexDirection: 'row', gap: 8 },
  item: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  itemActive: { borderColor: c.primary, backgroundColor: c.tint },
  itemLocked: { opacity: 0.55 },
  swatch: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 12, fontWeight: '600', color: c.text, marginTop: 6 },
  hint: { fontSize: 10, color: c.textMuted, textAlign: 'center' },
});
