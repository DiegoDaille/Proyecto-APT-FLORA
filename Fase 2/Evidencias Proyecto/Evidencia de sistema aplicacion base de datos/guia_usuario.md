# GUÍA DE USUARIO — PLATAFORMA MÓVIL F.L.O.R.A. (v2.0.0)
**Sistema de Asistencia Botánica, Control de Riego y Diagnóstico Fitopatológico**

---

## 1. Introducción y Ficha Técnica
**F.L.O.R.A.** (*Framework Logístico de Optimización y Riego Automatizado*) es una aplicación móvil diseñada para facilitar el inventario botánico, la planificación hídrica y la detección temprana de enfermedades en jardines, viveros e invernaderos. Su arquitectura híbrida **Offline-First** permite operar tanto con conexión a internet (utilizando Inteligencia Artificial en la nube) como en zonas sin cobertura celular (mediante persistencia local automática en **SQLite**).

- **Versión del Software:** `2.0.0` (`cl.duocuc.floraapp`)
- **Plataforma Compatible:** Dispositivos móviles con sistema operativo **Android 8.0 (Oreo)** o superior.
- **Conectividad:** Operación continua sobre redes Wi-Fi, datos móviles (4G/5G) y modo sin conexión (*Offline*).
- **Permisos Requeridos del Sistema:**
  - **Cámara y Almacenamiento:** Necesarios para capturar fotografías de especies botánicas y evaluar condiciones lumínicas.
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

## 3. Pantalla Principal ("Jardín") y Mascota Virtual "Espina"
Al ingresar, visualizará la pestaña **Jardín**, que concentra el inventario de sus plantas registradas y al asistente virtual **"Espina"**, cuyo estado refleja la salud general de su cultivo:

- **Estados Dinámicos:** Espina modifica su expresión visual (feliz, emocionado, neutral, sediento o durmiendo) en tiempo real según el cumplimiento de los riegos programados en su agenda.
- **Widget Flotante de Progreso:** En pantalla se muestra su nivel actual de experiencia (ej. `Nv.1`) y su racha consecutiva de días cumpliendo sus tareas de cuidado (ej. `1d`).
- **Posicionamiento Libre, Minimización y Expansión:** En secciones con listados cronológicos como **Agenda**, puede arrastrar y reubicar libremente el widget de Espina hacia cualquier zona de la pantalla para evitar que cubra las tarjetas de riego, además de poder minimizarlo o agrandarlo con un toque según su comodidad visual.


## 4. Identificación de Especies Botánicas ("Escanear")
Desde la pestaña inferior **Escanear**, dispone de un sistema de identificación inteligente de doble nivel (**Smart Fallback**):

### A. Nivel 1: Reconocimiento por Fotografía (Inteligencia Artificial)
1. Siga las recomendaciones preventivas en pantalla (luz natural indirecta, una hoja o flor centrada, enfoque nítido y fondo despejado).
2. Capture una fotografía con la cámara o seleccione una imagen desde su galería.
3. El sistema analizará la captura mediante visión artificial y mostrará las especies candidatas junto con una **Insignia de Certidumbre** verde (ej. *Verificada por IA: 63%*) que indica el porcentaje de confianza del modelo.

### B. Nivel 2: Cuestionario Botánico Asistido (Modo Offline / Respaldo)
Si se encuentra dentro de un invernadero sin señal de internet o el servicio externo de IA presenta intermitencia, la aplicación conmutará automáticamente (o mediante el enlace **Identificar mediante preguntas**) hacia el motor heurístico local:
1. Responda **3 preguntas visuales** sobre la **forma de las hojas**, el **hábito de crecimiento** y la **ubicación** (interior o exterior).
2. El motor local calculará las especies más probables del catálogo sin consumir datos móviles, etiquetándolas con una insignia azul (*Clasificación Heurística Local*).

### C. Indicadores de Transparencia, Historial y Atribución
- **Indicador de Estado de IA:** Un banner superior informa en tiempo real si el motor en la nube está operativo (*"Identificación por IA disponible"*) o si el sistema activó el respaldo local preventivo (*"IA con problemas: usaremos el cuestionario"*).
- **Modo Demostración:** Si el servicio externo no se encuentra disponible y el respaldo de demostración está habilitado, la aplicación mostrará una alerta explícita advirtiendo que los resultados desplegados son de ejemplo y no corresponden a un análisis real de su fotografía.
- **Últimas Identificaciones (SQLite):** En la sección inferior de **Escanear** se almacenan localmente los últimos **3 escaneos realizados**, mostrando su fotografía en miniatura, nombre común, nombre científico, insignia de certeza y tiempo transcurrido.
- **Atribución Tecnológica:** El reconocimiento fotográfico integra tecnología impulsada por *Pl@ntNet v2 Vision API*.

---

## 5. Evaluación Lumínica y Compatibilidad Ambiental
Antes de ubicar una nueva planta en un sector del jardín o invernadero:
1. Acceda al **Escáner de Entorno** y apunte la cámara hacia la fuente de iluminación natural o artificial del lugar.
2. La aplicación evaluará la intensidad lumínica ambiental y mostrará en pantalla si el espacio resulta **óptimo**, **aceptable** o **riesgoso** respecto a los requerimientos fisiológicos de la especie seleccionada.

---

## 6. Diagnóstico Fitopatológico y Control de Plagas
Si observa deterioro físico en alguno de sus ejemplares:
1. Ingrese a la ficha de la planta desde **Jardín** y seleccione **Diagnosticar Salud**.
2. Marque los síntomas observables mediante los íconos descriptivos (manchas foliares, polvillo blanco, amarilleamiento, bordes secos, presencia de plagas o estado del sustrato).
3. El motor de diagnóstico entregará la patología o estrés probable, su nivel de severidad y el tratamiento orgánico o preventivo recomendado.

---

## 7. Gestión del Jardín, Agenda de Riego y Gamificación
- **Ficha de Planta:** Al seleccionar cualquier ejemplar en **Jardín**, podrá consultar su fotografía, requerimientos de luz y agua, insignia de origen de identificación e historial cronológico de riegos.
- **Calendario Cronológico ("Agenda"):** La pestaña inferior **Agenda** organiza automáticamente los próximos riegos por fecha (ej. *Mié 18 Nov*, *Vie 20 Nov*), indicando el intervalo de frecuencia (ej. *Cada 7 días*) y el ambiente (*Interior* / *Exterior*).
- **Registro de Riego y Notificaciones:** Al marcar un riego como completado, el dispositivo emitirá una confirmación háptica (vibración), recalculará la siguiente fecha del ciclo y sumará experiencia a su racha diaria. Si visualiza el aviso *"Recordatorios desactivados (actívalos en Perfil)"*, tóquelo o diríjase a **Perfil** para habilitar las alertas locales.

---

## 8. Perfil, Accesibilidad y Trabajo Sin Internet ("Perfil")
Desde la pestaña inferior **Perfil**, puede administrar su cuenta, revisar su progreso y adaptar la interfaz:

- **Medallas y Progreso:** Visualice su nivel actual, racha de cuidado y barras de progreso para desbloquear logros por constancia e inventario botánico.
- **Notificaciones Locales:** Active o desactive los recordatorios automáticos de riego en su teléfono.
- **Accesibilidad Visual (Tamaño de Texto):** Ajuste la escala tipográfica entre *Normal*, *Grande* y *Más grande* para facilitar la lectura bajo luz solar directa en terreno.
- **Vibración Háptica:** Habilite o deshabilite la respuesta táctil al confirmar acciones.
- **Operación Offline-First:** Si pierde cobertura celular o Wi-Fi, continúe consultando su jardín, revisando su agenda y realizando identificaciones manuales con normalidad; la información se resguarda en la base de datos local (**SQLite**) y se sincroniza automáticamente con la nube al restablecerse la conexión.
- **Cierre de Sesión:** Presione **Cerrar sesión** al finalizar su jornada para proteger el acceso a su cuenta.

---

## 9. Resolución de Problemas Frecuentes (Troubleshooting) y Alcance v2.0

| Situación / Mensaje en Pantalla | Causa Probable | Acción Recomendada |
| :--- | :--- | :--- |
| **"No pudimos procesar la imagen"** | Fotografía desenfocada, a contraluz o con exceso de sombras. | Ubique la planta bajo luz natural indirecta, centre una sola hoja y presione **Reintentar** o **Usar cuestionario**. |
| **La primera consulta en la nube tarda ~1 minuto** | El servidor en la nube entró en reposo energético por inactividad prolongada. | Aguarde unos segundos a que el servicio se reactive; las siguientes consultas responderán en milisegundos. |
| **El escáner pasa directo al cuestionario** | Ausencia de señal móvil o activación preventiva del *Circuit Breaker* (ventana de 60 s tras fallos de red). | Complete las 3 preguntas del cuestionario local; el sistema retomará la IA automáticamente tras 1 minuto. |
| **Error de autorización al sincronizar** | Token de sesión JWT caducado tras instalar una actualización de la aplicación. | Ingrese a **Perfil**, presione **Cerrar sesión** y vuelva a iniciar sesión con su correo y contraseña. |

> **Nota de Alcance Funcional (Versión 2.0.0):** Con el objetivo de garantizar la integridad referencial del historial de riegos, las rachas de gamificación y los recordatorios locales programados en el sistema operativo, la eliminación física de ejemplares registrados se encuentra planificada dentro del ciclo evolutivo de la **versión 2.1**.