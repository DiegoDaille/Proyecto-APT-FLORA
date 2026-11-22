# F.L.O.R.A. (v2.0.0) — Sistema Inteligente de Gestión Botánica y Trazabilidad Fitopatológica

Plataforma móvil multiplataforma de arquitectura desacoplada y operación **Offline-First**, diseñada para optimizar el inventario botánico, el control de riego y el diagnóstico fitopatológico en el **Vivero Las Acacias** con un costo operacional de **$0 USD**.

---

## 1. Arquitectura y Estándares de Ingeniería

El sistema implementa una arquitectura cliente-servidor bajo la metodología **12-Factor App**, garantizando portabilidad, tolerancia a fallos y seguridad de credenciales:

- **Cliente Nativo (Frontend):** React Native `0.86.3` + Expo SDK `~57.0.32` (compilado a Hermes Bytecode `.hbc` mediante **EAS Build**, `versionCode: 2`).
- **Servidor API REST (Backend):** Django REST Framework desplegado en contenedor inmutable **Docker** (`python:3.11-slim` + Gunicorn) sobre **Render Cloud PaaS**.
- **Persistencia en la Nube:** PostgreSQL 15 en **Supabase DBaaS** bajo modelo relacional en **Tercera Forma Normal (3NF)** vía Connection Pooler (puerto `6543`).
- **Persistencia Local (Offline-First):** Motor embebido **Expo SQLite** (`~57.0.4`) para operación continua sin cobertura 4G/5G a `0 ms` de latencia.
- **Reconocimiento Taxonómico Dual (Smart Fallback):**
  * *Nivel 1 (Online BFF):* Integración con **Pl@ntNet API v2** (>40.000 especies) encapsulada en el backend para evitar la exposición de llaves API en el paquete móvil.
  * *Nivel 2 (Offline Local):* Patrón **Circuit Breaker** (`aiCircuit.js`) con ventana de recuperación de `60 s` y conmutación automática a un **Sistema Experto Heurístico** (`quiz.js`, `diagnosisService.js`).
- **Seguridad y Accesibilidad:** Resguardo cifrado de tokens **JWT** mediante `expo-secure-store` (**OWASP Mobile M9**), comunicaciones sobre **HTTPS/TLS**, calidad regida por **ISO/IEC 25010** y accesibilidad **WCAG 2.1 Nivel AA** (iconografía vectorial `@expo/vector-icons`, escalado tipográfico dinámico y retroalimentación háptica).

## 2. Estructura del Proyecto

### Cliente Móvil (`flora_app/`)
```text
flora_app/
├── assets/
│   ├── mascot/                   # Estados gráficos deterministas de "Espina" (FSM)
│   ├── favicon.ico               # Ícono web de la aplicación
│   ├── icon.png                  # Ícono principal del lanzador de la aplicación
│   └── notification-icon.png     # Ícono monocromático nativo para notificaciones Android
├── src/
│   ├── components/               # Componentes UI reutilizables (CertaintyBadge, DemoPanel,
│   │                             # DynamicPlantMascot, MascotaWidget, PhotoPicker,
│   │                             # ThemePicker, WeatherCard, WeekStrip, etc.)
│   ├── config/                   # appConfig.js (Resolución dinámica de entornos Dev/Prod)
│   ├── context/                  # Estado global reactivo: AuthContext, NotificationsContext,
│   │                             # PetContext, PlantsContext, ThemeContext
│   ├── data/                     # quiz.js (Reglas heurísticas), species.json (Catálogo local)
│   ├── hooks/                    # useNetworkStatus.js (Detección de conectividad en tiempo real)
│   ├── mocks/                    # Datos simulados para pruebas y modo demostración (auth, plants)
│   ├── navigation/               # AppNavigator, AuthStack, RootNavigator, ScanStack, navigationRef
│   ├── polyfills/                # Compatibilidad de APIs nativas en entorno Hermes/Expo
│   ├── screens/                  # Vistas: Login, Register, VerifyCode, Home, Scan, ManualQuiz,
│   │                             # EnvironmentScan, CompatibilityResult, Diagnosis,
│   │                             # WateringSchedule, PlantDetail, PlantHistory,
│   │                             # PlantProgress, PlantTrash, Profile
│   ├── services/                 # Capa de negocio, red y persistencia:
│   │                             # - Resiliencia y API: aiCircuit.js, api.js, apiClient.js,
│   │                             #   config.js, demoSettings.js, plantIdService.js,
│   │                             #   weatherService.js
│   │                             # - Persistencia Offline: db.js, db.web.js, historyDb.js,
│   │                             #   photoStorage.js, plantPhotosDb.js, plantTrash.js,
│   │                             #   syncService.js, tokenStorage.js
│   │                             # - Dominio y Gamificación: authService.js, diagnosisService.js,
│   │                             #   imageService.js, lightService.js, notificationService.js,
│   │                             #   photoUploadService.js, plantService.js, secretAchievements.js
│   ├── theme/                    # theme.js, themes.js (Tokens de diseño, paletas dinámicas,
│   │                             # tipografía escalable y contraste WCAG 2.1 AA)
│   ├── utils/                    # Funciones puras y algoritmos: base64.js, certainty.js,
│   │                             # compatibility.js, compressPhoto.js, dates.js, haptics.js,
│   │                             # light.js, petFsm.js, plantPayload.js, reminders.js,
│   │                             # schedule.js, seasonal.js, streak.js, timeAgo.js,
│   │                             # validation.js, watering.js
│   └── widgets/                  # Widget nativo de pantalla de inicio Android:
│                                 # RiegoWidget.js, widgetSync.js, widgetTaskHandler.js
├── App.js                        # Punto de entrada principal de la aplicación
├── app.json                      # Configuración nativa de Expo (v2.0.0 / versionCode 2)
├── eas.json                      # Perfiles de compilación en la nube (EAS Build)
├── guia_usuario.md               # Manual operativo estandarizado (ISO/IEC/IEEE 26514)
├── metro.config.js               # Configuración del empaquetador Metro Bundler
├── package.json                  # Dependencias y scripts de ejecución
└── verificar_flora.ps1           # Script automatizado de auditoría y verificación local

### Servidor Backend (`flora_backend/`)
```text
flora_backend/
├── accounts/                     # Autenticación JWT, gestión de usuarios y seguridad de acceso
├── config/                       # Configuración central Django, CORS, seguridad y WSGI
├── identification/               # Patrón BFF para comunicación cifrada con Pl@ntNet API v2
├── plants/                       # Endpoints REST de inventario, riegos y bitácoras (3NF)
├── media/                        # Almacenamiento de capturas botánicas asociadas a ejemplares
├── staticfiles/                  # Archivos estáticos compilados para producción (WhiteNoise)
├── .coveragerc                   # Configuración de métricas de cobertura de código (Coverage)
├── .dockerignore                 # Exclusión de artefactos locales en construcción de contenedores
├── .env.example                  # Plantilla de variables de entorno requeridas (sin secretos)
├── .gitignore                    # Control de exclusiones del repositorio Git
├── build.sh                      # Script automatizado de construcción y migración en despliegue
├── conftest.py                   # Fixtures globales y configuración de entorno para Pytest
├── docker-compose.yml            # Orquestación de servicios en entorno local containerizado
├── Dockerfile                    # Definición de imagen inmutable de producción
├── entrypoint.sh                 # Script de arranque del contenedor y servidor WSGI (Gunicorn)
├── manage.py                     # Utilidad CLI administrativa de Django
├── pytest.ini                    # Configuración de suite de pruebas unitarias e integración
├── render.yaml                   # Infraestructura como código (IaC) para Render Cloud
├── requirements.txt              # Dependencias estrictas de producción
├── requirements-dev.txt          # Dependencias de auditoría, linting y pruebas automatizadas
└── schema.yml                    # Contrato de API bajo especificación OpenAPI 3.0
```

---

## 3. Instalación y Ejecución del Sistema (Producción v2.0.0)

**F.L.O.R.A. v2.0.0** (`cl.duocuc.floraapp`) se distribuye como una aplicación nativa compilada en la nube mediante **Expo Application Services (EAS Build)**. A diferencia de entornos de prototipado local (*Expo Go*), el binario nativo ejecuta directamente el motor **Hermes**, la base de datos embebida **SQLite** y las notificaciones locales del sistema operativo, conectándose de forma autónoma al servidor productivo en **Render Cloud**.

### Requisitos del Sistema
- **Dispositivo Móvil:** Smartphone o tablet con **Android 8.0 (Oreo)** o superior.
- **Conectividad:** Red Wi-Fi o datos móviles (4G/5G) para autenticación JWT, sincronización y reconocimiento por IA; operación **Offline-First** garantizada en zonas sin señal.
- **Permisos Nativos:** Cámara (captura botánica y medición lumínica), Almacenamiento y Notificaciones locales.

### Paso 1: Instalación en Dispositivo Android (Entorno Productivo)
1. Descargue el instalador **`flora-app-v2.0.0.apk`** desde el portal de compilaciones de **EAS Build** o escanee el código **QR** de liberación oficial.
2. Abra el archivo `.apk` en su teléfono Android y autorice la instalación de la aplicación.
3. Al iniciar **F.L.O.R.A.**, el cliente enrutará automáticamente todas las peticiones mediante **HTTPS (TLS)** hacia la API productiva en la nube:
   `https://flora-backend-api.onrender.com/api/v1/`
### 4. Generación de Compilaciones desde Código Fuente (Auditoría y Reproducibilidad)

El entorno de desarrollo local (`npx expo start`) está reservado exclusivamente para depuración interna, ya que la bandera `__DEV__` redirige el tráfico hacia interfaces de bucle invertido (`10.0.2.2` o IP LAN) bloqueadas en dispositivos externos.

Si un auditor o desarrollador externo desea compilar un nuevo binario `.apk` conectado a producción desde este código fuente, debe desvincular el identificador original de compilación (`projectId`) siguiendo este procedimiento:

1. **Instalar dependencias, auditar salud y autenticarse en Expo:**
   Cree una cuenta gratuita en [expo.dev](https://expo.dev) e inicie sesión desde la terminal dentro de la carpeta raíz de la aplicación móvil:
   ```powershell
   # 1. Instalar dependencias exactas del proyecto
   npm install

   # 2. Auditar integridad de dependencias nativas (18/18 checks)
   npx expo-doctor

   # 3. Iniciar sesión con su cuenta de Expo
   npx eas-cli login

## 4. Seguridad, Gobernanza Cloud y Disponibilidad ($0 USD)

- **Inyección Segura de Secretos (Render Cloud):** Todas las credenciales críticas (`SECRET_KEY` de Django, `PLANTNET_API_KEY`, credenciales SMTP de **Brevo** para el despacho de correos de verificación y la cadena `DATABASE_URL` hacia Supabase) se inyectan exclusivamente en tiempo de ejecución dentro de la memoria RAM del contenedor en Render, sin exponerse en el código fuente ni en el control de versiones.
- **Autenticación en Dos Pasos (2FA) y Resguardo Cifrado (OWASP Mobile M9):** Tanto el registro de cuentas como el inicio de sesión exigen validar un código temporal de un solo uso (**OTP**) enviado al correo electrónico del usuario. Una vez verificada la identidad, los tokens de sesión **JWT** se almacenan en el dispositivo Android mediante el almacén criptográfico nativo `expo-secure-store`, previniendo accesos no autorizados desde el sistema de archivos.
- **Seguridad en Tránsito (TLS/HTTPS):** Toda comunicación entre la aplicación móvil y la API productiva viaja cifrada bajo protocolo HTTPS, aplicando políticas estrictas de CORS y validación de esquemas en Django REST Framework.
- **Activación y Sonda de Salud del Servidor (*Warmup / Health Check*):** Debido a que la infraestructura PaaS gratuita (`$0 USD`) hiberna los contenedores tras periodos de inactividad (*Cold Start*), el servidor backend se activa y verifica en tiempo real accediendo al endpoint público de diagnóstico:
- **Alta Disponibilidad Automatizada (*Keep-Alive Bot*):** Para garantizar respuesta inmediata sin tiempos de espera por inactividad en infraestructura PaaS gratuita (`$0 USD`), un bot externo de monitoreo ejecuta peticiones periódicas automatizadas hacia la sonda de salud `https://flora-backend-api.onrender.com/api/v1/health/`, manteniendo activo el contenedor WSGI en Render y verificando continuamente la conectividad con **PostgreSQL en Supabase**.
## 5. Variables de Entorno y Configuración Cloud (12-Factor App)

Siguiendo el principio de separación estricta entre código y configuración (*Factor III — Config*), los parámetros operativos se gestionan de forma centralizada en **Render Cloud** sin comprometer secretos en el control de versiones:

- **Backend Productivo (Render Environment + Supabase):** Configurado mediante variables de entorno en memoria RAM (documentadas estructuralmente en `flora_backend/.env.example`):
  - **Servidor y Ciberseguridad Core:** `DEBUG=False`, `SECRET_KEY` (clave criptográfica de Django) y `ALLOWED_HOSTS` restringido al dominio productivo (`flora-backend-api.onrender.com`).
  - **Persistencia Relacional (3NF):** `DATABASE_URL` hacia **PostgreSQL 15 en Supabase** vía *Connection Pooler* (puerto `6543`) junto con `DB_DISABLE_SERVER_SIDE_CURSORS=True`.
  - **Almacenamiento de Objetos:** `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` y `SUPABASE_BUCKET` (`plant-photos`) para la gestión desacoplada de fotografías botánicas en **Supabase Storage**.
  - **Autenticación 2FA y Sesiones JWT:** `TWO_FACTOR_REQUIRED=True`, `OTP_EXPIRY_SECONDS=300`, `OTP_MAX_ATTEMPTS=5`, `JWT_ACCESS_MINUTES=30` y `JWT_REFRESH_DAYS=7`.
  - **Mensajería Transaccional (Brevo API):** `EMAIL_BACKEND` (`accounts.brevo_backend.BrevoEmailBackend`), `BREVO_API_KEY` y `DEFAULT_FROM_EMAIL` para el despacho vía API HTTP de códigos OTP de verificación.
  - **Visión Artificial y Resiliencia:** `PLANTNET_API_KEY`, `PLANTNET_TIMEOUT_SECONDS=8` e `IDENTIFICATION_FALLBACK_TO_SIMULATED=True` para gobernar la conmutación automática (*Smart Fallback*).
- **Cliente Móvil (`src/config/appConfig.js`):** En compilaciones de producción (`__DEV__ === false`), la aplicación ignora interfaces locales y enruta automáticamente todas las peticiones hacia `https://flora-backend-api.onrender.com/api/v1`.

## 6. Operación en la Nube y Aseguramiento de Calidad (QA)

El servidor backend opera de forma desatendida y continua en infraestructura cloud mediante despliegue automático desde control de versiones, por lo que **no requiere levantar servidores ni consolas locales**.

### Verificación de Servicios Productivos (Render Cloud & Supabase)
- **Endpoint Base API REST:** `https://flora-backend-api.onrender.com/api/v1/`
- **Sonda de Telemetría y Keep-Alive Automatizado:** `https://flora-backend-api.onrender.com/api/v1/health/` *(monitoreada de forma continua por bot de disponibilidad para asegurar respuesta inmediata `200 OK`)*.
- **Contrato Interactivo OpenAPI 3.0 (Swagger UI):** `https://flora-backend-api.onrender.com/api/docs/`
- **Persistencia y Almacenamiento Cloud:** Base de datos relacional **PostgreSQL 15 (3NF)** conectada vía *Transaction Connection Pooler* (puerto `6543`) y almacenamiento de evidencias fotográficas en **Supabase Storage** (`bucket: plant-photos`).
## 7. Endpoints REST Principales (Producción Render Cloud)

Todos los servicios se exponen bajo el prefijo versionado `/api/v1/` sobre protocolo **HTTPS/TLS** y se encuentran documentados formalmente mediante el contrato **OpenAPI 3.0** (`flora_backend/schema.yml`).

- **Explorador Interactivo de APIs (Swagger UI):** [https://flora-backend-api.onrender.com/api/docs/]

| Módulo | Método | Endpoint | Descripción Funcional | Seguridad / Estándar |
| :--- | :--- | :--- | :--- | :--- |
| **Sistema** | `GET` | `/api/v1/health/` | Sonda de disponibilidad del contenedor WSGI y enlace con PostgreSQL (*Warmup* detallado más arriba). | Público (12-Factor App) |
| **Autenticación** | `POST` | `/api/v1/auth/register/`<br>`/api/v1/auth/register/verify/`<br>`/api/v1/auth/register/resend/` | Alta de operario, verificación de cuenta mediante código OTP 2FA vía **Brevo API** y reenvío controlado. | HTTPS/TLS + 2FA OTP |
| **Autenticación** | `POST` | `/api/v1/auth/login/`<br>`/api/v1/auth/2fa/verify/`<br>`/api/v1/auth/2fa/resend/` | Validación de credenciales, verificación OTP (`300 s`, máx. `5` intentos) y emisión de tokens **JWT**. | JWT + OWASP Mobile M9 |
| **Autenticación** | `GET` | `/api/v1/auth/me/` | Obtención del perfil autenticado y metadatos de sesión del usuario activo. | Bearer JWT |
| **Inventario** | `POST` | `/api/v1/plantas/{id}/fotos/` | Carga binaria multiparte (`RFC 7578`) y almacenamiento desacoplado en **Supabase Storage**. | Bearer JWT + Storage |
| **Inventario** | `GET / POST` | `/api/v1/plantas/{id}/riegos/` | Consulta histórica y registro transaccional de eventos de riego por ejemplar (3NF). | Bearer JWT + Integridad SQL |
| **Sincronización** | `POST` | `/api/v1/sync/batch/` | Consolidación atómica por lotes (*Offline-First*) de registros creados sin conexión en terreno. | Bearer JWT + Atomicidad |
| **Fidelización** | `GET / PATCH` | `/api/v1/rachas/me/` | Consulta y actualización de rachas operativas de cuidado botánico del usuario. | Bearer JWT |
| **Diagnóstico IA** | `POST / GET` | `/api/v1/diagnostico/`<br>`/api/v1/diagnostico/sintomas/` | Patrón BFF: análisis fitosanitario y consulta de catálogo de síntomas con respaldo *Smart Fallback*. | Bearer JWT + Aislamiento API |

## 8. Gestión de Alcance (v2.0.0), Licencia y Autoría

- **Control de Alcance (*Code Freeze* v2.0.0):** Esta liberación consolida la estabilidad productiva del núcleo operativo: autenticación multifactor (**2FA/JWT**), identificación botánica y fitosanitaria híbrida (**BFF + *Smart Fallback***), bitácora de riegos con notificaciones locales y sincronización por lotes (*Offline-First* vía `/api/v1/sync/batch/`). Con el objetivo de resguardar la integridad referencial en **PostgreSQL (3NF)** y evitar notificaciones huérfanas en el sistema operativo Android, las operaciones destructivas de eliminación física de ejemplares con borrado en cascada (*hard delete*) se encuentran formalmente planificadas en el *Backlog* evolutivo de la versión **2.1**.
- **Licencia y Sostenibilidad Operativa:** Software distribuido bajo los términos legales establecidos en el archivo `LICENSE` en la raíz de este repositorio. Su arquitectura *Cloud-Native* (**Render Cloud + Supabase + Brevo API**) garantiza una operación continua a **$0 USD** de costo de infraestructura recurrente, asegurando viabilidad económica real para el **Vivero Las Acacias**.
- **Autoría e Ingeniería del Proyecto:** Arquitectura, desarrollo *full-stack* (React Native / Expo SDK + Django REST Framework), aseguramiento de calidad (**ISO/IEC 25010**) y documentación técnica elaborados como solución tecnológica aplicada para la gestión botánica sostenible del **Vivero Las Acacias** (Proyecto de Título — **Duoc UC**).