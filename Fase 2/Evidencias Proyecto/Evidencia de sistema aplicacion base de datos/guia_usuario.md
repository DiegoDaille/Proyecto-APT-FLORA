# GUÍA DE USUARIO — PLATAFORMA MÓVIL F.L.O.R.A. (v2.0.0)
**Sistema de Asistencia Botánica, Control de Riego y Diagnóstico Fitopatológico**

---

## 1. Introducción y Ficha Técnica
**F.L.O.R.A.** (*Framework Logístico de Optimización y Riego Automatizado*) es una aplicación móvil diseñada para facilitar el inventario botánico, la planificación hídrica contextualizada al clima y la detección temprana de enfermedades en jardines, viveros e invernaderos. Su arquitectura híbrida **Offline-First** permite operar tanto con conexión a internet (utilizando Inteligencia Artificial y servicios meteorológicos en la nube) como en zonas sin cobertura celular (mediante persistencia local automática en **SQLite**).

- **Versión del Software:** `2.0.0` (`cl.duocuc.floraapp`)
- **Plataforma Compatible:** Dispositivos móviles con sistema operativo **Android 8.0 (Oreo)** o superior.
- **Conectividad:** Operación continua sobre redes Wi-Fi, datos móviles (4G/5G) y modo sin conexión (*Offline*).
- **Permisos Requeridos del Sistema:**
  - **Cámara y Almacenamiento:** Necesarios para capturar fotografías de especies botánicas, documentar su evolución visual y evaluar condiciones lumínicas.
  - **Ubicación (Mientras la app está en uso):** Necesario para detectar las condiciones meteorológicas locales en tiempo real y ajustar las recomendaciones de cuidado según el clima de su zona.
  - **Notificaciones Locales:** Necesarios para recibir recordatorios programados de riego directamente en el dispositivo.

---
## 2. Acceso y Autenticación Segura (Doble Factor 2FA + JWT)

El acceso a **F.L.O.R.A.** está protegido mediante un esquema de seguridad de doble capa que combina **Autenticación en Dos Pasos (2FA)** por correo electrónico tanto en el registro como en el inicio de sesión, junto con **JSON Web Tokens (JWT)** para mantener la sesión activa de forma cifrada:

1. **Registro de Usuario y Validación de Correo:**
   - En la pantalla inicial, seleccione **Crear cuenta** e ingrese su nombre completo, correo electrónico y una contraseña segura.
   - Al confirmar sus datos, el sistema enviará automáticamente un **código numérico de verificación (2FA)** a su bandeja de entrada.
   - Ingrese dicho código en la pantalla de verificación (`VerifyCodeScreen`) para activar su cuenta y validar la titularidad de su correo.
2. **Inicio de Sesión con Doble Factor (2FA):**
   - Introduzca su correo electrónico y contraseña registrados.
   - Como medida de protección frente a accesos no autorizados, la plataforma despachará un nuevo **código de verificación de un solo uso (OTP)** a su correo electrónico.
   - Digite el código recibido en pantalla para completar la autenticación y sincronizar su inventario botánico con la nube.
3. **Persistencia Segura de Sesión (JWT):**
   - Una vez superada la verificación 2FA, su token de sesión (**JWT**) se almacena de forma cifrada en el dispositivo móvil, permitiéndole ingresar directamente en futuros usos sin repetir el proceso mientras la sesión permanezca vigente.

## 3. Pantalla Principal ("Jardín"), Clima Local y Mascota Virtual "Espina"

Al ingresar, visualizará la pestaña **Jardín**, que concentra el contexto climático de su ubicación, el inventario de sus plantas registradas y al asistente virtual **"Espina"**:

- **Clima Local en Tiempo Real:** En la zona superior de la pantalla principal se despliega una tarjeta meteorológica que consulta su ubicación actual (previa autorización del permiso de ubicación) para mostrar la temperatura y condición climática del lugar donde se encuentra, permitiendo anticipar necesidades de hidratación o resguardo.
- **Estados Dinámicos de "Espina":** La mascota virtual modifica su expresión visual (feliz, emocionado, floreciendo, neutral, sediento, enojado o durmiendo) en tiempo real según el cumplimiento de los riegos programados y su actividad diaria.
- **Widget Flotante de Progreso:** En pantalla se muestra su nivel actual de experiencia (ej. `Nv.1`) y su racha consecutiva de días cumpliendo tareas de cuidado (ej. `1d`). En secciones con listados cronológicos como **Agenda**, puede arrastrar, reubicar, minimizar o agrandar el widget libremente para evitar que cubra las tarjetas de riego.
- **Widget Nativo de Pantalla de Inicio (Android):** Puede añadir el widget **"Riego F.L.O.R.A."** directamente en el escritorio de su teléfono Android (manteniendo presionada la pantalla de inicio $\rightarrow$ *Widgets* $\rightarrow$ *F.L.O.R.A.*). Este widget muestra en tiempo real qué plantas requieren riego hoy sin necesidad de abrir la aplicación.
- **Acciones Directas sobre cada Planta de "Mi Jardín":** Al seleccionar cualquiera de los ejemplares guardados en su colección, se despliegan **3 opciones principales de gestión**:
  1. **Reportar Síntoma:** Abre el módulo de diagnóstico fitopatológico para evaluar manchas, plagas o estrés hídrico sobre ese ejemplar específico.
  2. **Antes vs. Hoy (Seguimiento Visual):** Permite capturar una fotografía actualizada de la planta y compararla lado a lado con su registro inicial para documentar su crecimiento y **sumar avance a su racha diaria**.
  3. **Eliminar Planta:** Retira el ejemplar de su jardín activo enviándolo de forma segura a la **Papelera** de su perfil, evitando pérdidas accidentales de información.

---

## 4. Identificación de Especies Botánicas ("Escanear")
Desde la pestaña inferior **Escanear**, dispone de un sistema de identificación inteligente de doble nivel (**Smart Fallback**) enriquecido con contexto climático y estacional:

### A. Nivel 1: Reconocimiento por Fotografía (Inteligencia Artificial)
1. Siga las recomendaciones preventivas en pantalla (luz natural indirecta, una hoja o flor centrada, enfoque nítido y fondo despejado).
2. Capture una fotografía con la cámara o seleccione una imagen desde su galería.
3. El sistema analizará la captura mediante visión artificial y mostrará las especies candidatas junto con una **Insignia de Certidumbre** verde (ej. *Verificada por IA: 63%*) que indica el porcentaje de confianza del modelo.

### B. Nivel 2: Cuestionario Botánico Asistido (Modo Offline / Respaldo)
Si se encuentra dentro de un invernadero sin señal de internet o el servicio externo de IA presenta intermitencia, la aplicación conmutará automáticamente (o mediante el enlace **Identificar mediante preguntas**) hacia el motor heurístico local:
1. Responda **3 preguntas visuales** sobre la **forma de las hojas**, el **hábito de crecimiento** y la **ubicación** (interior o exterior).
2. El motor local calculará las especies más probables del catálogo sin consumir datos móviles, etiquetándolas con una insignia azul (*Clasificación Heurística Local*).

### C. Recomendaciones por Clima Diario y Estación del Año
Al entregar el resultado de la especie identificada, la pantalla de resultados integra automáticamente un módulo de **Recomendación Climática y Estacional**:
- **Ajuste por Clima del Día:** Cruza las condiciones meteorológicas actuales de su ubicación (olas de calor, baja humedad o lluvias) con la tolerancia de la especie para sugerir cuidados inmediatos.
- **Guía de Estación Vigente:** Adapta los consejos de riego, poda, abono y exposición solar según la estación del año correspondiente (primavera, verano, otoño o invierno).

### D. Indicadores de Transparencia, Historial y Atribución
- **Indicador de Estado de IA:** Un banner superior informa en tiempo real si el motor en la nube está operativo (*"Identificación por IA disponible"*) o si el sistema activó el respaldo local preventivo (*"IA con problemas: usaremos el cuestionario"*).
- **Modo Demostración:** Si el servicio externo no se encuentra disponible y el respaldo de demostración está habilitado, la aplicación mostrará una alerta explícita advirtiendo que los resultados desplegados son de ejemplo.
- **Últimas Identificaciones (SQLite):** En la sección inferior de **Escanear** se almacenan localmente los últimos **3 escaneos realizados** con su miniatura, nombre común, nombre científico, insignia de certeza y tiempo transcurrido.
- **Atribución Tecnológica:** El reconocimiento fotográfico integra tecnología impulsada por *Pl@ntNet v2 Vision API*.

---

## 5. Evaluación Lumínica, Estacionalidad y Compatibilidad Ambiental
Esta funcionalidad opera como la continuación directa del proceso de reconocimiento botánico, permitiendo determinar la ubicación física ideal del ejemplar dentro del vivero o jardín según la luz disponible y la época del año:

1. **Obtención de Resultados Botánicos:** Tras visualizar la ficha de identificación en la **pantalla de resultados**, seleccione la opción **Evaluación Lumínica** (o *Evaluar Ubicación*).
2. **Medición del Espacio Destino:** Diríjase al sector del invernadero, patio o jardín donde planea ubicar la planta y apunte la cámara del dispositivo hacia la fuente de iluminación natural o artificial predominante en ese punto.
3. **Diagnóstico de Compatibilidad Lumínica y Estacional en Tiempo Real:** El sistema cruza automáticamente la intensidad lumínica captada en el entorno con los parámetros ideales de exposición solar de la especie y la **estación del año vigente**:
   - **Clasificación del Espacio:** Indica en pantalla si el lugar evaluado resulta **Óptimo**, **Aceptable** o **Riesgoso** antes de guardar la planta en su jardín.
   - **Recomendación Adaptativa según Luz y Estación:** Entrega sugerencias prácticas ajustadas tanto a la luminosidad medida como a la temporada actual (por ejemplo, alertando sobre exceso de radiación directa en primavera/verano para prevenir quemaduras foliares o recomendando acercar el ejemplar a fuentes de luz natural durante otoño/invierno).
## 6. Diagnóstico Fitopatológico y Control de Plagas
Si observa deterioro físico en alguno de sus ejemplares:
1. Ingrese a la ficha de la planta desde **Jardín** y seleccione **Diagnosticar Salud**.
2. Marque los síntomas observables mediante los íconos descriptivos (manchas foliares, polvillo blanco, amarilleamiento, bordes secos, presencia de plagas o estado del sustrato).
3. El motor de diagnóstico entregará la patología o estrés probable, su nivel de severidad y el tratamiento orgánico o preventivo recomendado.

---

## 7. Gestión del Jardín, Acciones de Planta, Agenda y Racha Multi-Evento

- **Generación Automática tras el Escaneo y Guardado:** Inmediatamente después de identificar una planta y guardarla en su colección (**Guardar en Jardín**), el sistema calcula su ciclo hídrico personalizado según los requerimientos fisiológicos de la especie y su tratamiento específico, incorporándola automáticamente en la pestaña inferior **Agenda** y actualizando el widget nativo de escritorio (**Riego F.L.O.R.A.**).
- **Calendario Cronológico y Cuenta Regresiva ("Agenda"):** La vista **Agenda** organiza cronológicamente los próximos riegos indicando **en cuántos días corresponde volver a regar** cada ejemplar (ej. *Hoy*, *En 3 días*, *En 7 días*), junto con la fecha exacta (ej. *Mié 25 Nov*), el intervalo de frecuencia (ej. *Cada 7 días*) y el ambiente (*Interior* / *Exterior*).
- **Interpretación Correcta de la Frecuencia (Intervalos vs. Días Consecutivos):** El intervalo indicado por la aplicación depende directamente de la especie y del tratamiento de cuidado que requiera cada ejemplar:
  - **Qué significa "Cada 7 días" (Intervalo de espera):** Consiste en **regar un solo día**, esperar una semana completa a que el sustrato drene y se seque adecuadamente, y recién cumplidos esos 7 días volver a aplicar agua.
  - **Por qué no son "7 días seguidos":** Regar durante siete días consecutivos provocaría saturación de humedad y pudrición de raíces. La cuenta regresiva de **F.L.O.R.A.** controla exactamente esos días de espera entre un riego y otro.
- **Ficha de Planta y 3 Acciones Operativas ("Mi Jardín"):** Al seleccionar cualquier ejemplar guardado en **Mi Jardín**, podrá consultar su fotografía, requerimientos de luz y agua, insignia de origen de identificación, historial cronológico de riegos y **tres acciones principales**:
  1. **Reportar síntoma:** Abre directamente el asistente de diagnóstico fitopatológico para evaluar plagas o enfermedades visibles en ese ejemplar.
  2. **Antes vs. Hoy (Seguimiento Visual y Racha):** Permite capturar una fotografía actualizada de la planta para compararla lado a lado con su imagen inicial de registro. Además de documentar el crecimiento o recuperación del ejemplar, **registrar una foto comparativa incrementa su racha diaria**, ofreciendo una vía adicional de seguimiento en días sin riego programado.
  3. **Eliminar planta:** Traslada el ejemplar a la **Papelera** local mediante borrado seguro (*soft delete*), cancelando sus recordatorios pendientes sin pérdida irreversible inmediata (pudiendo restaurarse desde **Perfil $\rightarrow$ Papelera**).
- **Registro de Riego, Notificaciones y Motor de Racha Multi-Evento:** Al marcar un riego como completado, el dispositivo emite una confirmación háptica (vibración), reinicia automáticamente la cuenta regresiva hacia el siguiente ciclo y sincroniza el widget de pantalla de inicio. Su racha diaria avanza de forma idempotente (1 punto por día calendario) al cumplir cualquiera de tres acciones clave: **registrar una planta nueva**, **completar un riego en Agenda** o **capturar una foto evolutiva "Antes vs. Hoy"**. Si visualiza el aviso *"Recordatorios desactivados (actívalos en Perfil)"*, tóquelo o diríjase a **Perfil** para habilitar las alertas locales programadas en el teléfono.

## 8. Perfil, Personalización por Nivel, Papelera y Trabajo Sin Internet ("Perfil")

Desde la pestaña inferior **Perfil**, puede administrar su cuenta, personalizar la interfaz y gestionar la recuperación de datos:

- **Medallas, Logros Ocultos y Progreso:** Visualice su nivel actual, su racha diaria y las barras de progreso de logros estándar, además de descubrir **logros ocultos** que se desbloquean al alcanzar hitos especiales de constancia y cuidado botánico.
- **Temas Visuales Desbloqueables por Nivel de Mascota:** Personalice la apariencia de **F.L.O.R.A.** eligiendo entre distintas paletas cromáticas que se desbloquean progresivamente a medida que sube el **nivel de su mascota virtual "Espina"**, manteniendo en todas ellas los estándares de contraste **WCAG 2.1 Nivel AA**.
- **Papelera de Plantas:** Permite consultar los ejemplares eliminados desde **Mi Jardín**, **restaurarlos** con todo su historial si fueron eliminados por error, o confirmar su eliminación definitiva.
- **Notificaciones Locales:** Active o desactive los recordatorios automáticos de riego programados en el teléfono (identificados en la barra de estado Android con el isotipo institucional de **F.L.O.R.A.**).
- **Accesibilidad Adaptativa del Sistema Operativo:** La interfaz hereda de forma nativa las preferencias de **tamaño de fuente** y **vibración táctil (respuesta háptica)** configuradas en los ajustes generales de su dispositivo Android.
- **Operación Offline-First:** Si pierde cobertura celular o Wi-Fi, continúe consultando su jardín, registrando riegos o tomando fotos de progreso con normalidad; **SQLite** resguarda las operaciones localmente y las sincroniza con la nube al restablecerse la conexión.
- **Cierre de Sesión:** Presione **Cerrar sesión** al finalizar su jornada para revocar el acceso activo y proteger su cuenta.

---

## 9. Resolución de Problemas Frecuentes (Troubleshooting) e Integridad de Datos

| Situación / Mensaje en Pantalla | Causa Probable | Acción Recomendada |
| :--- | :--- | :--- |
| **"No pudimos procesar la imagen"** o baja confianza de acierto | Fotografía desenfocada, a contraluz, con exceso de sombras o especie poco visible. | Ubique la planta bajo luz natural indirecta, centre una sola hoja y presione **Reintentar** o **Usar cuestionario** (*Smart Fallback*). |
| **El clima local no aparece o no se actualiza** en la pantalla principal | Permiso de ubicación denegado o falta de conexión a internet al consultar el servicio meteorológico. | Habilite el permiso de **Ubicación** para **F.L.O.R.A.** en los ajustes de Android y verifique su conexión de red. |
| **El código 2FA (OTP) no llega** o indica que ha expirado | Correo filtrado en *Spam* o superación de la ventana de seguridad de **5 minutos (`300 s`)**. | Revise la bandeja de correo no deseado, aguarde el enfriamiento de **30 segundos** y presione **Reenviar código**. |
| **Pérdida de conexión Wi-Fi o datos móviles** dentro del invernadero | Zonas sin cobertura de red en terreno durante la jornada operativa. | Continúe registrando riegos y consultas normalmente; **SQLite** resguarda los datos localmente y los sincroniza al volver la señal. |
| **No suenan los recordatorios de riego** o no se actualiza el widget | Notificaciones locales desactivadas o widget sin refresco en segundo plano. | Ingrese a **Perfil**, habilite **Notificaciones Locales** y verifique que el widget **Riego F.L.O.R.A.** esté anclado en su pantalla de inicio. |
| **Eliminación accidental de una planta** desde Mi Jardín | Selección involuntaria de la opción **Eliminar planta** en la ficha del ejemplar. | Ingrese a **Perfil $\rightarrow$ Papelera**, localice el ejemplar eliminado y presione **Restaurar** para devolverlo íntegro a su jardín. |

> **Nota de Arquitectura y Borrado Seguro (*Code Freeze* — Versión 2.0.0):** Con el objetivo de proteger la integridad referencial en **PostgreSQL (3NF)** y evitar pérdidas accidentales de información en entornos *Offline-First* (**SQLite**), **F.L.O.R.A. v2.0.0** implementa un protocolo de **eliminación lógica en dos etapas (*Soft Delete* + Papelera)**: al eliminar un ejemplar desde el jardín, sus alertas locales se cancelan de inmediato y el registro pasa a cuarentena recuperable en **Papelera**, permitiendo su restauración íntegra o su purga definitiva controlada.