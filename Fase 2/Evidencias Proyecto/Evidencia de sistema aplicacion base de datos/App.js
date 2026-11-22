/** App.js - Punto de entrada. Proveedores globales + navegación raíz. */
import './src/polyfills/webAlert';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { NotificationsProvider } from './src/context/NotificationsContext';
import { PetProvider } from './src/context/PetContext';
import { PlantsProvider } from './src/context/PlantsContext';
import { ThemeProvider } from './src/context/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      {/* Tema fuera de Auth: se aplica también a las pantallas de login */}
      <ThemeProvider>
        <AuthProvider>
          {/* Orden de dependencias: Plants -> Pet (FSM) -> Notifications */}
          <PlantsProvider>
            <PetProvider>
              <NotificationsProvider>
                <RootNavigator />
                <StatusBar style="dark" />
              </NotificationsProvider>
            </PetProvider>
          </PlantsProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}