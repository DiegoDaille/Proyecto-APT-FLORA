/**
 * plantTrash.js - Eliminación SUAVE (soft-delete) de plantas en SQLite.
 *
 * Una planta eliminada no se borra: se marca con `eliminada_en` y queda oculta. Va a la papelera
 * TRASH_DAYS días y se puede restaurar. Pasado ese plazo (o al pulsar "Eliminar ahora") se envía
 * DELETE /plantas/<id>/ al servidor y recién entonces se borra la fila local.
 *
 * Seguridad de la base de datos:
 *  - La columna se agrega con ALTER TABLE ... ADD COLUMN (no destructivo, idempotente), sin tocar db.js.
 *  - NO se borra el historial de riegos (watering_log): la racha y los logros se conservan.
 *  - Los riegos y la creación pendientes en sync_queue siguen su curso mientras la planta está en la
 *    papelera; solo se cancelan al eliminarla definitivamente.
 *  - Si no hay red, la eliminación definitiva espera: nunca se pierde un dato por error.
 */
import { getDb } from './db';
import { isRecoverable, request } from './apiClient';

export const TRASH_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

let ready = null;

/** Agrega la columna una sola vez (si ya existe no hace nada). */
function ensureColumn() {
  if (!ready) {
    ready = (async () => {
      const db = await getDb();
      const columns = await db.getAllAsync('PRAGMA table_info(plants)');
      if (!columns.some((column) => column.name === 'eliminada_en')) {
        await db.execAsync('ALTER TABLE plants ADD COLUMN eliminada_en TEXT');
      }
      await db.execAsync('CREATE INDEX IF NOT EXISTS idx_plants_eliminada ON plants (eliminada_en)');
      return db;
    })().catch((error) => {
      ready = null;
      throw error;
    });
  }
  return ready;
}

/** Plantas visibles (las que no están en la papelera). Sustituye a db.getPlants(). */
export async function getVisiblePlants() {
  const db = await ensureColumn();
  return db.getAllAsync(
    'SELECT * FROM plants WHERE eliminada_en IS NULL ORDER BY nombre_comun COLLATE NOCASE'
  );
}

/** Mueve la planta a la papelera. No toca el servidor ni el historial de riegos. */
export async function softDeletePlant(plantId) {
  const db = await ensureColumn();
  await db.withTransactionAsync(async () => {
    await db.runAsync('UPDATE plants SET eliminada_en = ? WHERE id = ?', [new Date().toISOString(), plantId]);
    // Las fotos pendientes de subir ya no tienen sentido si la planta se va a eliminar
    await db.runAsync('DELETE FROM pending_photos WHERE planta_id = ?', [plantId]);
  });
}

export async function restorePlant(plantId) {
  const db = await ensureColumn();
  await db.runAsync('UPDATE plants SET eliminada_en = NULL WHERE id = ?', [plantId]);
}

export async function countDeletedPlants() {
  const db = await ensureColumn();
  const row = await db.getFirstAsync('SELECT COUNT(*) AS total FROM plants WHERE eliminada_en IS NOT NULL');
  return row?.total ?? 0;
}

/** Papelera: plantas eliminadas con los días que les quedan antes de la eliminación definitiva. */
export async function getDeletedPlants() {
  const db = await ensureColumn();
  const rows = await db.getAllAsync(
    'SELECT id, nombre_comun, nombre_cientifico, foto_url, eliminada_en FROM plants WHERE eliminada_en IS NOT NULL ORDER BY eliminada_en DESC'
  );
  const now = Date.now();
  return rows.map((row) => {
    const elapsedDays = Math.floor((now - new Date(row.eliminada_en).getTime()) / DAY_MS);
    return { ...row, diasRestantes: Math.max(0, TRASH_DAYS - elapsedDays) };
  });
}

/** Cancela lo que quedó pendiente en la cola para una planta que ya no existirá. */
async function cancelPendingOperations(db, plantId) {
  await db.runAsync(
    "UPDATE sync_queue SET estado = 'cancelada' WHERE estado = 'pendiente' AND tipo = 'planta_nueva' AND payload LIKE ?",
    [`%"local_id":${plantId},%`]
  );
  await db.runAsync(
    "UPDATE sync_queue SET estado = 'cancelada' WHERE estado = 'pendiente' AND tipo = 'riego' AND payload LIKE ?",
    [`%"planta_id":${plantId},%`]
  );
}

/**
 * Eliminación DEFINITIVA de una planta de la papelera.
 * @returns {Promise<{ok: boolean, offline?: boolean, error?: string}>}
 */
export async function purgePlant(plantId) {
  const db = await ensureColumn();

  // Con id positivo la planta existe en el servidor: se borra allí primero
  if (plantId > 0) {
    try {
      await request(`/plantas/${plantId}/`, { method: 'DELETE', timeoutMs: 10000 });
    } catch (error) {
      if (error?.status !== 404) {
        // 404 = ya no existe en el servidor: se puede limpiar lo local igualmente
        if (isRecoverable(error)) return { ok: false, offline: true };
        return { ok: false, error: error?.message ?? 'No se pudo eliminar en el servidor.' };
      }
    }
  }

  await db.withTransactionAsync(async () => {
    await cancelPendingOperations(db, plantId);
    await db.runAsync('DELETE FROM pending_photos WHERE planta_id = ?', [plantId]);
    await db.runAsync('DELETE FROM plants WHERE id = ?', [plantId]);
  });
  return { ok: true };
}

/** Elimina definitivamente lo que lleva más de TRASH_DAYS en la papelera. Se detiene si no hay red. */
export async function purgeExpiredTrash() {
  const db = await ensureColumn();
  const limit = new Date(Date.now() - TRASH_DAYS * DAY_MS).toISOString();
  const expired = await db.getAllAsync(
    'SELECT id FROM plants WHERE eliminada_en IS NOT NULL AND eliminada_en < ?',
    [limit]
  );

  let purged = 0;
  for (const { id } of expired) {
    const result = await purgePlant(id);
    if (result.offline) break;
    if (result.ok) purged += 1;
  }
  return purged;
}