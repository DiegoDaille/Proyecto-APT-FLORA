/**
 * PlantProgressScreen.js - Comparador "Antes vs. Hoy" (ruta "PlantProgress", params: { plant }).
 * "Antes" = foto con que se agregó la planta (o la primera foto de seguimiento).
 * "Hoy"   = la foto de seguimiento más reciente.
 * Compartir: captura la tarjeta en memoria (view-shot) y abre la hoja nativa (expo-sharing).
 * v2.2: cada foto de seguimiento cuenta como día activo en la racha (máximo un día por fecha).
 */
import React, { useCallback, useRef, useState } from 'react';
import { Alert, Image, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import PhotoPicker from '../components/PhotoPicker';
import PrimaryButton from '../components/PrimaryButton';
import { usePet } from '../context/PetContext';
import { useThemedStyles } from '../context/ThemeContext';
import { addPlantPhoto, getPlantPhotos } from '../services/plantPhotosDb';

const DAY_MS = 86400000;
const fmt = (iso) =>
  new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });

export default function PlantProgressScreen({ route }) {
  const { plant } = route.params;
  const { refreshStreak } = usePet();
  const styles = useThemedStyles(makeStyles);
  const shotRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    getPlantPhotos(plant.id)
      .then(setPhotos)
      .catch((error) => console.warn('[Progress]', error?.message));
  }, [plant.id]);

  useFocusEffect(load);

  const handlePicked = async (picked) => {
    try {
      await addPlantPhoto(plant.id, picked.uri);
      load();
    } catch (error) {
      console.warn('[Progress] guardar foto:', error?.message);
      Alert.alert('No se pudo guardar la foto', 'Inténtalo de nuevo.');
      return;
    }

    // La foto ya quedó guardada; si el cálculo de la racha falla, no se le avisa como error
    try {
      const result = await refreshStreak();
      if (result.increased) {
        const days = `${result.current} ${result.current === 1 ? 'día seguido' : 'días seguidos'}`;
        Alert.alert(
          '¡Racha actualizada!',
          result.levelUp
            ? `Llevas ${days} y Espina evolucionó a ${result.stageName}.`
            : `Llevas ${days} cuidando tus plantas.`
        );
      }
    } catch (error) {
      console.warn('[Progress] racha:', error?.message);
    }
  };

  // Secuencia: foto original de la planta (si existe) + fotos de seguimiento
  const original = plant.foto_url
    ? { uri: plant.foto_url, creado_en: plant.creado_en ?? plant.created_at ?? null }
    : null;
  const sequence = original ? [original, ...photos] : photos;
  const before = sequence[0] ?? null;
  const after = sequence.length > 1 ? sequence[sequence.length - 1] : null;

  const days =
    before?.creado_en && after?.creado_en
      ? Math.max(1, Math.round((new Date(after.creado_en) - new Date(before.creado_en)) / DAY_MS))
      : null;

  const handleShare = async () => {
    setBusy(true);
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('No disponible', 'Compartir no está disponible en este dispositivo.');
        return;
      }
      const uri = await captureRef(shotRef, { format: 'jpg', quality: 0.9, result: 'tmpfile' });
      await Sharing.shareAsync(uri, {
        mimeType: 'image/jpeg',
        dialogTitle: `Evolución de ${plant.nombre_comun}`,
      });
    } catch (error) {
      console.warn('[Progress] compartir:', error?.message);
      Alert.alert('No se pudo compartir', 'Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  const subtitle = after
    ? days
      ? `Evolución en ${days} ${days === 1 ? 'día' : 'días'}`
      : 'Así ha cambiado tu planta'
    : 'Toma una foto hoy para compararla con la primera.';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{plant.nombre_comun}</Text>
      <Text style={styles.sub}>{subtitle}</Text>

      {/* collapsable={false}: necesario para que view-shot capture bien en Android */}
      <View ref={shotRef} collapsable={false} style={styles.shot}>
        <View style={styles.pair}>
          {[
            { label: 'Antes', item: before },
            { label: 'Hoy', item: after },
          ].map(({ label, item }) => (
            <View key={label} style={styles.half}>
              {item ? (
                <Image source={{ uri: item.uri }} style={styles.img} />
              ) : (
                <View style={[styles.img, styles.empty]} />
              )}
              <Text style={styles.tag}>
                {label}
                {item?.creado_en ? ` · ${fmt(item.creado_en)}` : ''}
              </Text>
            </View>
          ))}
        </View>
        <Text style={styles.brand}>F.L.O.R.A.</Text>
      </View>

      <PhotoPicker
        onPicked={handlePicked}
        cameraLabel="Agregar foto de hoy"
        cameraIcon="camera-outline"
      />
      <Text style={styles.hint}>Una foto al día mantiene viva tu racha, igual que un riego.</Text>

      <PrimaryButton
        title="Compartir comparación"
        onPress={handleShare}
        loading={busy}
        disabled={!after}
        style={styles.share}
      />
    </ScrollView>
  );
}

const makeStyles = (c) => ({
  screen: { flex: 1, backgroundColor: c.background },
  content: { padding: 24 },
  title: { fontSize: 22, fontWeight: '700', color: c.text },
  sub: { fontSize: 13, color: c.textMuted, marginTop: 4, marginBottom: 16 },
  shot: { backgroundColor: c.surface, borderRadius: 16, padding: 12, marginBottom: 16 },
  pair: { flexDirection: 'row', gap: 8 },
  half: { flex: 1 },
  img: { width: '100%', aspectRatio: 3 / 4, borderRadius: 12 },
  empty: { backgroundColor: c.tint },
  tag: { fontSize: 11, fontWeight: '600', color: c.primaryDark, marginTop: 6, textAlign: 'center' },
  brand: { fontSize: 11, color: c.textMuted, textAlign: 'center', marginTop: 8, fontStyle: 'italic' },
  hint: { fontSize: 12, color: c.textMuted, textAlign: 'center', marginTop: 8 },
  share: { marginTop: 12 },
});
