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

Esta funcionalidad opera como la continuación directa del proceso de reconocimiento botánico, permitiendo determinar la ubicación física ideal del ejemplar dentro del vivero o jardín a partir de sus requerimientos fisiológicos detectados:

1. **Obtención de Resultados Botánicos:** Tras capturar o seleccionar la fotografía de la planta y visualizar su ficha de identificación en la **pantalla de resultados**, seleccione la opción de **Evaluación Lumínica** (o *Evaluar Ubicación*) disponible en dicha vista.
2. **Medición del Espacio Destino:** Diríjase al sector del invernadero, patio o jardín donde planea ubicar la planta y apunte la cámara del dispositivo hacia la fuente de iluminación natural o artificial predominante en ese punto.
3. **Diagnóstico de Compatibilidad en Tiempo Real:** El sistema contrasta automáticamente la intensidad lumínica captada en el entorno con los parámetros ideales de exposición solar de la especie recién identificada, indicando en pantalla si el lugar resulta **Óptimo**, **Aceptable** o **Riesgoso** antes de registrar definitivamente su ubicación en el inventario.
## 6. Diagnóstico Fitopatológico y Control de Plagas
Si observa deterioro físico en alguno de sus ejemplares:
1. Ingrese a la ficha de la planta desde **Jardín** y seleccione **Diagnosticar Salud**.
2. Marque los síntomas observables mediante los íconos descriptivos (manchas foliares, polvillo blanco, amarilleamiento, bordes secos, presencia de plagas o estado del sustrato).
3. El motor de diagnóstico entregará la patología o estrés probable, su nivel de severidad y el tratamiento orgánico o preventivo recomendado.

---

## 7. Gestión del Jardín, Agenda de Riego y Gamificación

- **Generación Automática tras el Escaneo y Guardado:** Inmediatamente después de identificar una planta y guardarla en su colección (**Guardar en Jardín**), el sistema calcula su ciclo hídrico personalizado según los requerimientos fisiológicos de la especie y su tratamiento específico, incorporándola automáticamente en la pestaña inferior **Agenda**.
- **Calendario Cronológico y Cuenta Regresiva ("Agenda"):** La vista **Agenda** organiza cronológicamente los próximos riegos indicando **en cuántos días corresponde volver a regar** cada ejemplar (ej. *Hoy*, *En 3 días*, *En 7 días*), junto con la fecha exacta (ej. *Mié 18 Nov*), el intervalo de frecuencia (ej. *Cada 7 días*) y el ambiente (*Interior* / *Exterior*).
- **Interpretación Correcta de la Frecuencia (Intervalos vs. Días Consecutivos):** El intervalo indicado por la aplicación depende directamente de la especie y del tratamiento de cuidado que requiera cada ejemplar:
  - **Qué significa "Cada 7 días" (Intervalo de espera):** Consiste en **regar un solo día**, esperar una semana completa a que el sustrato drene y se seque adecuadamente, y recién cumplidos esos 7 días volver a aplicar agua.
  - **Por qué no son "7 días seguidos":** Regar durante siete días consecutivos provocaría saturación de humedad y pudrición de raíces. La cuenta regresiva de **F.L.O.R.A.** controla exactamente esos días de espera entre un riego y otro.
- **Ficha de Planta:** Al seleccionar cualquier ejemplar guardado en **Jardín**, podrá consultar su fotografía, requerimientos de luz y agua, insignia de origen de identificación e historial cronológico de riegos realizados.
- **Registro de Riego, Notificaciones y Racha:** Al marcar un riego como completado, el dispositivo emitirá una confirmación háptica (vibración), reiniciará automáticamente la cuenta regresiva hacia el siguiente ciclo y sumará experiencia a su racha diaria. Si visualiza el aviso *"Recordatorios desactivados (actívalos en Perfil)"*, tóquelo o diríjase a **Perfil** para habilitar las alertas locales programadas en el teléfono.

## 8. Perfil, Accesibilidad Nativa y Trabajo Sin Internet ("Perfil")

Desde la pestaña inferior **Perfil**, puede administrar su cuenta, consultar su avance operativo y gestionar la continuidad de trabajo en terreno:

- **Medallas y Progreso:** Visualice su nivel actual, su racha diaria de cuidado botánico y las barras de progreso para desbloquear logros por constancia e inventario registrado.
- **Notificaciones Locales:** Active o desactive los recordatorios automáticos de riego programados directamente en su teléfono.
- **Accesibilidad Adaptativa del Sistema Operativo:** La interfaz de **F.L.O.R.A.** hereda de forma nativa las preferencias de accesibilidad configuradas en su dispositivo Android. Si usted amplía el **tamaño de letra** o activa/desactiva la **vibración táctil (respuesta háptica)** desde los ajustes generales de su teléfono, la aplicación adaptará automáticamente sus textos y confirmaciones sin requerir configuraciones duplicadas dentro de la app.
- **Operación Offline-First:** Si pierde cobertura celular o Wi-Fi en sectores del invernadero, continúe consultando su jardín, revisando su agenda y registrando actividades con normalidad; la información se resguarda en la base de datos local (**SQLite**) y se sincroniza automáticamente con la nube al restablecerse la conexión.
- **Cierre de Sesión:** Presione **Cerrar sesión** al finalizar su jornada para revocar el acceso activo en el dispositivo y proteger su cuenta.

## 9. Resolución de Problemas Frecuentes (Troubleshooting) y Alcance v2.0.0

| Situación / Mensaje en Pantalla | Causa Probable | Acción Recomendada |
| :--- | :--- | :--- |
| **"No pudimos procesar la imagen"** o baja confianza de acierto | Fotografía desenfocada, a contraluz, con exceso de sombras o especie poco visible. | Ubique la planta bajo luz natural indirecta, centre una sola hoja y presione **Reintentar** o **Usar cuestionario** (*Smart Fallback*). |
| **El código 2FA (OTP) no llega** o indica que ha expirado | Correo filtrado en *Spam* o superación de la ventana de seguridad de **5 minutos (`300 s`)**. | Revise la bandeja de correo no deseado, aguarde el enfriamiento de **30 segundos** y presione **Reenviar código**. |
| **Pérdida de conexión Wi-Fi o datos móviles** dentro del invernadero | Zonas sin cobertura de red en terreno durante la jornada operativa. | Continúe registrando riegos y consultas normalmente; **SQLite** resguarda los datos localmente y los sincroniza al volver la señal. |
| **No suenan los recordatorios de riego** en el teléfono | Notificaciones locales desactivadas en la aplicación o bloqueadas por Android. | Ingrese a la pestaña **Perfil**, habilite **Notificaciones Locales** y confirme el permiso en los ajustes del sistema operativo. |
| **Lectura imprecisa** en la Evaluación Lumínica | Obstrucción parcial del lente de la cámara o medición apuntando al suelo en sombra. | Apunte la cámara directamente hacia la fuente de iluminación predominante del sector donde ubicará la planta. |

> **Nota de Alcance Funcional (*Code Freeze* — Versión 2.0.0):** Con el objetivo de garantizar la integridad referencial en **PostgreSQL (3NF)**, evitar conflictos en la cola de sincronización *Offline-First* (**SQLite** $\rightarrow$ `/api/v1/sync/batch/`) y prevenir alarmas huérfanas programadas en el sistema operativo Android, la eliminación física de ejemplares registrados (*hard delete*) se encuentra formalmente planificada dentro del ciclo evolutivo de la **versión 2.1**.