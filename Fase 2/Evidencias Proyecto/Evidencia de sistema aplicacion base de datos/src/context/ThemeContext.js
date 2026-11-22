/**
 * ThemeContext.js - Tema activo (persistido en AsyncStorage) + StyleSheet dinámico.
 *
 *   const styles = useThemedStyles(makeStyles);
 *   const makeStyles = (colors) => ({ ... });
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES } from '../theme/themes';

const KEY = 'flora_theme';
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState('hoja');

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((saved) => {
        if (saved && THEMES[saved]) setThemeId(saved);
      })
      .catch(() => {});
  }, []);

  const setTheme = useCallback(async (id) => {
    if (!THEMES[id]) return;
    setThemeId(id);
    try {
      await AsyncStorage.setItem(KEY, id);
    } catch {
      // sin persistencia: el tema sigue activo en esta sesión
    }
  }, []);

  const value = useMemo(
    () => ({ theme: THEMES[themeId], themeId, colors: THEMES[themeId].colors, setTheme }),
    [themeId, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  return ctx;
}

/** StyleSheet dinámico: se recalcula solo cuando cambia el tema. */
export function useThemedStyles(factory) {
  const { colors } = useTheme();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
}
