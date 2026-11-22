/**
 * widgetTaskHandler.js - Tarea headless que dibuja el widget con el último resumen guardado.
 */
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RiegoWidget } from './RiegoWidget';
import { SNAPSHOT_KEY } from './widgetSync';

export async function widgetTaskHandler(props) {
  if (['WIDGET_ADDED', 'WIDGET_UPDATE', 'WIDGET_RESIZED'].includes(props.widgetAction)) {
    let snapshot = {};
    try {
      snapshot = JSON.parse((await AsyncStorage.getItem(SNAPSHOT_KEY)) ?? '{}');
    } catch {
      snapshot = {};
    }
    props.renderWidget(<RiegoWidget {...snapshot} />);
  }
}
