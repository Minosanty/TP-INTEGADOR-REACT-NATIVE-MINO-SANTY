# Biblioteca IPF

App integradora desarrollada con Expo Router y React Native.

## Ejecución

Requisitos: Node.js, npm y Expo Go para SDK 58.

```bash
npm install
npx expo start --lan --clear
```

El proyecto usa Expo SDK 58 (`expo` `~58.0.26`) y es compatible con Expo Go para SDK 58. Para conectarlo al teléfono, ambos dispositivos deben estar en la misma red Wi-Fi; ejecutá `npx expo start --lan --clear` y escaneá el QR desde Expo Go. Si la red bloquea conexiones locales, iniciá sesión con `npx expo login` y probá `npx expo start --tunnel`.

Credenciales personales:

- Usuario: `personal`
- Clave: `biblioteca123`

## Rutas requeridas y navegación

| URL | Archivo | Navegador / protección |
|---|---|---|
| `/` | `src/app/(tabs)/(catalogo)/index.tsx` | Tab Catálogo, dentro de su Stack |
| `/libro/[isbn]` | `src/app/(tabs)/(catalogo)/libro/[isbn].tsx` | Stack de Catálogo |
| `/buscar?q=` | `src/app/buscar.tsx` | Stack raíz; `q` se mantiene en la URL |
| `/escanear` | `src/app/escanear.tsx` | Stack raíz |
| `/reservar/[isbn]` | `src/app/reservar/[isbn].tsx` | Modal raíz |
| `/reservas` | `src/app/(tabs)/reservas.tsx` | Tab Mis reservas |
| `/permisos/[recurso]` | `src/app/permisos/[recurso].tsx` | Modal raíz |
| `/login` | `src/app/login.tsx` | Modal, solo sin sesión |
| `/mostrador` | `src/app/mostrador.tsx` | Stack raíz, solo con sesión |
| `/reserva` | `src/app/reserva.tsx` | Redirige a `/reservas` |
| Otra URL | `src/app/+not-found.tsx` | 404 con la URL recibida |

`src/app/(tabs)/_layout.tsx` declara las tabs; `src/app/(tabs)/(catalogo)/_layout.tsx` declara el Stack propio del catálogo. La navegación raíz usa `Stack.Protected` para login y mostrador. El `anchor` `(tabs)` mantiene una pestaña debajo de deep links.

## Plugins y permisos

```json
"plugins": [
  "expo-router",
  ["expo-camera", {
    "cameraPermission": "Usamos tu cámara para leer el ISBN impreso en el código de barras del libro.",
    "microphonePermission": false,
    "recordAudioAndroid": false,
    "blockedPermissions": ["android.permission.RECORD_AUDIO"]
  }],
  ["expo-notifications", {
    "color": "#1D4ED8",
    "sounds": []
  }],
  "expo-font"
]
```

| Recurso | Módulo | Momento | Alternativa |
|---|---|---|---|
| Cámara | `expo-camera` | Al ingresar a `/escanear` o desde su pantalla previa | Escribir el ISBN manualmente |
| Notificaciones | `expo-notifications` | Al activar “Recordarme” | Aviso dentro de `/reservas` |

En Android, Expo Go usa su canal de notificaciones de respaldo; la app crea su canal propio solo en una compilación nativa. Así se evita el fallo de `setNotificationChannelAsync` de Expo Go sin perder los recordatorios locales.

Las claves bloqueadas quedan declaradas como mínimo privilegio:

- `android.permission.RECORD_AUDIO`: la cámara no graba audio.
- Permisos de ubicación: la app no usa ubicación.
- Lectura externa: la app no abre galería ni archivos externos.

No se usa `expo-permissions`, ubicación ni selección de imágenes.

## Deep links de prueba

- `bibliotecaipf://libro/9788437604947`
- `bibliotecaipf://libro/9780547928227`
- `bibliotecaipf://libro/9780451524935`
- `bibliotecaipf://libro/123`
- `bibliotecaipf://buscar?q=borges`
- `bibliotecaipf://mostrador`
- `bibliotecaipf://reserva`
- `bibliotecaipf://escanear`

En Expo Go se puede probar con `exp://IP:8081/--/buscar?q=borges`.

## Validación

```bash
npx tsc --noEmit
npx expo lint
npm test -- --runInBand
npx expo export --platform android
```

En la última verificación, TypeScript y ESLint finalizaron sin errores; los tests de Pila, Cola e ISBN pasaron y Expo generó el bundle Android. La prueba final de cámara y diálogos de permisos debe realizarse en un teléfono físico con Expo Go SDK 58.
