/**
 * seasonal.js - Clima estacional del HEMISFERIO SUR (hora de America/Santiago).
 * Función pura, 100% local: sin llamadas a APIs externas (Offline-First, 0 ms).
 *
 * getSeason(date)            -> 'verano' | 'otono' | 'invierno' | 'primavera'
 * buildSeasonalAdvice(ctx)   -> { season, label, icon, tone, headline, body, tips[], frequency }
 *
 * Las estaciones usan fechas astronómicas aproximadas (pueden variar ±1 día):
 *   Verano 21 dic - 20 mar | Otoño 21 mar - 20 jun | Invierno 21 jun - 21 sep | Primavera 22 sep - 20 dic
 * Los consejos son orientativos y NO modifican la agenda de riego.
 */
export const SEASONS = { VERANO: 'verano', OTONO: 'otono', INVIERNO: 'invierno', PRIMAVERA: 'primavera' };

const TIMEZONE = 'America/Santiago';

/** Año/mes/día en Santiago. Si el motor no soporta la zona horaria, usa la fecha del teléfono. */
export function santiagoDate(date = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).formatToParts(date);
    const get = (type) => Number(parts.find((part) => part.type === type)?.value);
    const result = { year: get('year'), month: get('month'), day: get('day') };
    if (result.month >= 1 && result.month <= 12 && result.day >= 1 && result.day <= 31) return result;
  } catch {
    // se usa la fecha local del teléfono
  }
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
}

export function getSeason(date = new Date()) {
  const { month, day } = santiagoDate(date);
  const md = month * 100 + day;
  if (md >= 1221 || md <= 320) return SEASONS.VERANO;
  if (md <= 620) return SEASONS.OTONO;
  if (md <= 921) return SEASONS.INVIERNO;
  return SEASONS.PRIMAVERA;
}

// icon: MaterialCommunityIcons
export const SEASON_META = {
  verano: { label: 'Verano', icon: 'white-balance-sunny', factor: 0.8 },
  otono: { label: 'Otoño', icon: 'leaf-maple', factor: 1.1 },
  invierno: { label: 'Invierno', icon: 'snowflake', factor: 1.4 },
  primavera: { label: 'Primavera', icon: 'flower', factor: 0.95 },
};

// foco = lo que detectó el escaneo: sano | falta | exceso | hongo | luz | lugar
const ADVICE = {
  verano: {
    sano: {
      tone: 'ok',
      headline: 'Verano: mantén el ritmo y vigila la evaporación',
      body: 'Con calor el sustrato se seca más rápido. Tu planta se ve bien: conserva la rutina y revisa la humedad con el dedo antes de regar.',
      tips: [
        'Riega temprano en la mañana o al atardecer, no a pleno sol.',
        'Revisa el sustrato cada 2 días en macetas pequeñas o de exterior.',
      ],
    },
    falta: {
      tone: 'warning',
      headline: 'Alta evaporación: riega con más frecuencia',
      body: 'En verano la evaporación es mayor y las hojas secas suelen indicar falta de agua o aire muy seco. Es la estación en que una planta se deshidrata más rápido.',
      tips: [
        'Riego profundo por inmersión de 15 minutos y deja drenar bien.',
        'Aléjala del sol directo del mediodía, pero mantenla en un lugar luminoso.',
        'Revisa el sustrato a diario durante las olas de calor.',
      ],
    },
    exceso: {
      tone: 'warning',
      headline: 'Calor y exceso de agua: riesgo de pudrición',
      body: 'El sustrato mojado con temperaturas altas favorece hongos y raíces asfixiadas. Aunque haga calor, espera a que la capa superior se seque.',
      tips: [
        'Riega solo cuando los primeros 3 cm de sustrato estén secos.',
        'Comprueba que la maceta drene y no deje agua en el plato.',
        'Ventila el lugar para bajar la humedad.',
      ],
    },
    hongo: {
      tone: 'warning',
      headline: 'Calor húmedo: ventila y no mojes las hojas',
      body: 'Las manchas por hongos avanzan rápido con calor y humedad. Conviene cortar lo afectado y mejorar la ventilación.',
      tips: [
        'Poda las hojas afectadas con tijera desinfectada.',
        'Riega directo al sustrato, nunca sobre el follaje.',
        'Evita regar al caer la tarde si el ambiente es muy húmedo.',
      ],
    },
    luz: {
      tone: 'info',
      headline: 'Más luz en verano, pero con cuidado',
      body: 'Los días largos ayudan a una planta débil por falta de luz, pero el sol directo de la tarde puede quemar las hojas.',
      tips: [
        'Muévela a un lugar con luz brillante e indirecta.',
        'Aclimátala de a poco: unas horas de sol suave al comienzo.',
      ],
    },
    lugar: {
      tone: 'info',
      headline: 'Verano: revisa el sol y la ventilación del lugar',
      body: 'El calor y el sol de verano cambian cuánto soporta una planta en el mismo sitio.',
      tips: [
        'En exterior, dale sombra parcial durante las olas de calor.',
        'En interior, evita el sol directo detrás de un vidrio y ventila.',
      ],
    },
  },
  otono: {
    sano: {
      tone: 'ok',
      headline: 'Otoño: empieza a espaciar los riegos',
      body: 'Baja la temperatura y la planta crece más lento. Tu planta se ve bien: alarga poco a poco el tiempo entre riegos.',
      tips: [
        'Riega solo cuando el sustrato esté seco en la superficie.',
        'Si está en exterior, prepárala para las primeras heladas.',
      ],
    },
    falta: {
      tone: 'warning',
      headline: 'Hojas secas en otoño: puede ser natural, pero revisa el riego',
      body: 'Algunas especies pierden hojas viejas en esta época. Si las hojas secas son muchas o están en la parte nueva, probablemente falta agua o el aire está seco.',
      tips: [
        'Comprueba la humedad del sustrato antes de regar.',
        'Aléjala de estufas o corrientes de aire seco.',
      ],
    },
    exceso: {
      tone: 'warning',
      headline: 'Menos calor y más humedad en el sustrato',
      body: 'En otoño el sustrato tarda más en secarse. Mantener el riego del verano suele causar exceso de agua.',
      tips: [
        'Espacia los riegos y espera a que se seque la capa superior.',
        'Vacía siempre el agua que quede en el plato.',
      ],
    },
    hongo: {
      tone: 'warning',
      headline: 'Otoño húmedo: ventila y evita mojar las hojas',
      body: 'La humedad y las lluvias favorecen los hongos en el follaje.',
      tips: [
        'Retira las hojas afectadas y las caídas.',
        'Ventila el lugar en las horas más templadas del día.',
      ],
    },
    luz: {
      tone: 'info',
      headline: 'Los días se acortan: acércala a la luz',
      body: 'Con menos horas de luz, una planta que ya se ve débil lo notará más.',
      tips: ['Muévela a la ventana más luminosa.', 'Gírala cada semana para que crezca pareja.'],
    },
    lugar: {
      tone: 'info',
      headline: 'Otoño: reevalúa el lugar con la luz más baja',
      body: 'La luz disminuye semana a semana. Un lugar aceptable en verano puede quedar corto en otoño.',
      tips: ['Si está en exterior, protégela de las primeras heladas.'],
    },
  },
  invierno: {
    sano: {
      tone: 'ok',
      headline: 'Invierno: reduce la frecuencia (latencia vegetativa)',
      body: 'En invierno la planta casi no crece y consume poca agua. Tu planta se ve bien: riega menos y solo cuando el sustrato esté seco.',
      tips: [
        'Espacia los riegos y evita abonar hasta la primavera.',
        'Riega en las horas más templadas del día.',
      ],
    },
    falta: {
      tone: 'warning',
      headline: 'Aire seco de invierno: no compenses con más riego',
      body: 'La calefacción reseca el ambiente y las puntas se secan, aunque el sustrato tenga agua. Regar de más en frío puede pudrir las raíces.',
      tips: [
        'Aumenta la humedad ambiental: agrupa plantas o usa una bandeja con piedras y agua.',
        'Aléjala de estufas y radiadores.',
        'Comprueba el sustrato antes de regar.',
      ],
    },
    exceso: {
      tone: 'warning',
      headline: 'Frío y exceso de agua: el mayor riesgo para las raíces',
      body: 'En invierno el sustrato se seca muy lento. Es la época en que más plantas se pierden por exceso de riego.',
      tips: [
        'Pausa el riego hasta que se seque la capa superior.',
        'Revisa que la maceta drene y retira el agua del plato.',
        'Evita lugares fríos y con corrientes de aire.',
      ],
    },
    hongo: {
      tone: 'warning',
      headline: 'Frío y humedad favorecen los hongos',
      body: 'Con poca ventilación y sustrato húmedo, las manchas avanzan. Conviene reducir el agua y renovar el aire.',
      tips: [
        'Poda lo afectado con tijera desinfectada.',
        'Ventila unos minutos al mediodía, sin dejarla en corriente fría.',
        'Riega menos y no mojes el follaje.',
      ],
    },
    luz: {
      tone: 'warning',
      headline: 'Pocas horas de luz: acércala a la ventana',
      body: 'En invierno la luz es escasa y una planta débil lo resiente. Aprovecha la ventana más luminosa de la casa.',
      tips: [
        'Límpiale el polvo a las hojas para que aproveche mejor la luz.',
        'Riega menos: con poca luz consume menos agua.',
      ],
    },
    lugar: {
      tone: 'info',
      headline: 'Invierno: menos luz y más frío',
      body: 'Un lugar que servía en verano puede quedar oscuro o frío en invierno.',
      tips: [
        'Acércala a la ventana más luminosa, lejos de corrientes y estufas.',
        'En exterior, protégela de heladas o guárdala bajo techo.',
      ],
    },
  },
  primavera: {
    sano: {
      tone: 'ok',
      headline: 'Primavera: crecimiento activo',
      body: 'Sube la temperatura y la planta despierta. Tu planta se ve bien: retoma el riego con regularidad.',
      tips: [
        'Es buen momento para un abono suave y, si se ve apretada, un trasplante.',
        'Vigila plagas: con el calor aparecen pulgones y cochinillas.',
      ],
    },
    falta: {
      tone: 'warning',
      headline: 'Crecimiento activo: más sed',
      body: 'En primavera la planta consume más agua. Las hojas secas pueden indicar que el riego quedó corto para su nuevo ritmo.',
      tips: [
        'Aumenta el riego de a poco, sin saltar de golpe.',
        'Revisa si las raíces llenaron la maceta y necesita más espacio.',
      ],
    },
    exceso: {
      tone: 'warning',
      headline: 'Retoma el riego de a poco',
      body: 'Después del invierno el sustrato aún puede estar húmedo. No vuelvas al ritmo del verano de inmediato.',
      tips: ['Riega cuando la capa superior esté seca.', 'Comprueba el drenaje de la maceta.'],
    },
    hongo: {
      tone: 'warning',
      headline: 'Primavera húmeda: ventila y observa',
      body: 'Las lluvias de primavera y el follaje nuevo favorecen los hongos.',
      tips: [
        'Retira las hojas afectadas.',
        'Evita mojar el follaje y mejora la ventilación.',
      ],
    },
    luz: {
      tone: 'info',
      headline: 'Aprovecha la luz creciente',
      body: 'Cada semana hay más luz: es buen momento para acercar la planta a un lugar más luminoso.',
      tips: ['Muévela de a poco para que no se estrese.', 'Gírala para que crezca pareja.'],
    },
    lugar: {
      tone: 'info',
      headline: 'Primavera: buen momento para reubicarla',
      body: 'Con la luz y la temperatura en aumento, la planta tolera mejor un cambio de lugar.',
      tips: ['Si está en exterior, empieza a sacarla de a poco al sol suave.'],
    },
  },
};

/** Lo que detectó el escaneo -> foco del consejo. */
function resolveFocus({ symptom, verdict }) {
  if (symptom === 'exceso' || symptom === 'falta' || symptom === 'hongo' || symptom === 'luz') return symptom;
  if (verdict === 'aceptable' || verdict === 'no_recomendado') return 'lugar';
  return 'sano';
}

function extraTips({ season, species, ubicacion, light }) {
  const extra = [];
  const category = species?.categoria;
  if (category === 'Suculenta' && season === SEASONS.INVIERNO) {
    extra.push('Las suculentas casi no necesitan agua en invierno: riega solo ocasionalmente.');
  }
  if ((category === 'Tropical' || category === 'Helecho') && (season === SEASONS.INVIERNO || season === SEASONS.VERANO)) {
    extra.push('Esta especie agradece humedad ambiental: pulveriza las hojas o agrúpala con otras plantas.');
  }
  if (ubicacion === 'exterior' && season === SEASONS.INVIERNO) {
    extra.push('En exterior, protégela de las heladas.');
  }
  if (light === 'baja' && (season === SEASONS.OTONO || season === SEASONS.INVIERNO)) {
    extra.push('La luz del lugar ya es baja: en esta estación conviene acercarla a la ventana.');
  }
  return extra;
}

/**
 * @param {{date?: Date, species?: {categoria?: string}|null, symptom?: 'exceso'|'falta'|'hongo'|'luz'|null,
 *          verdict?: 'ideal'|'aceptable'|'no_recomendado'|null, ubicacion?: string|null, light?: string|null,
 *          baseDays?: number|null}} context
 */
export function buildSeasonalAdvice({
  date = new Date(),
  species = null,
  symptom = null,
  verdict = null,
  ubicacion = null,
  light = null,
  baseDays = null,
} = {}) {
  const season = getSeason(date);
  const meta = SEASON_META[season];
  const focus = resolveFocus({ symptom, verdict });
  const entry = ADVICE[season][focus];

  // Suculentas en invierno: el riego se espacia mucho más
  const factor = species?.categoria === 'Suculenta' && season === SEASONS.INVIERNO ? 2 : meta.factor;
  const days = Number.isFinite(baseDays) && baseDays > 0 ? baseDays : null;

  return {
    season,
    label: meta.label,
    icon: meta.icon,
    focus,
    tone: entry.tone,
    headline: entry.headline,
    body: entry.body,
    tips: [...entry.tips, ...extraTips({ season, species, ubicacion, light })].slice(0, 4),
    frequency: days
      ? { baseDays: days, suggestedDays: Math.max(1, Math.round(days * factor)), factor }
      : null,
  };
}