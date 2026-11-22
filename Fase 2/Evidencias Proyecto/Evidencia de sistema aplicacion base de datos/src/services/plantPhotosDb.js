/**
 * plantPhotosDb.js - Historial de fotos por planta (comparador "Antes vs. Hoy").
 * Las fotos se copian a almacenamiento permanente (la caché de la cámara puede borrarse).
 * Usa la API nueva de expo-file-system (Directory / File / Paths).
 * v2.2: getPhotoDays() entrega los días con foto para que cuenten en la racha.
 */
import { Directory, File, Paths } from 'expo-file-system';
import { localDayKey } from '../utils/dates';
import { getDb } from './db';

let ready = null;

function ensureTable() {
  if (!ready) {
    ready = getDb()
      .then(async (db) => {
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS plant_photos (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            planta_id TEXT NOT NULL,
            uri       TEXT NOT NULL,
            creado_en TEXT NOT NULL
          );
          CREATE INDEX IF NOT EXISTS idx_plant_photos ON plant_photos (planta_id, creado_en);
        `);
        return db;
      })
      .catch((error) => {
        ready = null;
        throw error;
      });
  }
  return ready;
}

function persistPhoto(uri) {
  const dir = new Directory(Paths.document, 'plant_photos');
  if (!dir.exists) dir.create({ intermediates: true });
  const dest = new File(dir, `${Date.now()}.jpg`);
  new File(uri).copy(dest);
  return dest.uri;
}

export async function addPlantPhoto(plantId, uri) {
  const db = await ensureTable();
  const saved = persistPhoto(uri);
  await db.runAsync('INSERT INTO plant_photos (planta_id, uri, creado_en) VALUES (?, ?, ?)', [
    String(plantId),
    saved,
    new Date().toISOString(),
  ]);
  return saved;
}

/** Del más antiguo al más reciente: [{ id, uri, creado_en }] */
export async function getPlantPhotos(plantId) {
  const db = await ensureTable();
  return db.getAllAsync(
    'SELECT id, uri, creado_en FROM plant_photos WHERE planta_id = ? ORDER BY creado_en ASC',
    [String(plantId)]
  );
}

/**
 * Días (YYYY-MM-DD, hora local) con al menos una foto de seguimiento, de cualquier planta.
 * Mismo formato que getWateringDays(): una foto o diez el mismo día cuentan como UN día.
 */
export async function getPhotoDays(limit = 400) {
  const db = await ensureTable();
  const rows = await db.getAllAsync(
    'SELECT creado_en FROM plant_photos ORDER BY creado_en DESC LIMIT ?',
    [limit * 5]
  );
  return [...new Set(rows.map((row) => localDayKey(new Date(row.creado_en))))].slice(0, limit);
}
