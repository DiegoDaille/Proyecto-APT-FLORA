/**
 * widgetSync.js - La app guarda un resumen y pide actualizar el widget (solo Android).
 * Llamar desde PetContext cuando cambien los conteos (ver README, paso del widget).
 */
import React from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { RiegoWidget } from './RiegoWidget';

export const SNAPSHOT_KEY = 'widget_snapshot';

export async function syncWidget(snapshot) {
  if (Platform.OS !== 'android') return;
  try {
    await AsyncStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
    await requestWidgetUpdate({
      widgetName: 'RiegoWidget',
      renderWidget: () => <RiegoWidget {...snapshot} />,
      widgetNotFound: () => {},
    });
  } catch (error) {
    console.warn('[widget]', error?.message);
  }
}
