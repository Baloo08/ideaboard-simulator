# Recursos Oficiales y Ejemplos de IdeaScratch (CRCibernética)

Documento técnico de procedencia, verificación e integración de los recursos gráficos oficiales y ejemplos de **IdeaScratch `v4.37`** (`https://ideascratch.crcibernetica.com/`) dentro de **IdeaBoard Studio**.

- **Fuente oficial:** `https://ideascratch.crcibernetica.com/` (`APP_VERSION = v4.37`, `Last-Modified: Thu, 17 Sep 2026 20:17:46 GMT`, servidor `nginx/1.18.0 (Ubuntu)`)
- **Fecha de extracción verificada (UTC):** `2026-11-27T21:48:23Z`
- **Registro estructurado de procedencia:** [`public/assets/ideascratch/PROVENANCE.json`](../public/assets/ideascratch/PROVENANCE.json)
- **Catálogo tipado en TypeScript:** [`src/hardware/ideascratchAssets.ts`](../src/hardware/ideascratchAssets.ts)

---

## 1. Verificación previa de espacio en disco (`C:`)

Antes de descargar los recursos desde `ideascratch.crcibernetica.com`, se verificó el espacio disponible en la unidad `C:` mediante PowerShell (`Get-Volume -DriveLetter C` y `Get-PSDrive C`) a las **`2026-11-27T21:47:45Z`**:

| Métrica | Valor exacto | Equivalente |
|---|---:|---:|
| Capacidad total del volumen `C:` (`Get-Volume.Size`) | `254,803,963,904` B | `237.30 GiB` |
| Espacio usado (`Get-PSDrive.Used`) | `253,413,163,008` B | `236.01 GiB` |
| Espacio libre (`Get-Volume.SizeRemaining`) | `1,391,128,576` B | `1.30 GiB` |
| Espacio libre (`Get-PSDrive.Free`) | `1,390,800,896` B | `1.30 GiB` |
| **Total de archivos descargados** (5 imágenes + `manifest.json` + 30 `.iss`) | **`770,331` B** | **`752.28 KiB` (`0.73 MiB`)** |
| **Porcentaje del espacio libre consumido** | **`0.0554%`** | `< 0.12%` incluyendo copia en `dist/` |

---

## 2. Inventario de recursos gráficos oficiales

Todos los archivos fueron descargados directamente con HTTP `200`, validados en formato/cabecera (XML SVG 1.1, firma PNG `IHDR`, firma WebP `RIFF/VP8X`) y cotejados por SHA-256:

| ID | Recurso | Ruta local (`public/assets/ideascratch/...`) | URL original (`https://ideascratch.crcibernetica.com/...`) | Formato | Dimensiones / `viewBox` | Tamaño renderizado CSS (IdeaScratch) | Bytes | SHA-256 |
|---|---|---|---|---|---|---|---:|---|
| `ideaboard-svg` | IdeaBoard Oficial | `ideaboard.svg` | `ideaboard.svg` | SVG 1.1 (Inkscape 1.4.3) | `width="100%" height="100%"`, `viewBox="0 0 42.7 65.7"` (mm, ratio `0.6499`) | `256 × 393.89 px` | `381,808` | `52055e536006e5815f36f992f0ef116452bab145cc5702b8027e00915801d79b` |
| `explorer-svg` | IdeaSense Explorer Oficial | `explorer.svg` | `explorer.svg` | SVG 1.1 (Inkscape 1.4.3) | `82.224442 × 87.847351` (`viewBox="0 0 82.224442 87.847351"`, mm, ratio `0.9360`) | `256 × 273.51 px` | `261,152` | `5926aa9afdfdf62f748cd907670ec075a2c5ca3fc2d963d309c921d3393d55eb` |
| `favicon-png` | Favicon IdeaScratch | `favicon.png` | `favicon.png` | PNG | `32 × 32 px` | `32 × 32 px` (pestaña navegador) | `2,010` | `d15b4fe9c49d64ccecf77ddf078b8704cfcfa013c46aed20e14973cc1bb41171` |
| `crcibernetica-logo-webp` | Logo CRCibernética | `img/crcibernetica-logo.webp` | `img/crcibernetica-logo.webp` | WebP (`VP8X`) | `508 × 80 px` | Modal *Help → About* | `15,392` | `92c56ce2ec60e54c77976732336f0bca041c2bfa277467ccbbfb3d83b1b798ba` |
| `ucenfotec-logo-png` | Logo U. CENFOTEC | `img/ucenfotec-logo.png` | `img/ucenfotec-logo.png` | PNG | `250 × 105 px` | Modal *Help → About* | `5,489` | `fb6d78125b0d90d695ed6938ce66a736264347617beea322ddeeb3d273dce7d2` |
| **Subtotal** | **5 imágenes** | | | | | | **`665,851`** | |

### Auditoría de seguridad / CSP de los SVGs

Tanto `ideaboard.svg` como `explorer.svg` son archivos autónomos exportados desde Inkscape 1.4.3:
- **0** llamadas externas `http(s)://` (únicamente namespaces XML estándar).
- **0** etiquetas `<script>`, `<foreignObject>` ni atributos `on*`.
- **0** reglas CSS `url(...)` externas; ambos incluyen únicamente un `<style>` interno con clases `.B`–`.T`.
- Ambos incrustan dos pequeños PNG base64 internos (`image1626` `33×58 px` y `image1633` `34×58 px`), y `explorer.svg` incluye dos perfiles `<color-profile>` ICC (`3,180` B c/u).
- `ideaboard.svg` puede servirse de forma segura con `<img src="...">` (o `<svg>`), mientras que `explorer.svg` requiere `<object data="..." type="image/svg+xml">` (mismo origen) o SVG inline cuando se manipulen vía DOM las 25 rutas de su matriz LED.

---

## 3. Arquitectura interna de SVGs y especificaciones de overlays

### 3.1 `ideaboard.svg` — 29 overlays interactivos y visuales

En IdeaScratch (`css/styles.css` e `index.html`), `ideaboard.svg` se renderiza como `<img class="board-img">` (`width: 256px; height: auto` → `256 × 393.89 px` en escritorio) dentro de `.board-container` (`position: relative`). **Todos los 29 overlays usan `transform: translate(-50%, -50%)`**, por lo que `top` y `left` representan el **centro** del elemento:

1. **Overlays especiales (4 elementos):**
   - `#sim-pixel` (NeoPixel `IO02`): `top: 52.5%`, `left: 49.7%`, `22 × 22 px`, `z-index: 10`, circular (`border-radius: 50%`), resplandor `rgb(r, g, b)`.
   - `#sim-boot-hitbox` (Botón `BOOT` / `IO0`): `top: 16.7%`, `left: 93.1%`, `20 × 32 px`, `z-index: 20`, interactivo (`pressed`/`released`).
   - `#sim-motor1-overlay` (Puente H Motor 1 `IO12`/`IO14`): `top: 38.12%`, `left: 90.96%`, `5.81% × 7.34%`, `z-index: 10` (verde si `throttle > 0`, rojo si `throttle < 0`, gris si `0`).
   - `#sim-motor2-overlay` (Puente H Motor 2 `IO13`/`IO15`): `top: 38.12%`, `left: 9.81%`, `5.81% × 7.34%`, `z-index: 10`.
2. **Overlays Servo (5 elementos, header izquierdo, `17.03% × 3.50%`, `z-index: 10`, violeta `rgba(139, 92, 246, 0.65)`):**
   - `#sim-servo-io4` (`63.48%`, `11.69%`), `#sim-servo-io5` (`66.98%`), `#sim-servo-io18` (`70.49%`), `#sim-servo-io19` (`74.01%`), `#sim-servo-io23` (`77.52%`).
3. **Overlays Analógicos (6 elementos, header derecho, `17.03% × 3.50%`, `z-index: 10`, ámbar `rgba(245, 158, 11, 0.65)`):**
   - `#sim-analog-io33` (`67.17%`, `89.15%`), `#sim-analog-io32` (`70.67%`), `#sim-analog-io35` (`74.17%`), `#sim-analog-io34` (`77.67%`), `#sim-analog-io39` (`81.18%`), `#sim-analog-io36` (`84.68%`).
4. **Overlays Digitales (14 elementos: 7 izquierdos + 7 derechos, `17.03% × 3.50%`, `z-index: 11`, teal `rgba(13, 148, 136, 0.35 / 0.7)`):**
   - Izquierda (`left: 11.69%`): `io4` (`63.48%`), `io5` (`66.98%`), `io18` (`70.49%`), `io19` (`74.01%`), `io23` (`77.52%`), `io25` (`81.02%`), `io26` (`84.55%`).
   - Derecha: `io27` (`63.61%`, `left: 88.78%`), `io33` (`67.17%`, `left: 89.15%`), `io32` (`70.67%`), `io35` (`74.17%`), `io34` (`77.67%`), `io39` (`81.18%`), `io36` (`84.68%`).

#### Comparativa geométrica: `ideaboard.svg` vs `src/hardware/ideaboardSpec.ts`

- `ideaboard.svg` (`viewBox 0 0 42.7 65.7`, relación `0.6499`) equivale a `260 × 400.05 px` proporcionalmente, mientras el esquema actual `IdeaBoardSvg.tsx` + `ideaboardSpec.ts` mide `260 × 430 px` (relación `0.6047`, un **7.49%** más alto) y define **56 pines conectables** (`2` Vin + `4` Motor + `4` I2C + `4` UART + `21` header izquierdo + `21` header derecho, más el jumper `SELECT`).
- En `ideaboard.svg`, los headers laterales `3×7` se ubican en `x = 6.10%, 11.34%, 16.57%` (izq.) y `83.55%, 88.79%, 94.02%` (der.) con `y = 63.61%..84.58%`. En `ideaboardSpec.ts`, están ~4% más hacia el centro y ~3.3–4.8% más abajo (`y = 68.37%..87.91%`). Por ello, `IDEABOARD_SVG_METRICS` en `src/hardware/ideascratchAssets.ts` preserva ambos juegos de métricas sin romper el cableado existente.

### 3.2 `explorer.svg` (IdeaSense Explorer) — Matriz LED 5×5 y botones A/B/C

Renderizado a `256 × 273.51 px` (`viewBox="0 0 82.224442 87.847351"`, capa `#layer1` con `transform="translate(-2.762446,-3.6862589)"`):

- **Matriz LED 5×5 (25 elementos `<path>`):** IDs pares consecutivos **`path34` hasta `path82`** (`path{34 + 2 * (y * 5 + x)}`, con `x ∈ 0..4` de izquierda a derecha, `y ∈ 0..4` de arriba hacia abajo):
  - Tamaño físico en `viewBox`: `1.660008 × 1.579039` mm cada LED.
  - Columnas `x` (centros `%`): `32.32%` (`col 0`), `41.35%` (`col 1`), `50.46%` (`col 2`), `59.28%` (`col 3`), `68.46%` (`col 4`).
  - Filas `y` (centros `%`): `47.30%` (`row 0`, `path34..42`), `55.76%` (`row 1`, `path44..52`), `64.22%` (`row 2`, `path54..62`), `72.12%` (`row 3`, `path64..72`), `80.16%` (`row 4`, `path74..82`).
  - Estilo activo: `fill: #4488ff; fill-opacity: 1; stroke: #4488ff; stroke-width: 3.32; stroke-linejoin: round`.
  - Estilo inactivo: `fill: #b3b3b3; fill-opacity: 1; stroke: none`.
- **Botones físicos A / B / C (3 hitboxes con anclaje esquina superior izquierda, sin `translate`):**
  - `#sim-explorer-btn-a` (índice `0`, Button A): `top: 86.80%`, `left: 26.42%`, `11.65% × 7.52%`, `z-index: 20`.
  - `#sim-explorer-btn-b` (índice `1`, Button B): `top: 86.80%`, `left: 44.34%`, `11.65% × 7.52%`, `z-index: 20`.
  - `#sim-explorer-btn-c` (índice `2`, Button C): `top: 86.80%`, `left: 61.07%`, `11.65% × 7.52%`, `z-index: 20`.

---

## 4. Proyecto inicial por defecto (`_defaultBlocks`) y esquema `.iss` v2

### 4.1 Proyecto inicial de IdeaScratch (`_defaultBlocks`)

Cuando no existe `localStorage['ideascratch_autosave']` o el usuario crea un proyecto nuevo (`js/workspace.js:441-443`, `js/storage.js:6`), IdeaScratch carga este XML mínimo de Blockly:

```xml
<xml xmlns="https://developers.google.com/blockly/xml">
    <block type="controls_forever" x="20" y="20"></block>
</xml>
```

Código CircuitPython generado automáticamente (`js/workspace.js:356-359`):

```python
import board
from ideaboard import IdeaBoard
from time import sleep

ib = IdeaBoard()

while True:
  sleep(0.01)
```

### 4.2 Esquema JSON `.iss` versión 2

Todos los 30 archivos oficiales en `public/assets/ideascratch/examples/*.iss` cumplen el formato `iss-json-v2`:

```ts
export interface IdeaScratchProjectV2 {
  version: 2;
  blocks: string;      // XML de Blockly (<xml xmlns="https://developers.google.com/blockly/xml">...</xml>)
  dashboard?: string;  // Opcional (omitido en los 5 .iss de SumoBot v2); "" si vacío; o JSON serializado
}
```

- En **23 ejemplos** (18 con `dashboard: ""` y 5 de `SumoBot v2` con la clave omitida), no hay panel IoT/Dashboard configurado.
- En **7 ejemplos** (`sumoBatalla01`, `sumoBatalla02`, `mqtt_receive`, `mqtt_send`, `serial_graph`, `serial_receive`, `joystick`), `dashboard` contiene un JSON serializado con `{ widgets: DashboardWidget[], mqtt: { url, user, pass } }` sobre una grilla de 24 columnas (`broker.hivemq.com:8884/mqtt` por defecto) usando los tipos `line-graph`, `button`, `slider`, `toggle`, `text-input` y `joystick`.

---

## 5. Catálogo completo de los 30 ejemplos oficiales (`examples/manifest.json`)

- **Archivo índice:** `public/assets/ideascratch/examples/manifest.json` (`https://ideascratch.crcibernetica.com/examples/manifest.json`, `2,715` B, SHA-256 `638b26a922943227865534b95b64553d0ea4b81e567eda24c1533066e78c7e00`).
- **Total de archivos `.iss`:** `30` archivos en `6` secciones (`101,765` B / `99.38 KiB`).

### Basics (10 ejemplos)

| Clave | Etiqueta | Archivo | Bytes | SHA-256 | Bloques / Sombras / Vars | Descripción |
|---|---|---|---:|---|---|---|
| `blink` | Blink | `blink.iss` | 1,006 | `45de7fa8f7a4ed63495da47ed0f2252909059fc2b1e132cfddd2107aaca079a3` | 7 / 0 / 0 | Parpadeo del NeoPixel integrado (`ib.pixel`). |
| `digitalIn` | Digital In | `digitalIn.iss` | 1,059 | `0f2e64f7ae390dbccd81a3f9a2090c3c13d9036a269a4580b4138b21764e8554` | 6 / 0 / 1 | Lectura de entrada digital con pull-up (`ib.DigitalIn`). |
| `digitalOut` | Digital Out | `digitalOut.iss` | 1,531 | `6e049c39eb2b0944472d02880556450758a0514d93e98f4db245b098eee58f35` | 8 / 0 / 1 | Control de salida digital (`ib.DigitalOut`). |
| `analogIn` | Analog In | `analogIn.iss` | 1,020 | `a7a42f2b3407865630d224ecbaeb787eea273c86eae0525b9f1f71f01b104577` | 6 / 0 / 1 | Lectura analógica (`ib.AnalogIn`, rango 0–65535). |
| `pixel` | Pixel | `pixel.iss` | 1,553 | `ba820f512b313065ac78bbe2a38d47571d87b48f19adc157537d2e0d764a440e` | 10 / 0 / 0 | Colores RGB en el NeoPixel integrado. |
| `rainbow` | Rainbow | `rainbow.iss` | 1,348 | `19cdaac92b6691bc3d88885a8b41be3530937819dff245bd36490aa5f599173a` | 9 / 0 / 1 | Ciclo de color HSV con `ib.arcoiris`. |
| `motors` | Motors | `motors.iss` | 3,276 | `7126057008135bfaef8bf2aa0896bec3b3e60eb2f78d7f7abdfdb00ed9823123` | 21 / 0 / 0 | Control de `ib.motor_1` y `ib.motor_2`. |
| `servo` | Servo | `servo.iss` | 1,717 | `8186cb3783c7f51f7c733552d2d2a4248b11c9eacf0dc7ea18d14c46c70351fc` | 10 / 0 / 1 | Barrido angular de servomotor con `ib.Servo` (`IO4`). |
| `dataLogging` | Data Logging | `dataLogging.iss` | 1,798 | `28205071393d2fa751caa9b0560978fcca334db1a858db0e73b144fbead90cbf` | 9 / 2 / 1 | Registro de datos en archivo `data.csv`. |
| `bootButton` | Boot Button | `bootButton.iss` | 1,685 | `05a85762cceaa8d90b5f19b2836c8be6c3f6f1cace7da4dd92b5002b7f0fe418` | 9 / 2 / 0 | Lectura de eventos del botón BOOT (`keypad` en `IO0`). |

### Sumobot (6 ejemplos)

| Clave | Etiqueta | Archivo | Bytes | SHA-256 | Bloques / Sombras / Vars | Dashboard |
|---|---|---|---:|---|---|---|
| `accelGyro` | Accel/Gyro | `accelGyro.iss` | 3,483 | `a0d60405b3dc03fd93a58716faad52f9cb6345431aa6ff84f7d49a895160cde4` | 16 / 0 / 1 | No |
| `pidMotion` | PID Motion | `pidMotion.iss` | 2,065 | `8088c9ec18186fe3a674e62678bbaa11197c8865101f1ca5149494ae5e6972d8` | 7 / 4 / 2 | No |
| `infrared` | Infrared | `infrared.iss` | 2,092 | `87703f67f5074c6d51e5d5a976f7c03e9822b319094c1d35b30f48bec8a27670` | 12 / 0 / 0 | No |
| `ultrasonic` | Ultrasonic | `ultrasonic.iss` | 1,075 | `97839f2b6661d89fcbbd73e97df8a323516961b4b18bc880d701a49496b2a93d` | 6 / 0 / 1 | No |
| `sumoBatalla01` | Sumo Batalla 01 | `sumoBatalla01.iss` | 12,672 | `77a2fcc71a966c9256a157ef3fb8f780e31b343e855e16e88c91698f7f682322` | 74 / 14 / 6 | Sí (`line-graph` + MQTT) |
| `sumoBatalla02` | Sumo Batalla 02 | `sumoBatalla02.iss` | 13,777 | `1a05abcc707e11fa561b505763a6b2449fa43b97e88c0d9eec661a519468e464` | 81 / 16 / 4 | Sí (`button`, `slider`, `toggle` + MQTT) |

### SumoBot v2 (5 ejemplos — clave `dashboard` omitida)

| Clave | Etiqueta | Archivo | Bytes | SHA-256 | Bloques / Sombras / Vars |
|---|---|---|---:|---|---|
| `sumov2Color` | Read Color | `sumov2Color.iss` | 4,956 | `708f81dfe758e5fd7d60b07504b9ee0368b8cefc30ae1ed2fd1b47bbfc92ce4f` | 20 / 0 / 2 |
| `sumov2Infrared` | Infrared | `sumov2Infrared.iss` | 1,005 | `9f68978eab3c9a35c735a2f8b71de95027cb891dc504e9153f76e5cecdc65e67` | 6 / 0 / 1 |
| `sumov2AccelGyro` | Accel/Gyro | `sumov2AccelGyro.iss` | 4,204 | `4ffed926df52859b1244bba6685296bcc8f9d9c5654d9f2cfaf47f65eef9d99f` | 20 / 0 / 1 |
| `sumov2Detector` | Light Detector | `sumov2Detector.iss` | 997 | `c0bdbb4db27c7abb26e65e956a8e45ea554f47475a1154b047f7c30930f85b91` | 6 / 0 / 1 |
| `sumov2Led` | LED | `sumov2Led.iss` | 4,013 | `333f1adb28474cb684fb9ccb8e09aa0fd6be960561c0c4fde3ed3821ad3705f0` | 20 / 0 / 1 |

### IdeaSense Explorer (4 ejemplos)

| Clave | Etiqueta | Archivo | Bytes | SHA-256 | Bloques / Sombras / Vars |
|---|---|---|---:|---|---|
| `accelPointer` | Accel Pointer | `accelPointer.iss` | 6,823 | `ff3d73c24e5b43b74fec5f62dfb00c4acc963d577eb7a33270adb05c9613e905` | 35 / 0 / 3 |
| `textDemo` | Text Demo | `textDemo.iss` | 3,646 | `f8f2e536a6726ae83b1794440a4439ad27a74efb8b76eb0e6f1b9a854b2e5e64` | 14 / 7 / 0 |
| `weather` | Weather | `weather.iss` | 4,593 | `8622d65fcb67b026cb3238b3edf05869e7ddd68af0fff122a16ad73091ae1ba5` | 22 / 2 / 0 |
| `simple` | Simple | `simple.iss` | 5,486 | `dbebbe8b1c1a0a4b110330a427d92b26f65cffead35ac1aa8bd93d90c59048f0` | 25 / 5 / 0 |

### IoT (2 ejemplos) y Dashboard (3 ejemplos)

| Sección | Clave | Etiqueta | Archivo | Bytes | SHA-256 | Bloques / Sombras / Vars | Widgets + MQTT |
|---|---|---|---|---:|---|---|---|
| `IoT` | `mqtt_receive` | MQTT Receive | `mqtt_receive.iss` | 2,589 | `a5b4144aa0df7c49154a35f9b59dc3d7126f9246bd8733804cd83d6b337325cb` | 10 / 1 / 1 | `text-input` + MQTT |
| `IoT` | `mqtt_send` | MQTT Send | `mqtt_send.iss` | 2,173 | `74829ba16f59465a93297c6b5f6ef81ae1c19f2abb2cfa317a0827e282124ad6` | 5 / 5 / 1 | `line-graph` + MQTT |
| `Dashboard` | `serial_graph` | Serial Graph | `serial_graph.iss` | 1,325 | `6f7bcfafe6a61065a2f811b49627b9cad92e9cb45d4edcf04148370bef2bb3fe` | 4 / 4 / 0 | `line-graph` + MQTT |
| `Dashboard` | `serial_receive` | Serial Receive from Dashboard | `serial_receive.iss` | 1,794 | `17913db062e182377aac6733c5fcf643f57fb998c8c44fd805a72cd468ddb1c5` | 8 / 0 / 0 | `button`, `slider`, `toggle` + MQTT |
| `Dashboard` | `joystick` | Joystick | `joystick.iss` | 7,004 | `2678d62279e569a3eb9ed774597a2bda07326efb470e72f905f458bbd308539b` | 39 / 20 / 0 | `joystick` + MQTT |

---

## 6. Compatibilidad con CircuitPython e IdeaBoard Studio

Al comparar el código CircuitPython generado por IdeaScratch frente a [`public/pyodide-worker.js`](../public/pyodide-worker.js) y [`src/hardware/starterTemplates.ts`](../src/hardware/starterTemplates.ts):

- **Paridad inmediata (100% compatible hoy):** `ib.pixel`, `ib.brightness`, `ib.arcoiris`, `ib.motor_1.throttle`, `ib.motor_2.throttle`, `ib.AnalogIn(board.IO33..IO36)` y `ib.DigitalIn` / `ib.DigitalOut` para pines de dos dígitos (`IO18`–`IO39`).
- **5 brechas de compatibilidad documentadas para las fases de implementación:**
  1. **`board.IO4` / `board.IO5` vs `board.IO04` / `board.IO05`:** IdeaScratch emite `board.IO4` y `board.IO5` (por ejemplo en `servo.iss`), mientras `public/pyodide-worker.js` y `src/hardware/ideaboardSpec.ts` definen únicamente `IO04` e `IO05` con cero inicial. Requiere alias en el worker (`board.IO4 = board.IO04`, `board.IO5 = board.IO05`).
  2. **`ib.map_range(...)` vs `ib.mapa(...)`:** IdeaScratch genera `ib.map_range(val, inMin, inMax, outMin, outMax)`, mientras IdeaBoard Studio implementa actualmente solo `IdeaBoard.mapa(...)` (`public/pyodide-worker.js:584`).
  3. **Módulo `keypad` en `board.IO0` (`bootButton.iss`):** IdeaScratch importa `keypad.Keys((board.IO0,), value_when_pressed=False, pull=True)`, inexistente aún en `public/pyodide-worker.js` e `IdeaBoardSvg.tsx`.
  4. **Módulo `ideasense.IdeaSense` (`simple.iss`, `accelPointer.iss`, `textDemo.iss`, `weather.iss`):** Requiere el módulo virtual `ideasense` en Pyodide y la vista interactiva de `explorer.svg` (matriz LED 5×5 `path34`–`path82`, botones A/B/C y sensores ambientales/IMU).
  5. **SumoBot / SumoBot v2 / MQTT / Dashboard (`hcsr04.HCSR04.dist_cm()`, `adafruit_lsm6ds`, `sumobotv2`, `adafruit_minimqtt`):** En IdeaBoard Studio el sensor ultrasónico actual usa `ib.Sonar(trig, echo)` (`adafruit_hcsr04.HCSR04.distance`) y los módulos de robot SumoBot, IMU y MQTT/Dashboard forman parte de extensiones posteriores.

---

## 7. Contrato de integración con Vite (`base: './'`) y `BASE_URL`

[`vite.config.ts`](../vite.config.ts) configura `base: './'` para que la aplicación funcione tanto en servidor local (`http://localhost:5173/`) como en GitHub Pages (`https://baloo08.github.io/ideaboard-simulator/`):

- **En TypeScript (`src/hardware/ideascratchAssets.ts`):** Todas las rutas públicas se construyen mediante:
  ```ts
  const ASSETS_BASE = `${import.meta.env.BASE_URL}assets/ideascratch/`;
  ```
  siguiendo exactamente el mismo patrón que `public/pyodide-worker.js` en `src/sim/useSimulation.ts`.
- **En HTML (`index.html`):** El favicon oficial utiliza ruta relativa `./assets/ideascratch/favicon.png` (sin barra inicial `/`), de modo que `dist/index.html` resuelva correctamente bajo cualquier subruta de GitHub Pages.
- **Salida de compilación (`npm run build`):** Vite copia íntegramente `public/assets/ideascratch/` a `dist/assets/ideascratch/` (`37` archivos: 5 imágenes, `PROVENANCE.json`, `examples/manifest.json` y 30 archivos `.iss`) sin engrosar el bundle JS principal.
