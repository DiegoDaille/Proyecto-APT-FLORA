/**
 * secretAchievements.js - Logros secretos (Easter eggs) de F.L.O.R.A.
 *
 * Los logros desbloqueados se guardan en app_meta (clave 'secret_achievements').
 * Unos se detectan leyendo el historial (riegos, fotos); otros los dispara la pantalla
 * (toques al avatar, nombre de la mascota). Nunca lanzan: un fallo aquí no debe romper el Perfil.
 */
import { getDb, getMeta, setMeta } from './db';
import { getPhotoDays } from './plantPhotosDb';

const META_KEY = 'secret_achievements';
const FESTIVE_SUFFIXES = ['-12-24', '-12-25', '-12-31', '-01-01'];

// riddle: pista críptica que se ve mientras está bloqueado. text: lo que se revela al descubrirlo.
export const SECRETS = [
  {
    id: 'madrugador',
    title: 'Madrugador',
    text: 'Regaste una planta entre las 5 y las 7 de la mañana.',
    riddle: 'Las plantas agradecen a quien se levanta con el sol.',
    icon: 'sunny',
    color: '#F9A825',
  },
  {
    id: 'noctambulo',
    title: 'Noctámbulo',
    text: 'Regaste una planta pasadas las 23:00 o antes de las 4:00.',
    riddle: 'Algunas plantas tienen compañía cuando todos duermen.',
    icon: 'moon',
    color: '#5C6BC0',
  },
  {
    id: 'festivo',
    title: 'Jardín festivo',
    text: 'Regaste en Nochebuena, Navidad, Fin de Año o Año Nuevo.',
    riddle: 'Hay fechas en las que hasta las plantas reciben regalos.',
    icon: 'gift',
    color: '#E53935',
  },
  {
    id: 'multitarea',
    title: 'Jardinero multitarea',
    text: 'Regaste 5 plantas distintas en un mismo día.',
    riddle: 'Un buen día, muchas macetas.',
    icon: 'albums',
    color: '#00897B',
  },
  {
    id: 'ojo_botanico',
    title: 'Ojo botánico',
    text: 'Tomaste fotos de seguimiento en 7 días distintos.',
    riddle: 'El tiempo se nota mejor con una buena foto.',
    icon: 'camera',
    color: '#8E24AA',
  },
  {
    id: 'groot',
    title: 'Nombre legendario',
    text: 'Bautizaste a tu mascota «Groot».',
    riddle: 'Algunos nombres de árbol son famosos en el cine.',
    icon: 'leaf',
    color: '#6D4C41',
  },
  {
    id: 'cosquillas',
    title: 'Cosquillas',
    text: 'Tocaste tu avatar 7 veces seguidas.',
    riddle: 'A veces un solo toque no basta.',
    icon: 'happy',
    color: '#FB8C00',
  },
];

const VALID_IDS = new Set(SECRETS.map((s) => s.id));

export async function loadUnlockedSecrets() {
  try {
    const raw = await getMeta(META_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    return Array.isArray(ids) ? ids.filter((id) => VALID_IDS.has(id)) : [];
  } catch {
    return [];
  }
}

/** Logros que el historial ya cumple (riegos y fotos). Los demás se disparan desde la pantalla. */
export async function findSecretsFromData() {
  const found = new Set();

  try {
    const db = await getDb();
    // planta_id NULL = riegos sembrados de demostración: no cuentan
    const rows = await db.getAllAsync(
      'SELECT regado_en, dia FROM watering_log WHERE planta_id IS NOT NULL ORDER BY id DESC LIMIT 2000'
    );
    for (const row of rows) {
      const hour = new Date(row.regado_en).getHours();
      if (hour >= 5 && hour < 7) found.add('madrugador');
      if (hour >= 23 || hour < 4) found.add('noctambulo');
      if (row.dia && FESTIVE_SUFFIXES.some((suffix) => row.dia.endsWith(suffix))) found.add('festivo');
    }

    const busyDay = await db.getFirstAsync(
      `SELECT dia FROM watering_log
        WHERE planta_id IS NOT NULL
        GROUP BY dia
       HAVING COUNT(DISTINCT planta_id) >= 5
        LIMIT 1`
    );
    if (busyDay) found.add('multitarea');
  } catch (error) {
    console.warn('[Secretos] historial de riegos:', error?.message);
  }

  try {
    const photoDays = await getPhotoDays();
    if (photoDays.length >= 7) found.add('ojo_botanico');
  } catch (error) {
    console.warn('[Secretos] fotos:', error?.message);
  }

  return [...found];
}

// Las llamadas se encolan: dos comprobaciones seguidas nunca anuncian dos veces el mismo logro.
let chain = Promise.resolve();

async function doUnlock(candidates) {
  const current = await loadUnlockedSecrets();
  const fresh = [...new Set(candidates)].filter((id) => VALID_IDS.has(id) && !current.includes(id));
  if (fresh.length === 0) return { all: current, fresh: [] };

  const all = [...current, ...fresh];
  try {
    await setMeta(META_KEY, JSON.stringify(all));
  } catch (error) {
    console.warn('[Secretos] no se pudo guardar:', error?.message);
    return { all: current, fresh: [] }; // si no se guarda, no se anuncia (saldría de nuevo)
  }
  return { all, fresh };
}

/**
 * Desbloquea los logros candidatos que aún no estén guardados.
 * @param {string[]} candidates ids de SECRETS
 * @returns {Promise<{all: string[], fresh: string[]}>} todos los desbloqueados y los nuevos
 */
export function unlockSecrets(candidates) {
  const run = chain.then(() => doUnlock(candidates));
  chain = run.catch(() => {});
  return run;
}
