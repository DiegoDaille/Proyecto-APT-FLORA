/**
 * themes.js - Temas desbloqueables por rango botánico (etapas de Espina, petFsm.STAGES).
 * Todos son temas CLAROS: los componentes que aún usan colores fijos (botones, barra de pestañas)
 * mantienen buen contraste sobre cualquiera de ellos.
 */
import { colors as base } from './theme';

export const THEMES = {
  hoja: { id: 'hoja', name: 'Hoja', minLevel: 1, colors: base },
  cactus: {
    id: 'cactus',
    name: 'Desierto',
    minLevel: 2,
    colors: {
      ...base,
      primary: '#B5622F',
      primaryLight: '#D98C5B',
      primaryDark: '#6B3A1B',
      tint: '#FBEFE4',
      sprout: '#E8B27A',
      accent: '#2E7D6B',
      accentDark: '#1F5A4C',
      accentTint: '#E3F3EF',
      background: '#FFFAF3',
      border: '#E8C9A8',
    },
  },
  floral: {
    id: 'floral',
    name: 'Floral',
    minLevel: 3,
    colors: {
      ...base,
      primary: '#C2467F',
      primaryLight: '#D96A9B',
      primaryDark: '#6E1F45',
      tint: '#FCEAF2',
      sprout: '#F2A6C6',
      accent: '#7B4BA8',
      accentDark: '#55307A',
      accentTint: '#F1E9F8',
      background: '#FFF8FB',
      border: '#E9B7CF',
    },
  },
  leyenda: {
    id: 'leyenda',
    name: 'Leyenda',
    minLevel: 4,
    colors: {
      ...base,
      primary: '#B8901C',
      primaryLight: '#D4AF37',
      primaryDark: '#5C4608',
      tint: '#FBF4DC',
      sprout: '#E3C45E',
      accent: '#8A3B63',
      accentDark: '#5E2543',
      accentTint: '#F7ECE3',
      background: '#FFFCF0',
      border: '#E6D7A0',
    },
  },
};

export const THEME_LIST = Object.values(THEMES);
export const isUnlocked = (theme, stageLevel) => stageLevel >= theme.minLevel;
