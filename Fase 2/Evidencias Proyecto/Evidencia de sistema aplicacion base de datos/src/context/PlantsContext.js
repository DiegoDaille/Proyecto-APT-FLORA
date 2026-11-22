/**
 * PlantsContext.js - Estado global del catálogo, Offline-First.
 *
 * Flujo de carga:
 *   1. Pinta de inmediato lo que haya en SQLite (sin esperar la red).
 *   2. Consulta el API (mock en modo demo) y actualiza la caché local.
 *   3. Si el API falla y hay caché, se queda con la caché (sin romper la UI).
 *
 * Flujo de riego (SC-02): guarda en SQLite + encola; al haber red, sincroniza en lote.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import useNetworkStatus from '../hooks/useNetworkStatus';
import { fetchPlants, guardarPlantaEnJardin } from '../services/plantService';
import { flushQueue } from '../services/syncService';
import { uploadPendingPhotos } from '../services/photoUploadService';
import { haptic } from '../utils/haptics';
import { countPendingOperations, registerWatering, upsertPlants } from '../services/db';
import {
  countDeletedPlants,
  getVisiblePlants,
  purgeExpiredTrash,
  restorePlant as restoreFromTrash,
  softDeletePlant,
} from '../services/plantTrash';

const PlantsContext = createContext(null);

export function PlantsProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { isOnline } = useNetworkStatus();

  const [plants, setPlants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('cache'); // 'api' | 'mock' | 'cache'
  const [pendingCount, setPendingCount] = useState(0);
  const [lastWatering, setLastWatering] = useState(null); // evento WATERED para PetContext
  const [trashCount, setTrashCount] = useState(0);

  const wasOffline = useRef(false);

  const refreshPending = useCallback(async () => {
    setPendingCount(await countPendingOperations());
  }, []);

  const refreshTrash = useCallback(async () => {
    try {
      setTrashCount(await countDeletedPlants());
    } catch (error) {
      console.warn('[Plants] papelera:', error?.message);
    }
  }, []);

  /** Envía la cola al backend, sube las fotos pendientes y actualiza el contador. */
  const syncNow = useCallback(async () => {
    let step = 'flushQueue';
    try {
      const { offline } = await flushQueue();
      if (!offline) {
        step = 'purgeExpiredTrash';
        await purgeExpiredTrash(); // elimina en el servidor lo que lleva más de 7 días en la papelera
        step = 'uploadPendingPhotos';
        await uploadPendingPhotos();
      }
      step = 'getPlants';
      setPlants(await getVisiblePlants()); // ids pueden cambiar al sincronizar
    } catch (e) {
      console.warn(
        `[Plants] Falló la sincronización en "${step}":`,
        e?.message,
        String(e?.stack).split('\n').slice(0, 5).join('\n')
      );
    } finally {
      await refreshPending();
      await refreshTrash();
    }
  }, [refreshPending, refreshTrash]);

  const load = useCallback(async () => {
    setError(null);
    try {
      // 1) Caché local primero
      const cached = await getVisiblePlants();
      if (cached.length > 0) {
        setPlants(cached);
        setIsLoading(false);
      }

      // 2) Red / mock. Con caché existente no se permite sustituirla por mocks.
      try {
        const { plants: remote, source: src } = await fetchPlants({
          allowMock: cached.length === 0,
        });
        await upsertPlants(remote, { prune: src === 'api' });
        setPlants(await getVisiblePlants());
        setSource(src);
      } catch (networkError) {
        // 3) Sin red: si hay caché seguimos con ella; si no, es un error real
        if (cached.length === 0) throw networkError;
        setSource('cache');
      }

      await refreshPending();
      await refreshTrash();
    } catch (e) {
      setError(e?.message ?? 'No se pudo cargar tu jardín.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [refreshPending, refreshTrash]);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    return load();
  }, [load]);

  /** Registra un riego (offline-safe). */
  const markWatered = useCallback(
    async (plantId) => {
      await registerWatering(plantId, new Date().toISOString());
      setLastWatering({ plantId, at: Date.now() }); // objeto nuevo en cada riego: dispara la celebración
      haptic('watered'); // vibración de éxito (nunca lanza)
      setPlants(await getVisiblePlants());
      await refreshPending();
      if (isOnline) syncNow();
    },
    [isOnline, refreshPending, syncNow]
  );

  /** Agrega una planta nueva (offline-safe) y la muestra de inmediato. */
  const addPlant = useCallback(
    async (data) => {
      const localId = await guardarPlantaEnJardin(data);
      setPlants(await getVisiblePlants());
      await refreshPending();
      if (isOnline) syncNow();
      return localId;
    },
    [isOnline, refreshPending, syncNow]
  );

  /** Mueve una planta a la papelera (se puede restaurar durante 7 días). */
  const deletePlant = useCallback(
    async (plantId) => {
      await softDeletePlant(plantId);
      setPlants(await getVisiblePlants());
      await refreshTrash();
      haptic('alert');
    },
    [refreshTrash]
  );

  const restorePlant = useCallback(
    async (plantId) => {
      await restoreFromTrash(plantId);
      setPlants(await getVisiblePlants());
      await refreshTrash();
    },
    [refreshTrash]
  );

  // Carga inicial al autenticarse / limpieza al cerrar sesión
  useEffect(() => {
    if (!isAuthenticated) {
      setPlants([]);
      setIsLoading(true);
      setError(null);
      return;
    }
    load().then(() => {
      if (isOnline) syncNow();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Al recuperar conectividad: sincronizar la cola y refrescar el catálogo
  useEffect(() => {
    if (!isAuthenticated) return;
    if (isOnline && wasOffline.current) {
      syncNow().then(() => load());
    }
    wasOffline.current = !isOnline;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, isAuthenticated]);

  const value = useMemo(
    () => ({
      plants,
      isLoading,
      isRefreshing,
      error,
      source,
      pendingCount,
      lastWatering,
      trashCount,
      isOnline,
      refresh,
      reload: load,
      markWatered,
      addPlant,
      deletePlant,
      restorePlant,
      refreshTrash,
    }),
    [plants, isLoading, isRefreshing, error, source, pendingCount, lastWatering, trashCount, isOnline, refresh, load, markWatered, addPlant, deletePlant, restorePlant, refreshTrash]
  );

  return <PlantsContext.Provider value={value}>{children}</PlantsContext.Provider>;
}

export function usePlants() {
  const ctx = useContext(PlantsContext);
  if (!ctx) throw new Error('usePlants debe usarse dentro de <PlantsProvider>');
  return ctx;
}

export default PlantsContext;