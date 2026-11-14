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
│   └── mascot/                   # Estados gráficos deterministas de "Espina" (FSM)
├── src/
│   ├── components/               # Componentes UI reutilizables (CertaintyBadge, DemoPanel,
│   │                             # DynamicPlantMascot, MascotaWidget, PhotoPicker, etc.)
│   ├── config/                   # appConfig.js (Resolución dinámica de entornos Dev/Prod)
│   ├── context/                  # Estado global reactivo (Auth, Notifications, Pet, Plants)
│   ├── data/                     # quiz.js (Reglas heurísticas), species.json (Catálogo local)
│   ├── hooks/                    # useNetworkStatus.js (Detección de conectividad en tiempo real)
│   ├── mocks/                    # Datos simulados para pruebas y modo demostración
│   ├── navigation/               # AppNavigator, AuthStack, RootNavigator, ScanStack, navigationRef
│   ├── polyfills/                # Compatibilidad de APIs nativas en entorno Hermes/Expo
│   ├── screens/                  # Vistas: Login, Register, VerifyCode, Home, Scan, ManualQuiz,
│   │                             # EnvironmentScan, CompatibilityResult, Diagnosis,
│   │                             # WateringSchedule, PlantDetail, PlantHistory, Profile
│   ├── services/                 # Capa de negocio, red y persistencia:
│   │                             # - Resiliencia y API: aiCircuit.js, api.js, apiClient.js,
│   │                             #   config.js, demoSettings.js, plantIdService.js
│   │                             # - Persistencia Offline: db.js, db.web.js, historyDb.js,
│   │                             #   photoStorage.js, syncService.js, tokenStorage.js
│   │                             # - Dominio: authService.js, diagnosisService.js, imageService.js,
│   │                             #   lightService.js, notificationService.js, photoUploadService.js,
│   │                             #   plantService.js
│   ├── theme/                    # theme.js (Tokens de diseño, tipografía escalable y contraste)
│   └── utils/                    # Funciones puras y algoritmos: certainty.js, compatibility.js,
│                                 # compressPhoto.js, dates.js, light.js, petFsm.js, base64.js,
│                                 # plantPayload.js, reminders.js, schedule.js, streak.js,
│                                 # timeAgo.js, validation.js, watering.js
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

### Paso 2: Generación de Compilaciones desde Código Fuente (Solo Auditoría / Desarrollo)
El entorno de desarrollo local (`npx expo start`) está reservado exclusivamente para depuración interna, ya que la bandera `__DEV__` redirige el tráfico hacia interfaces de bucle invertido (`10.0.2.2` o IP LAN) bloqueadas en dispositivos externos. Para generar una nueva compilación distribuible conectada a producción:

```powershell
# 1. Instalar dependencias exactas del proyecto
npm install

# 2. Compilar paquete binario nativo Android en la nube (caché limpia)
eas build --profile preview --platform android --clear-cache
### Paso 2: Verificación de Salud y Compilación APK
```bash
# Auditar integridad de dependencias nativas (18/18 checks)
npx expo-doctor

# Generar binario ejecutable Android (.apk) en EAS Cloud
eas build -p android --profile preview
```

---

## 4. Seguridad y Gobernanza Cloud ($0 USD)
- **Inyección Segura de Secretos (Render Cloud):** Todas las llaves críticas (`SECRET_KEY` de Django, `PLANTNET_API_KEY`, credenciales de conexión a PostgreSQL y parámetros de servicio) se inyectan exclusivamente en tiempo de ejecución dentro de la memoria RAM del contenedor en Render, sin exponerse en el código fuente ni en el control de versiones.
- **Almacenamiento Cifrado en Cliente (OWASP Mobile M9):** Los tokens de sesión **JWT** en el dispositivo Android se resguardan mediante el almacén criptográfico nativo `expo-secure-store`, previniendo accesos no autorizados desde el sistema de archivos.
- **Seguridad en Tránsito (TLS/HTTPS):** Toda comunicación entre el cliente móvil y la API productiva viaja cifrada bajo protocolo HTTPS, aplicando políticas estrictas de CORS y validación de esquemas en Django REST Framework.

---

## 5. Variables de Entorno y Configuración Cloud (12-Factor App)

Siguiendo el principio de separación estricta entre código y configuración (*Factor III — Config*), los parámetros operativos se gestionan de forma centralizada en la nube:

- **Backend Productivo (Render Environment + Supabase):** Configurado mediante variables de entorno en el panel de Render (documentadas estructuralmente en `flora_backend/.env.example`):
  - `DATABASE_URL`: Cadena de conexión hacia **PostgreSQL en Supabase** (vía *Connection Pooler* para gestión eficiente de conexiones concurrentes).
  - `PLANTNET_API_KEY`: Credencial privada para consultas al motor externo de visión artificial *Pl@ntNet v2*.
  - `SECRET_KEY` / `ALLOWED_HOSTS`: Clave criptográfica de Django y restricción de dominio productivo (`flora-backend-api.onrender.com`).
- **Cliente Móvil (`flora_app/src/config/appConfig.js`):** En artefactos compilados (`__DEV__ === false`), la aplicación ignora interfaces locales y enruta automáticamente todas las peticiones hacia `https://flora-backend-api.onrender.com/api/v1`.

---

## 6. Operación en la Nube y Aseguramiento de Calidad (QA)

El servidor backend no requiere levantamiento manual en consola local, ya que se encuentra desplegado de forma continua en infraestructura cloud con despliegue automático desde repositorio Git.

### Verificación de Servicios Productivos (Render & Supabase)
- **Endpoint Base API REST:** `https://flora-backend-api.onrender.com/api/v1/`
- **Sondeo de Salud (Health Check / Keep-Alive):**
  ```bash
  curl -I [https://flora-backend-api.onrender.com/api/v1/health/](https://flora-backend-api.onrender.com/api/v1/health/)

## 7. Endpoints REST Principales (Producción Render Cloud)

Todos los servicios se exponen bajo el prefijo versionado `/api/v1/` y están documentados formalmente mediante el contrato **OpenAPI 3.0** (`flora_backend/schema.yml`).

| Método | Endpoint | Descripción | Seguridad / Estándar |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health/` | Sonda de disponibilidad del servidor WSGI y enlace con PostgreSQL (*Keep-Alive*). | Público (12-Factor App) |
| `POST` | `/api/v1/auth/login/` | Autenticación de credenciales y emisión de tokens de acceso (**JWT**). | HTTPS/TLS + JWT |
| `POST` | `/api/v1/auth/token/refresh/` | Renovación controlada de sesión ante expiración del token de acceso. | JWT Refresh Token |
| `POST` | `/api/v1/identify/` | Patrón BFF: recepción binaria (`RFC 7578`) y consulta cifrada a *Pl@ntNet API v2*. | JWT + OWASP Mobile M9 |
| `GET / POST` | `/api/v1/plants/` | Sincronización bidireccional de inventario botánico y bitácora de riegos (3NF). | JWT + Integridad SQL |
| `GET` | `/api/docs/` | Interfaz interactiva de exploración y prueba de contratos REST (Swagger UI). | OpenAPI 3.0 |

---

## 8. Gestión de Alcance (v2.0.0), Licencia y Autoría

- **Control de Alcance (*Code Freeze*):** La versión **2.0.0** consolida la estabilidad operativa del ciclo de captura, identificación híbrida (*Smart Fallback*), agenda cronológica y sincronización *Offline-First*. Las operaciones destructivas de entidades (eliminación física de ejemplares con borrado en cascada de alarmas locales) se encuentran planificadas en el *Backlog* evolutivo de la versión **2.1**.
- **Licencia y Sostenibilidad:** Proyecto distribuido bajo los términos establecidos en el archivo `LICENSE` del repositorio. Ingeniería y desarrollo *full-stack* orientados a la gestión botánica sostenible del **Vivero Las Acacias**, operando sobre arquitectura *Cloud-Native* a **$0 USD** de costo operacional.