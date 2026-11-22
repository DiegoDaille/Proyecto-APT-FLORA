/**
 * PlantTrashScreen.js - Papelera de plantas (ruta "PlantTrash").
 * Las plantas eliminadas quedan aquí TRASH_DAYS días: se pueden restaurar o eliminar ahora.
 * El historial de riegos y la racha NO se pierden al eliminar una planta.
 */
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import PlantThumb from '../components/PlantThumb';
import { usePlants } from '../context/PlantsContext';
import { getDeletedPlants, purgePlant, TRASH_DAYS } from '../services/plantTrash';
import { baseStyles, colors, radius, spacing } from '../theme/theme';

export default function PlantTrashScreen() {
  const { restorePlant, refreshTrash } = usePlants();
  const [items, setItems] = useState([]);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    getDeletedPlants()
      .then(setItems)
      .catch((error) => console.warn('[Trash] cargar:', error?.message));
  }, []);

  useFocusEffect(load);

  const handleRestore = async (item) => {
    setBusyId(item.id);
    try {
      await restorePlant(item.id);
      load();
    } catch (error) {
      Alert.alert('No se pudo restaurar', 'Inténtalo de nuevo.');
    } finally {
      setBusyId(null);
    }
  };

  const handlePurge = (item) => {
    Alert.alert(
      'Eliminar definitivamente',
      `${item.nombre_comun} se borrará también de tu cuenta y no podrás recuperarla. Tu historial de riegos y tu racha se conservan.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setBusyId(item.id);
            try {
              const result = await purgePlant(item.id);
              if (result.offline) {
                Alert.alert(
                  'Sin conexión',
                  'Se eliminará definitivamente cuando vuelva la conexión. Mientras tanto sigue en la papelera.'
                );
              } else if (!result.ok) {
                Alert.alert('No se pudo eliminar', result.error ?? 'Inténtalo de nuevo.');
              }
              await refreshTrash();
              load();
            } finally {
              setBusyId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={baseStyles.screen}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={18} color={colors.primaryDark} />
            <Text style={styles.infoText}>
              Las plantas eliminadas se guardan {TRASH_DAYS} días. Después se borran definitivamente. Tu racha y
              tu historial de riegos no se pierden.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="trash-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>La papelera está vacía.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <PlantThumb uri={item.foto_url} size={46} radius={12} iconSize={22} />
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>{item.nombre_comun}</Text>
              <Text style={styles.days}>
                {item.diasRestantes === 0
                  ? 'Se eliminará en la próxima sincronización'
                  : `Se elimina en ${item.diasRestantes} ${item.diasRestantes === 1 ? 'día' : 'días'}`}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.btn, styles.btnRestore]}
              onPress={() => handleRestore(item)}
              disabled={busyId === item.id}
              accessibilityRole="button"
              accessibilityLabel={`Restaurar ${item.nombre_comun}`}
            >
              <Ionicons name="arrow-undo" size={15} color="#FFFFFF" />
              <Text style={styles.btnRestoreText}>Restaurar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnDelete}
              onPress={() => handlePurge(item)}
              disabled={busyId === item.id}
              accessibilityRole="button"
              accessibilityLabel={`Eliminar definitivamente ${item.nombre_comun}`}
              hitSlop={8}
            >
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.tint,
    marginBottom: spacing.md,
  },
  infoText: { flex: 1, fontSize: 12, color: colors.primaryDark, lineHeight: 17 },
  empty: { alignItems: 'center', gap: 10, paddingVertical: spacing.xl },
  emptyText: { fontSize: 14, color: colors.textMuted },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: radius.md,
    backgroundColor: colors.accentTint,
  },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: colors.text },
  days: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  btnRestore: { backgroundColor: colors.primary },
  btnRestoreText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  btnDelete: { marginLeft: 10, padding: 4 },
});