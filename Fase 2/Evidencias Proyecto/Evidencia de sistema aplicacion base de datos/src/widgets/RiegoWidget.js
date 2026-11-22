/**
 * RiegoWidget.js - Widget de pantalla de inicio (Android 3x2).
 * Cumple contraste WCAG 2.1 Nivel AA (> 4.5:1) y diseño en dos columnas.
 */
import React from 'react';
import { FlexWidget, TextWidget, ImageWidget } from 'react-native-android-widget';

export function RiegoWidget({ due = 0, overdue = 0, streak = 0, petName = 'Espina' }) {
  const pending = due + overdue;
  const isOverdue = overdue > 0;

  const headline = pending === 0 ? 'Todo regado' : `${pending} por regar`;
  const detail = isOverdue
    ? `${overdue} atrasada${overdue === 1 ? '' : 's'}`
    : pending === 0
      ? `${petName} está feliz`
      : 'Riego programado hoy';

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        padding: 14,
        borderRadius: 22,
        backgroundColor: isOverdue ? '#FEF2F2' : '#EEF6E8',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {/* Columna Izquierda: Estado de riego y jerarquía tipográfica */}
      <FlexWidget
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <TextWidget
          text="F.L.O.R.A."
          style={{
            fontSize: 11,
            fontWeight: 'bold',
            color: isOverdue ? '#991B1B' : '#2D6A4F',
            marginBottom: 2,
          }}
        />
        <TextWidget
          text={headline}
          style={{
            fontSize: 21,
            fontWeight: 'bold',
            color: isOverdue ? '#7F1D1D' : '#1B4332',
            marginBottom: 2,
          }}
        />
        <TextWidget
          text={detail}
          style={{
            fontSize: 13,
            fontWeight: '500',
            color: isOverdue ? '#B91C1C' : '#374151',
          }}
        />
      </FlexWidget>

      {/* Columna Derecha: Ícono de la app + Píldora de Racha (Contraste WCAG AA) */}
      <FlexWidget
        style={{
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          marginLeft: 10,
        }}
      >
        <ImageWidget
          image={require('../../assets/icon.png')}
          imageWidth={46}
          imageHeight={46}
          radius={14}
        />
        <FlexWidget
          style={{
            marginTop: 6,
            paddingHorizontal: 10,
            paddingVertical: 3,
            borderRadius: 12,
            backgroundColor: isOverdue ? '#991B1B' : '#9A3412', // Contraste > 5.8:1 con texto blanco
          }}
        >
          <TextWidget
            text={`Racha: ${streak} d`}
            style={{
              fontSize: 11,
              fontWeight: 'bold',
              color: '#FFFFFF',
            }}
          />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}