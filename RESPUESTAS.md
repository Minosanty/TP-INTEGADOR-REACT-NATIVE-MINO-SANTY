# Respuestas técnicas

## Parte B

### B1. Estado y efectos

En `src/hooks/useLibros.ts`, el primer render tiene `libros=[]`, `cargando=true`, `error=null` e `intento=0`; el catálogo muestra el indicador. Después del commit, el efecto invoca `obtenerLibros()`. Al responder correctamente, `libros` recibe los datos y `cargando` termina en `false`; el catálogo dibuja la lista o su estado vacío. Si falla, `error` recibe un mensaje de interfaz y `cargando` pasa a `false`; se muestra el botón Reintentar. React puede agrupar las actualizaciones del mismo turno, así que no hay un número fijo de renders para todas las builds.

Al tocar Reintentar, `reintentar` activa carga, limpia el error y aumenta `intento`. El cambio de `intento`, dependencia del efecto, inicia un pedido nuevo. Si falla también, vuelven a mostrarse el error y el botón.

El catálogo está dentro de un Stack anidado en la tab; al abrir el detalle permanece debajo, y al cambiar de tab normalmente el navegador conserva la pantalla. Por eso esas acciones no implican necesariamente limpieza. `activo=false` se ejecuta cuando cambia `intento` o cuando la pantalla se desmonta; evita que una respuesta tardía actualice una instancia desmontada.

Una función async no se pasa directamente porque el efecto debería devolver una función de limpieza y la API async devuelve una Promise. Por eso el efecto define `cargar()` y ejecuta `void cargar()`.

### B2. Carrera del buscador

El buscador usa `q` en la URL y `setParams`, y espera 300 ms antes de llamar a la API. En el ejemplo, la entrada `bor` a `t=0` todavía no inició una búsqueda cuando llega `borges` en `t=200`; la limpieza cancela ese temporizador. La búsqueda de `borges` empieza en `t=500` y su respuesta llega entre `t=800` y `t=2000`, porque la API añade entre 300 y 1500 ms. Solo se muestra el resultado cuyo `q` coincide con la URL.

Si una búsqueda antigua ya había comenzado, su limpieza marca `activo=false`; cuando resuelve, no puede actualizar el estado. En el escenario hipotético sin debounce de la consigna, aparecería `borges` en `t=500` y la respuesta tardía de `bor` en `t=1400` se descartaría.

Comparar `texto === q` dentro de `.then()` sí puede ayudar, pero `q` sería el valor encerrado por esa ejecución del efecto. La limpieza de este proyecto rechaza explícitamente respuestas viejas mediante la bandera. `setParams` modifica la URL sin agregar entradas al historial; `push` sí agregaría pantallas.

### B3. Cola mutada

Una cola tiene estado interno privado pero no es React state. Mutarla no dispararía render por sí sola. En `src/context/BibliotecaContext.tsx`, cada acción copia la lista en una `Cola` nueva y publica un array nuevo en el Context, lo que provoca un render observable. `Cola` conserva un índice de frente y no usa `shift()`.

Una cola nueva a partir de la anterior conserva orden sin mutar React state, pero requiere reconstrucción; un contador de versión fuerza renders; `useReducer` centraliza acciones pero añade más código.

### B4. Datos

| Dato | Dónde vive |
|---|---|
| Texto buscador | URL (`q`); el TextInput lee directamente el parámetro |
| Préstamos/reservas | Context y AsyncStorage |
| Listas de espera | Context, como arrays protegidos por Cola |
| Recientes | Pila en estado del Context |
| Sesión personal | Context durante la ejecución |
| Ejemplares | Context, porque cambian al reservar/devolver |
| Permiso cámara/notificaciones | Sistema operativo y hook |
| Identificador notificación | En cada préstamo del Context |

Cambiar el value del Context vuelve a renderizar todos los consumidores que usan `useBiblioteca`. Para reducir renders se pueden separar Contexts por dominio, pero no es necesario en esta app pequeña.

## Parte C

### C1. Pila

La tab Catálogo usa su propio Stack y existe una pila raíz:

1. Raíz: `/(tabs)`; tab Catálogo: su Stack muestra Catálogo.
2. Raíz: `/(tabs)`; Stack Catálogo: Catálogo → detalle.
3. La raíz presenta `/reservar/[isbn]` como modal y conserva el Stack de Catálogo debajo.
4. Confirmación usa `router.replace("/reservas")` tanto para préstamo como para espera.
5. Atrás no vuelve a la confirmación reemplazada.
6. El Stack de Catálogo conserva el detalle que estaba debajo; al volver a esa tab puede reaparecer el detalle.

`replace` evita volver a la confirmación. `push` añadiría una entrada y permitiría volver al modal; `dismissTo` intentaría encontrar una ruta previa específica. La raíz declara `(tabs)` como anchor para deep links.

### C2. Escáner

Sin protección, varias ejecuciones de `onBarcodeScanned` encolan varias navegaciones. Se usa `useRef` para bloquear de forma inmediata, con `navegado.current`, porque `setState(true)` puede tardar más que los siguientes callbacks. `replace` evita que el detalle sea abierto varias veces y evita el escáner detrás al tocar atrás.

Un ISBN inexistente muestra un aviso y mantiene la cámara activa. El aviso solo se cambia si el ISBN nuevo difiere del último aviso.

### C3. Deep links

| Deep link | Resultado y base de navegación |
|---|---|
| `/libro/9780547928227` | Detalle del libro sobre el anchor Catálogo |
| `/libro/123` | Mensaje ISBN inválido y acción al Catálogo |
| `/buscar?q=borges` | Buscador con `q` en URL y tabs debajo |
| `/mostrador` sin sesión | `Stack.Protected` impide la ruta y deja la navegación pública |
| `/reserva` | `<Redirect>` lleva a `/reservas` |
| `/escanear` con cámara bloqueada | Escáner permite ISBN manual y ofrece abrir la pantalla previa/Ajustes |

El patrón dinámico `/libro/[isbn]` matchea cualquier segmento. El componente de detalle valida 13 dígitos y comprueba que el dato esté en catálogo; el router solo resuelve la forma de la URL.

### C4. Foco y primer plano

`useEffect([])` detecta montaje. `useFocusEffect` detecta foco de la ruta. `AppState` detecta activo/inactivo/segundo plano. La pantalla de reservas combina `usePermiso`, que usa AppState, por lo que al volver de Ajustes actualiza el estado. Al cambiar tabs, el efecto del hook vuelve a consultar permisos. Sin consulta ni AppState podría mostrar un estado viejo.

## Parte D

### D1. Cámara

| Paso | Acción y pantalla |
|---|---|
| 1 | Desde Catálogo se abre `/permisos/camara`; todavía no se pidió permiso al sistema. |
| 2 | Continuar llama a `useCameraPermissions`; si la persona deniega y `canAskAgain` sigue activo, vuelve al escáner con opción de escribir el ISBN y solicitar otra vez. |
| 3 | Al tocar Escanear nuevamente se muestra otra vez la pantalla previa. |
| 4-5 | Después de las denegaciones, el hook consulta el valor real de `canAskAgain`; si es `false`, el botón cambia a Abrir Ajustes. La cantidad de denegaciones no se fija en el código. |
| 6 | Al volver de Ajustes, `AppState` actualiza el permiso; el botón permite continuar al escáner. |

El hook usa `status`, `granted` y `canAskAgain`. `status` solo no distingue una denegación temporal de una permanente. En iOS, el sistema normalmente no repite el diálogo tras una denegación; la app usa `canAskAgain` y ofrece Ajustes sin asumir un número universal de intentos.

Después de volver de Ajustes, el listener de `AppState` llama a `actualizar()`. Sin él, el estado puede quedar desactualizado mientras la pantalla permanece enfocada.

### D2. Notificaciones

Al activar el interruptor se crea el canal `prestamos`, se pide permiso y se programa una notificación a 15 segundos. El identificador se guarda en el objeto `Prestamo` del Context y AsyncStorage. Al desactivar o devolver se cancela ese identificador. Si la app se cierra, el SO conserva la notificación programada; el identificador se restaura desde AsyncStorage. Si el proceso termina antes de completar la escritura asíncrona, el identificador puede no quedar persistido aunque la notificación siga programada.

Android 13 requiere permiso antes de mostrar notificaciones; Android 12 no usa el modelo POST_NOTIFICATIONS de la misma forma. El canal puede existir antes o después, pero crearle antes sigue siendo una buena práctica.

Si se entrega un libro y la persona es Ana, el código consulta `getPermissionsAsync` en ese momento y envía una notificación inmediata si está concedido; si no, guarda un aviso que se muestra en reservas. Al activar el permiso desde el interruptor, se vuelve al préstamo y se programa el recordatorio.

### D3. Permisos

Android declara cámara y POST_NOTIFICATIONS. iOS declara `NSCameraUsageDescription` para cámara. El plugin desactiva el micrófono y `RECORD_AUDIO`. Las tiendas pueden exigir también otras declaraciones según la configuración final.

Una galería requeriría `expo-image-picker` y el permiso correspondiente, instalado con `npx expo install`. Si modifica configuración nativa o plugins, necesita nueva build; solo JavaScript puede ir por OTA.

Expo Go permite probar gran parte, pero no sustituye por completo texto de propósito nativo ni canales Android. Se verifica con development build en el teléfono.

## Parte E

### E1. Problemas del Catálogo mostrado

1. Línea 10: `any[]` elimina la seguridad de tipos.
2. Línea 13: pide cámara al abrir catálogo, aunque debe pedirla al escanear.
3. Línea 14: también pide notificaciones sin que se active el interruptor.
4. Líneas 18-20: falta limpieza y no tiene dependencias; genera pedidos y renders continuos.
5. No controla cargando/error/vacío.
6. Línea 22: `.then` sin captura deja fallos sin pantalla.
7. Línea 23: crea `Fila` dentro de la pantalla, recreando componentes.
8. Línea 24: key numérica por índice en lugar del ISBN.
9. Línea 26: estilos inline.
10. Sin FlatList ni key estable.
11. No usa accesibilidad ni tamaño táctil.

Sin array de dependencias, el efecto se ejecuta después de cada render. Cada resolución del API llama `setLibros`, provoca render y ejecuta otra petición, creando un ciclo. Si devuelve el mismo array, React puede detectar que es el mismo valor solo para referencias iguales; la app sigue rendirizándose por otros estados y no elimina el loop porque hay setState y efecto sin dependencias.

### E2. Organización

Direcciones principales:

`app -> components/hooks/context`

`components -> constants/types`

`hooks -> lib/types`

`context -> data/estructuras/lib/types`

`estructuras -> no importa app`

No debe haber hook que importe `src/app`, porque las rutas deben ser presentacionalmente dependientes de hooks y componentes, no al revés.

Cambiar a una API real afecta principalmente `src/lib/api.ts`, tipos y estados de carga/error. No requiere cambiar directamente todas las pantallas si su contrato se mantiene.

Un componente `<ConPermiso>` ganaría encapsulación y perdería control sobre presentación diferente para cámara y notificaciones. No conviene envolver el interruptor de notificaciones: pedir permiso es una acción explícita del usuario y el módulo no debe navegar automáticamente.

### E3. Mapa de fallas

| Situación | Qué ve la persona y dónde se maneja |
|---|---|
| `obtenerLibros()` falla | Mensaje y Reintentar: `src/hooks/useLibros.ts:18`, `src/app/(tabs)/(catalogo)/index.tsx:44` |
| Se abre `/libro/abc` | ISBN inválido y acción al Catálogo: `src/app/(tabs)/(catalogo)/libro/[isbn].tsx:25` |
| ISBN escaneado inexistente | Aviso, puede seguir escaneando o escribir otro: `src/app/escanear.tsx:25` |
| Cámara bloqueada | Abrir Ajustes y entrada manual: `src/app/permisos/[recurso].tsx:28`, `src/app/escanear.tsx:60` |
| Notificaciones denegadas | Aviso dentro de reservas; no se programa: `src/context/BibliotecaContext.tsx:235`, `src/app/(tabs)/reservas.tsx:25` |
| Reservar dos veces | Mensaje de préstamo duplicado: `src/context/BibliotecaContext.tsx:131` |
| Entregar con cola vacía | El mostrador muestra vacío y la Cola devuelve `undefined`: `src/app/mostrador.tsx:37`, `src/estructuras/Cola.ts:6` |
| Login incorrecto | Mensaje debajo de los campos: `src/app/login.tsx:15` |

### E4. Decisiones

Se usa el ISBN de 13 dígitos como identificador y key. Es estable y coincide con el escáner y las rutas; los ISBN de ejemplo mantienen el dígito verificador EAN-13. Si una edición no tuviera ISBN, se necesitaría otro ID estable.

Pila y Cola se mantienen como clases con campos privados y se convierten a arrays al comunicarse con React. Esto preserva el TP y evita mutar datos internos desde componentes.

`useMemo` evita recalcular el value del Context. `useCallback` estabiliza funciones usadas por efectos y callbacks. Sería ruido memorizar cálculos triviales o componentes que siempre reciben datos nuevos.

Ejemplares se calcula desde el estado único del Context, no se duplica en cada libro estático. Así reservar y devolver no producen cantidades inconsistentes.
