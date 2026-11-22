/**
 * RootNavigator.js - Decide qué flujo mostrar según el estado de sesión.
 *   restaurando -> splash | autenticado -> MainStack (tabs + pantallas sobre ellas) | no autenticado -> AuthStack
 * El cambio ocurre automáticamente al llamar signIn/signOut.
 *
 * MainStack: Tabs | Diagnostico | PlantHistory (detalle e historial) | PlantProgress (Antes vs. Hoy).
 * El tema de navegación sale de ThemeContext, así cambia al elegir otro tema desbloqueado.
 */
import React, { useMemo } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoadingState from '../components/LoadingState';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import DiagnosisScreen from '../screens/DiagnosisScreen';
import PlantHistoryScreen from '../screens/PlantHistoryScreen';
import PlantProgressScreen from '../screens/PlantProgressScreen';
import PlantTrashScreen from '../screens/PlantTrashScreen';
import { typography } from '../theme/theme';
import AppNavigator from './AppNavigator';
import AuthStack from './AuthStack';
import { navigationRef } from './navigationRef';

const Stack = createNativeStackNavigator();

/** Tabs principales + pantallas que se abren por encima de ellas. */
function MainStack() {
  const { colors } = useTheme();

  // Las pantallas nuevas llevan encabezado propio (las tabs y Diagnóstico traen el suyo)
  const headerOptions = {
    headerShown: true,
    headerStyle: { backgroundColor: colors.surface },
    headerTitleStyle: { color: colors.text, fontWeight: typography.weight.bold },
    headerTintColor: colors.primaryDark,
    headerShadowVisible: false,
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={AppNavigator} />
      <Stack.Screen name="Diagnostico" component={DiagnosisScreen} />
      <Stack.Screen
        name="PlantHistory"
        component={PlantHistoryScreen}
        options={{ ...headerOptions, title: 'Mi planta' }}
      />
      <Stack.Screen
        name="PlantTrash"
        component={PlantTrashScreen}
        options={{ ...headerOptions, title: 'Papelera' }}
      />
      <Stack.Screen
        name="PlantProgress"
        component={PlantProgressScreen}
        options={{ ...headerOptions, title: 'Antes vs. Hoy' }}
      />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const { isAuthenticated, isRestoring } = useAuth();
  const { colors } = useTheme();

  const navTheme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
      },
    }),
    [colors]
  );

  if (isRestoring) return <LoadingState message="Abriendo tu jardín..." />;

  return (
    <NavigationContainer ref={navigationRef} theme={navTheme}>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}