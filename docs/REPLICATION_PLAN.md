# Plan Técnico de Replicación: Tinkercad Circuits + IdeaBoard & IdeaSense en IdeaBoard Studio

Este plan técnico detalla cómo replicar la experiencia funcional, visual e interactiva de **Autodesk Tinkercad Circuits** junto con los recursos oficiales de **IdeaScratch `v4.37`** (**CRCibernética IdeaBoard** e **IdeaSense Explorer**) dentro del stack actual de **IdeaBoard Studio** para uso real en producción y entornos educativos.

- **Investigación base de 5 áreas y hardware:** [`docs/TINKERCAD_CIRCUITS_RESEARCH.md`](./TINKERCAD_CIRCUITS_RESEARCH.md)
- **Inventario de recursos extraídos y ejemplos `.iss`:** [`docs/IDEASCRATCH_ASSETS_AND_EXAMPLES.md`](./IDEASCRATCH_ASSETS_AND_EXAMPLES.md)
- **Registro estructurado de procedencia:** [`public/assets/ideascratch/PROVENANCE.json`](../public/assets/ideascratch/PROVENANCE.json)

> **Convención de etiquetado de archivos:**
> - `[EXISTING]` indica un archivo verificado actualmente en disco dentro del repositorio.
> - `[PLANNED - Phase N]` indica un archivo nuevo por crear en la **Fase `N` (`1`–`6`)** de la Secc. 5.

---

## 1. Alcance y Stack Actual

### 1.1 Stack de producción verificado (`[EXISTING]`)

De acuerdo con [`package.json`](../package.json), [`tsconfig.json`](../tsconfig.json) y [`vite.config.ts`](../vite.config.ts):

- **Interfaz y tipado:** `react@^18.3.1`, `react-dom@^18.3.1`, `typescript@^5.6.3` (`strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`), `lucide-react@^0.460.0`.
- **Empaquetado y estilos:** `vite@^6.0.1` con **`base: './'`**, `tailwindcss@^4.0.0` (`@tailwindcss/vite@^4.0.0`).
- **Editor y runtime Python:** `@monaco-editor/react@^4.6.0` + **Pyodide `v0.26.4`** ejecutándose en un Web Worker dedicado ([`public/pyodide-worker.js`](../public/pyodide-worker.js), cargado desde `cdn.jsdelivr.net`).
- **Despliegue en producción:** [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) compila con `npm run build` (`tsc --noEmit && vite build`) en Node `20` y publica `./dist` en GitHub Pages (`https://baloo08.github.io/ideaboard-simulator/`).

### 1.2 Verificación de espacio en disco (`C:`), presupuesto de bundle y contrato `base: './'`

Las mediciones registradas en [`PROVENANCE.json`](../public/assets/ideascratch/PROVENANCE.json) (`2026-11-27T21:47:45Z`) y durante la auditoría de compilación (`2026-11-27T21:58:09Z`) muestran un margen acotado en la unidad `C:`:

| Recurso / Métrica | Tamaño medido | Impacto en disco `C:` (`~1.24–1.30 GiB` libres) | Contrato Vite `base: './'` / GitHub Pages |
|---|---:|---|---|
| **Capacidad libre verificada en `C:`** | `1,333,342,208` B – `1,391,128,576` B (`1.24`–`1.30 GiB`) de `237.30 GiB` | ~`0.52%` libre; exige disciplina en dependencias pesadas | Evitar instalar binarios pesados en `C:` (ej. Chromium de Playwright `~400+ MB`) sin limpieza previa |
| **`public/assets/ideascratch/` (`37` archivos)** | `830,927` B (`811.45 KiB`) | `< 0.13%` incluyendo copia en `dist/` | Copiado por Vite a `dist/assets/ideascratch/`; siempre referenciar vía `${import.meta.env.BASE_URL}assets/ideascratch/...` (como en `src/hardware/ideascratchAssets.ts:104`) |
| **Bundle actual `dist/` (`41` archivos)** | `1,113,650` B (`1.06 MiB` total: JS `233,918` B + CSS `26,286` B + worker `22,000` B + assets) | Despreciable (`< 0.1%`) | Cero rutas absolutas `/assets/`; `index.html:7` usa `./assets/ideascratch/favicon.png` |
| **Código TS/SVG Fases 1–5 (proyectado)** | `~120–180 KB` fuente (`~45–70 KB` minificado) | `< 0.01%` | SVG inline/vectorial sin bloat raster |
| **Blockly Fase 6 — Opción A (`npm install blockly@^12.4.1` + `React.lazy()`)** | `node_modules`: `~15–25 MB`; chunk lazy: `~1.1–1.4 MB` (`~320 KB` gzip) | `~1.1–1.9%` del espacio libre (`C:` sigue `> 1.20 GiB`) | Determinista y offline; solo se descarga al abrir modos `Blocks` / `Blocks + Text` |
| **Blockly Fase 6 — Opción B (CDN `cdn.jsdelivr.net`)** | `node_modules`: `0` B; wrapper: `~5 KB` | **`0` B en `C:`** | Mismo patrón CDN que Pyodide `v0.26.4` y Monaco; requiere red al abrir modo Bloques |

**Regla contractual de rutas:** Toda referencia en TypeScript hacia `public/` DEBE usar `${import.meta.env.BASE_URL}` (como ya hace `src/sim/useSimulation.ts:57` y `src/hardware/ideascratchAssets.ts:104`), prohibiendo rutas raíz `/assets/...` para preservar compatibilidad idéntica en `localhost` y en la subruta `/ideaboard-simulator/` de GitHub Pages.

---

## 2. Mapeo Exacto al Estado Actual del Repositorio (`[EXISTING]` vs `[PLANNED - Phase N]`)

### 2.1 Inventario completo de archivos existentes (`[EXISTING]`)

El repositorio actual contiene **17 archivos fuente en `src/`**, **`public/pyodide-worker.js`**, **37 archivos extraídos en `public/assets/ideascratch/`**, documentación en `docs/` y configuración raíz:

| Ruta (`[EXISTING]`) | Líneas | Símbolos / Responsabilidad verificada | Evolución planificada (`Phase 1–6`) |
|---|---:|---|---|
| `src/App.tsx` | 307 | `App` (L27), estado `selectedTemplateId`..`muted` (L29–35), handlers `handleLoadTemplate`..`handleDownloadCode` (L66–145), `isRunningOrLoading` (L147), cabecera `h-13` (L152–254), layout 3 paneles (L257–301). | **Fase 1:** integrar `historyReducer` y portapapeles; **Fase 4:** delegar barra en `TopToolbar`, cajón derecho colapsable (`ComponentDrawer`), `PropertyInspector` y vistas; **Fase 5:** `EDIT`/`SIMULATING` edit-lock y reloj `HH:MM:SS`. |
| `src/main.tsx` | 10 | Punto de entrada React (`createRoot` + `<App />`). | Sin cambios estructurales previstos. |
| `src/index.css` | 35 | Fondo oscuro `#0b1120` (L9), `.workbench-grid` estática `20px` (L15–19), scrollbars oscuros (L21–34). | **Fase 1:** retirar grilla CSS fija en favor de patrón SVG mundial `14 px`; **Fase 4:** tokens claros estilo Tinkercad (`#f3f4f6` / `#f4f6f8`, barras `#ffffff`). |
| `src/vite-env.d.ts` | 1 | `/// <reference types="vite/client" />`. | Sin cambios necesarios. |
| `src/types/simulator.ts` | 106 | `PinKind` (L1), `BoardPinDef` (L3–14), `ComponentType` (L16–23, 7 tipos), `PlacedComponent` (L44–52, sin `rotation`), `Wire` (L54–59, sin `waypoints`/`wireType`), `PowerSelectMode` (L61), `BoardRuntimeState` (L72–80), `ComponentDiagnostic` (L82–86), `SimulationStatus` (L95), `StarterTemplate` (L97–105). | **Fase 1:** `rotation?: number`, `CircuitSnapshot`; **Fase 2:** ampliar `ComponentType`, `BoardVisualMode`, `BreadboardHoleRef`, `aliases` en `BoardPinDef`; **Fase 3:** `points`/`waypoints` y `wireType` en `Wire`; **Fase 5:** `fault`/`blown`, `currentMa`, `faultCode` y estado `explorerMatrix` / `bootPressed`. |
| `src/hardware/ideaboardSpec.ts` | 133 | `BOARD_WIDTH = 260`, `BOARD_HEIGHT = 430` (L3–4), `IDEABOARD_PINS` (**56 pines conectables**, L35–117), `BOARD_PIN_MAP` (L119–121), `INPUT_ONLY_PINS`, `POWER_*`, `GND_PINS` (L123–132). Paso de cabezales: **`14 px`**. | **Fase 2:** añadir alias `IO4`/`IO5`, pin `IO0` (`BOOT`), `GRID_PITCH_PX = 14`, y mapa de coordenadas proporcionales para `ideaboard.svg` (`260 × 400.05`). |
| `src/hardware/componentSpecs.ts` | 103 | `COMPONENT_SPECS` (L3–92, 7 componentes) y `WIRE_COLORS` (L94–102, 7 colores). | **Fase 2:** añadir `ideasense-explorer`, `breadboard-*`, `resistor`, `rgb-led`, `slide-switch`, `photoresistor`, `tmp36`, `multimeter`, `power-supply` y categoría `basic`/`all`; **Fase 3:** ampliar `WIRE_COLORS` a **12 colores** con atajo `1–9, 0`. |
| `src/hardware/starterTemplates.ts` | 375 | `STARTER_TEMPLATES` (4 plantillas iniciales usando `PlacedComponent` y `Wire`). | **Fase 3:** retrocompatibilidad garantizada (`points ?? []`, `wireType ?? 'normal'`); **Fase 4:** expuestas bajo filtro `Starters` en `ComponentDrawer`. |
| `src/hardware/ideascratchAssets.ts` | 815 | `ASSETS_BASE` con `BASE_URL` (L104), `IDEASCRATCH_ASSETS` (L124–207), `IDEABOARD_SVG_METRICS` (L209–665: 29 overlays + 9 grupos de pines), `EXPLORER_SVG_METRICS` (L694–749: 25 LEDs `path34`–`path82` + 3 botones A/B/C), `IDEASCRATCH_DEFAULT_BLOCKS_XML` (L110–111), `IDEASCRATCH_OFFICIAL_EXAMPLES` (L783–814: 30 `.iss`). | **Fase 2:** consumido por `IdeaBoardRealisticSvg` e `IdeaSenseExplorerSvg`; **Fase 6:** consumido por `issImporter` y cargador de ejemplos `.iss`. |
| `src/components/CircuitCanvas.tsx` | 473 | `BOARD_ORIGIN` (L17), `screenToWorld` (L72–82), `getPinWorldPos` (L84–99), `buildBezierPath` (L101–108), atajos `Escape/Delete/Backspace` (L111–133), `handleEndpointClick` (L135–147), barra flotante 7 colores (L207–263), pill inferior (L266–287), zoom (L290–324), SVG cables `3000×3000` (L392–468). | **Fase 1:** zoom al cursor, `F`, `+`/`-`, Pan vs Marquee, `Shift+Click`, rejilla `14 px` + snap + guías + flechas, rotación `30°`, 5 capas `L0`–`L4`; **Fase 2:** hover rojo + anillos verdes protoboard; **Fase 3:** delegar cables a `WireLayer` + `useWireTool`; **Fase 5:** `locked={isSimulating}`. |
| `src/components/IdeaBoardSvg.tsx` | 429 | `IdeaBoardSvg` (L16–428), PCB esquemático `260×430` (L42–46), `BOOT` decorativo (L160–164), `RESET` clicable (L166–177), jumper `SELECT` (L250–271), `Qwiic` decorativo (L273–289), NeoPixel `IO02` (L291–303), 56 pads (L387–425). | **Fase 2:** modo dual `Schematic` vs `Realistic` (delegando en `IdeaBoardRealisticSvg`), conector Qwiic interactivo; **Fase 5:** hacer interactivo el botón `BOOT` (`IO0`) y respetar `locked` en `SELECT`. |
| `src/components/ExternalComponentSvg.tsx` | 400 | `ExternalComponentSvg` (L20–399), cuerpos SVG e inputs para 7 componentes (L109–303), pines circulares `r=4.2` (L306–349), 4 puntos de color LED cuando `selected` (L381–396). | **Fase 1:** aplicar `transform: rotate(${rotation}deg)`; **Fase 2:** añadir renderers faltantes o modularizar en `src/components/parts/`; **Fase 5:** potenciómetro rotatorio arrastrable, cono + punto verde HC-SR04, badge rojo `!` y overlay quemado. |
| `src/components/ComponentPalette.tsx` | 76 | `ICONS` (L19–27), barra izquierda fija `w-56` oscura con 7 botones (L29–75). | **Fase 4:** reemplazada/refactorizada en `ComponentDrawer` colapsable a la derecha (`Basic`/`All`/`Starters` + búsqueda + tarjetas 2 columnas); **Fase 5:** bloqueo en `SIMULATING`. |
| `src/components/CodeAndConsolePanel.tsx` | 199 | `INSPECTED_PINS` (L14–32), `<Editor defaultLanguage="python" theme="vs-dark">` (L63–77), panel inferior `h-56` con pestañas `Consola Serial` y `Estado de Pines` (L81–195). | **Fase 4:** convertir en cajón lateral derecho colapsable (`Code`); **Fase 5:** `readOnly={isSimulating}`, barra `Serial TX + Send`, botón `Serial Plotter`; **Fase 6:** selector `Blocks` / `Blocks + Text` / `Text`, `Libraries`, `Debugger`. |
| `src/sim/useSimulation.ts` | 159 | `useSimulation(powerSelect)` cargando `${import.meta.env.BASE_URL}pyodide-worker.js` (L57). | **Fase 5:** reloj `simTimeSeconds` (`HH:MM:SS`), `sendSerialInput`, estado `bootPressed` y puente `explorer` (entradas + matriz 5×5). |
| `src/sim/netlist.ts` | 402 | `NetlistResult` (L15–29), `evaluateCircuit` (L33–402) con Union-Find sobre `BOARD_PIN_MAP` + `wires`. | **Fase 2:** propagación de tiras `a–e`/`f–j` y rieles de protoboard (`pinToBusHoles`); **Fase 5:** interruptor deslizante, bus I2C `IO21`/`IO22`, integración con `electricalSolver` para fallas y multímetro. |
| `src/sim/buzzerAudio.ts` | 70 | Web Audio API para buzzer piezoeléctrico. | Se mantiene intacto en Fase 5 (respetando `muted` y bloqueo de estado). |
| `public/pyodide-worker.js` | 792 | Carga Pyodide `v0.26.4`; define `board` (`_PIN_NAMES` L147–160), `digitalio`, `analogio`, `pwmio`, `neopixel`, `adafruit_motor`, `adafruit_hcsr04`, `ideaboard` (`IdeaBoard`, `mapa` L584–587) y transformador AST async (L594–792). | **Fase 5:** añadir `board.IO4`/`IO5`/`IO0`, `IdeaBoard.map_range`, `keypad.Keys`, `ideasense.IdeaSense`, `hcsr04.HCSR04.dist_cm()`, `_StdinCatcher` + `supervisor.runtime.serial_bytes_available`. |
| `public/assets/ideascratch/*` | 37 archivos | `ideaboard.svg`, `explorer.svg`, `favicon.png`, 2 logos en `img/`, `PROVENANCE.json`, `examples/manifest.json`, 30 `.iss`. | Consumido en Fases 2, 4 y 6 vía `src/hardware/ideascratchAssets.ts`. |
| `docs/IDEASCRATCH_ASSETS_AND_EXAMPLES.md` | 221 | Procedencia, métricas de overlays e inventario de los 30 `.iss` + 5 brechas Python. | `[EXISTING]` (corregida línea 19 a `236.01 GiB`). |
| `docs/TINKERCAD_CIRCUITS_RESEARCH.md` | — | Investigación integral de las 5 áreas de Tinkercad Circuits + IdeaBoard/IdeaSense. | `[EXISTING]` (creado en M2). |
| `index.html`, `package.json`, `tsconfig.json`, `vite.config.ts`, `.github/workflows/deploy.yml`, `README.md` | — | Configuración raíz, build Vite `base: './'`, workflow Pages y documentación inicial. | `package.json` y `README.md` actualizados según corresponda en Fases 4/6 y M2. |

### 2.2 Módulos nuevos planificados (`[PLANNED - Phase N]`)

| Archivo nuevo (`[PLANNED - Phase N]`) | Fase | Responsabilidad principal |
|---|---|---|
| `src/state/historyReducer.ts` | `[PLANNED - Phase 1]` | Pila de comandos / snapshots (*Undo/Redo* `Ctrl+Z` / `Ctrl+Y` / `Ctrl+Shift+Z`) con coalescencia en arrastres. |
| `src/utils/geometry.ts` | `[PLANNED - Phase 1]` | Matriz de rotación `30°` de pines (`getRotatedPinWorldPos`), ajuste a grilla `14 px` (`0.1"`), intersección de rectángulo *marquee* y cálculo de *bounding box* para `F`. |
| `src/components/IdeaBoardRealisticSvg.tsx` | `[PLANNED - Phase 2]` | Renderiza `${import.meta.env.BASE_URL}assets/ideascratch/ideaboard.svg` con 29 overlays (`IDEABOARD_SVG_METRICS`), 56 pads + `BOOT` (`IO0`) + `RESET` + `SELECT`. |
| `src/components/IdeaSenseExplorerSvg.tsx` | `[PLANNED - Phase 2]` | Renderiza `explorer.svg` con aislamiento CSS, controla 25 LEDs (`path34`–`path82`), botones A/B/C y puerto/cable `STEMMA QT` (`IO21`/`IO22`). |
| `src/components/BreadboardSvg.tsx` | `[PLANNED - Phase 2]` | Renderiza protoboards (`Half`, `Full`, `Mini`) y dibuja anillos verdes circulares sobre todo el bus conectado al orificio en hover. |
| `src/hardware/breadboardSpec.ts` | `[PLANNED - Phase 2]` | Generador de orificios `0.1"` (`14 px`), canales `a–e` / `f–j`, rieles `+`/`-` y mapas `holeId -> busId`. |
| `src/hardware/ideaSenseSpec.ts` | `[PLANNED - Phase 2]` | Definición de pines I2C (`GND`, `3.3V`, `SCL`, `SDA`), hitboxes A/B/C y valores por defecto de `SHT30`, `LTR303` y `LSM6DS3TR-C`. |
| `src/hardware/resistorBands.ts` | `[PLANNED - Phase 2]` | Cálculo de 4 bandas IEC 60062 (`band1`, `band2`, `multiplier`, `tolerance`) para valores en `Ω`, `kΩ` y `MΩ`. |
| `src/components/PinTargetOverlay.tsx` | `[PLANNED - Phase 2]` | Marcador cuadrado rojo con borde contrastado + tooltip flotante del pin bajo el cursor o imán de cable. |
| `src/components/WireLayer.tsx` | `[PLANNED - Phase 3]` | Renderizadores `Normal`, `Hookup` y `Alligator`, tiradores circulares blancos en vértices, arrastre e inserción por doble clic. |
| `src/hooks/useWireTool.ts` | `[PLANNED - Phase 3]` | Máquina de estados `IDLE` → `DRAWING` → `COMMITTED`, snap magnético a pines, guías `0°`/`90°`/`45°` y cancelación `Esc`. |
| `src/utils/wireRouting.ts` | `[PLANNED - Phase 3]` | Proyección punto-a-segmento para doble clic, ajuste ortogonal y caja delimitadora de cables. |
| `src/components/TopToolbar.tsx` | `[PLANNED - Phase 4]` | Barra superior de 2 niveles (sin botón `Mirror`), `Start/Stop Simulation` verde + `Simulator time: HH:MM:SS`, selector de vista y controles de edición/cable. |
| `src/components/ComponentDrawer.tsx` | `[PLANNED - Phase 4]` | Cajón derecho colapsable (`Basic`/`All`/`Starters`/`IdeaBoard & IdeaSense`), búsqueda en tiempo real y tarjetas vectoriales en 2 columnas. |
| `src/components/PropertyInspector.tsx` | `[PLANNED - Phase 4]` | Popover flotante superior derecho para editar `Name` y propiedades de resistencia, LED, fuente, multímetro o cable. |
| `src/components/NotesLayer.tsx` | `[PLANNED - Phase 4]` | Notas adhesivas ancladas en coordenadas de mundo (`N`) y visibilidad global (`Shift+N`). |
| `src/components/SchematicView.tsx` & `ComponentListView.tsx` & `src/utils/exporters.ts` | `[PLANNED - Phase 4]` | Vista esquemática con exportación PDF y tabla BOM de componentes con exportación CSV RFC-4180. |
| `src/sim/electricalSolver.ts` | `[PLANNED - Phase 5]` | Cálculo de corriente DC (Ley de Ohm), detección de sobrecorriente en LED (`> 20 mA`), sobrevoltaje (`> 3.6 V`), cortocircuitos y lecturas de multímetro (`V`/`A`/`Ω`). |
| `src/components/SerialPlotter.tsx` | `[PLANNED - Phase 5]` | Gráfica SVG multiserie en tiempo real alimentada por líneas numéricas del `Serial Monitor`. |
| `src/components/LiveSensorPopover.tsx` | `[PLANNED - Phase 5]` | Controles en vivo sobre lienzo para `TMP36`, `LDR`, punto verde arrastrable `HC-SR04` (`2–400 cm`) y deslizadores de `IdeaSense Explorer`. |
| `src/components/CodeDrawer.tsx` & `LibrariesDrawer.tsx` | `[PLANNED - Phase 6]` | Panel dividido `Blocks` / `Blocks + Text` / `Text`, gestor de bibliotecas y controles de depuración (`Debugger`). |
| `src/blocks/blocklyWorkspace.ts`, `circuitPythonGenerator.ts` & `issImporter.ts` | `[PLANNED - Phase 6]` | Workspace Blockly (IdeaBoard + IdeaSense), generador CircuitPython e importador `.iss` JSON v2 para los 30 ejemplos oficiales. |

---

## 3. Inventario Completo de Recursos Gráficos y Configuraciones

### 3.1 Recursos oficiales de IdeaScratch extraídos (`[EXISTING]` en `public/assets/ideascratch/`)

| ID / Categoría | Archivo en repositorio | Tamaño | Dimensiones / `viewBox` | Uso en IdeaBoard Studio |
|---|---|---:|---|---|
| `ideaboard` | `public/assets/ideascratch/ideaboard.svg` | `381,808` B | `42.7 × 65.7 mm` (`0.6499`) | Placa realista en `IdeaBoardRealisticSvg` (`[PLANNED - Phase 2]`) con 29 overlays |
| `explorer` | `public/assets/ideascratch/explorer.svg` | `261,152` B | `82.224442 × 87.847351 mm` (`0.9360`) | Placa `IdeaSense Explorer` en `IdeaSenseExplorerSvg` (`[PLANNED - Phase 2]`) con 25 LEDs `path34`–`path82` + A/B/C |
| `favicon` | `public/assets/ideascratch/favicon.png` | `2,010` B | `32 × 32 px` | Ya enlazado en `index.html:7` y reutilizable en `TopToolbar` |
| `crciberneticaLogo` | `public/assets/ideascratch/img/crcibernetica-logo.webp` | `15,392` B | `508 × 80 px` | Cabecera institucional / modal *Acerca de* |
| `ucenfotecLogo` | `public/assets/ideascratch/img/ucenfotec-logo.png` | `5,489` B | `250 × 105 px` | Créditos institucionales / modal *Acerca de* |
| Manifiesto y ejemplos | `examples/manifest.json` + 30 `examples/*.iss` | `104,480` B | JSON v2 (`blocks`, `dashboard`) | Cargador de 30 ejemplos oficiales (`[PLANNED - Phase 6]`) |
| Procedencia | `PROVENANCE.json` | `60,596` B | JSON v1.0.0 | Auditoría SHA-256, bytes y coordenadas de overlays |

*(Total verificado: **37 archivos**, **`830,927` B**, 100% copiados a `dist/assets/ideascratch/` durante `npm run build`.)*

### 3.2 Biblioteca SVG de componentes Tinkercad (Existentes + Planificados)

| Componente | Estado | Pines / Terminales (`0.1"` / `14 px` en Fase 2) | Overlays dinámicos y propiedades del Inspector |
|---|---|---|---|
| **IdeaBoard (Esquemático / Realista)** | `[EXISTING]` → `[ENHANCED - Phase 2]` | **56 pines conectables** + `BOOT` (`IO0`) + `RESET` + jumper `SELECT` (`Vin`/`+3.3v`) | 29 overlays (`sim-pixel`, `sim-boot-hitbox`, Motor1/2, 5 Servo, 6 Analog, 14 Digital); selector `Schematic` vs `Official` |
| **IdeaSense Explorer** | `[PLANNED - Phase 2]` | Bus `STEMMA QT` 4 pines (`GND`, `3.3V`, `SCL=IO22`, `SDA=IO21`) | Matriz `5×5` (`path34`–`path82`), botones A/B/C, sliders `SHT30` (`0x44`), `LTR303` (`0x29`), `LSM6DS3TR-C` (`0x6A`) |
| **Breadboard (Half / Full / Mini)** | `[PLANNED - Phase 2]` | `Half`: 30 cols + 4 rieles; `Full`: 63 cols + 8 rieles; `Mini`: 17 cols | Anillos circulares verdes (`#22c55e`) sobre todo el bus conectado al orificio en hover |
| **LED 5mm** | `[EXISTING]` → `[ENHANCED - Phase 2/5]` | `anode` (`A +`), `cathode` (`K -`) | Color (6 opciones en Inspector), halo radial por corriente, badge rojo `!` / quemado si `I > 20 mA` |
| **RGB LED (4 pines)** | `[PLANNED - Phase 2]` | `R`, `Common` (`Cathode`/`Anode`), `G`, `B` | Mezcla RGB continua + validación de sobrecorriente por canal |
| **Resistencia (4 bandas)** | `[PLANNED - Phase 2]` | `t1`, `t2` (no polarizada) | 4 bandas IEC 60062 recalculadas en vivo desde `Resistance` (`Ω`, `kΩ`, `MΩ`) |
| **Pulsador táctil** | `[EXISTING]` → `[ENHANCED - Phase 2]` | `sig`/`gnd` (compat) o 4 pines `1a/1b/2a/2b` | Animación de presión mientras se mantiene clic en `SIMULATING` |
| **Interruptor deslizante (`Slide Switch`)** | `[PLANNED - Phase 2]` | `t1`, `common`, `t2` (SPDT) | Conmuta `common ↔ t1` o `common ↔ t2` al clic |
| **Potenciómetro** | `[EXISTING]` → `[ENHANCED - Phase 5]` | `vcc`, `sig` (wiper), `gnd` | Perilla arrastrable rotatoria (`-135°..+135°` → `0..3.3V`) |
| **Fotorresistencia (`LDR`)** | `[PLANNED - Phase 2]` | `t1`, `t2` | Deslizador inline de luz en simulación (`~500 Ω` luz a `~100 kΩ` oscuridad) |
| **Sensor temperatura `TMP36`** | `[PLANNED - Phase 2]` | `vs`, `vout`, `gnd` | Deslizador inline `-40..125 °C` (`Vout = 0.5 + 0.01 * T`) |
| **Servo SG90 / Motor DC / Buzzer** | `[EXISTING]` | `gnd/vcc/sig`, `pos/neg`, `pos/neg` | Servo `0°–180°`, Motor DC rueda + `RPM`, Buzzer Web Audio + ondas |
| **Sensor Ultrasónico `HC-SR04`** | `[EXISTING]` → `[ENHANCED - Phase 5]` | `vcc`, `trig`, `echo`, `gnd` | Cono radar + **punto objetivo verde arrastrable** (`2–400 cm`) |
| **Multímetro** | `[PLANNED - Phase 2]` | `pos` (`+`), `neg` (`-`) | Modo (`Voltage V`, `Amperage A`, `Resistance Ω`) + display LCD en vivo |
| **Fuente de banco / Batería** | `[PLANNED - Phase 2]` | `pos` (`+`), `neg` (`-`) | `Voltage` (`0–12 V`), límite `Current` (`A`) / `1–4` celdas |

### 3.3 Paleta de 12 colores de cable, atajos `1–9, 0` (Mapeo A) y 3 tipos

| Índice | Color | Hex | Atajo (Mapeo A) | Estado en `componentSpecs.ts` |
|---:|---|---:|---|---|
| 1 | Negro (`Black`) | `#1e293b` | `1` | `[EXISTING]` (`#334155`, unificar) |
| 2 | Rojo (`Red`) | `#ef4444` | `2` | `[EXISTING]` |
| 3 | Naranja (`Orange`) | `#f97316` | `3` | `[EXISTING]` |
| 4 | Amarillo (`Yellow`) | `#eab308` | `4` | `[EXISTING]` |
| 5 | Verde (`Green`) | `#22c55e` | `5` | `[EXISTING]` |
| 6 | Turquesa (`Turquoise`) | `#06b6d4` | `6` | `[PLANNED - Phase 3]` |
| 7 | Azul (`Blue`) | `#3b82f6` | `7` | `[EXISTING]` |
| 8 | Morado (`Purple`) | `#a855f7` | `8` | `[EXISTING]` |
| 9 | Rosa (`Pink`) | `#ec4899` | `9` | `[PLANNED - Phase 3]` |
| 10 | Café (`Brown`) | `#92400e` | `0` | `[PLANNED - Phase 3]` |
| 11 | Gris (`Grey`) | `#64748b` | Selector UI | `[PLANNED - Phase 3]` |
| 12 | Blanco (`White`) | `#f8fafc` (borde `#94a3b8`) | Selector UI | `[PLANNED - Phase 3]` |

**Tipos de cable (`WireType`):** `normal` (trazo polilínea limpio), `hookup` (jumper grueso con terminales metálicos en puntas), `alligator` (cable aislado con pinzas caimán orientadas por `atan2` en ambos extremos).

### 3.4 Matriz de atajos de teclado y 5 correcciones de compatibilidad CircuitPython

- **Atajos de teclado:** Todos los atajos (`R`, `Shift+R`, `Delete`/`Backspace`, `Ctrl+Z`, `Ctrl+Y`/`Ctrl+Shift+Z`, `Ctrl+C/V/D`, `Arrow Keys`, `1–9, 0`, `N`, `Shift+N`, `F`, `+`/`-`, `Shift+Click`, `Esc`) **deben ignorar pulsaciones** cuando el foco está dentro de `<input>`, `<textarea>`, `<select>`, `[contenteditable]` o `.monaco-editor`.
- **5 brechas de compatibilidad CircuitPython a cerrar en Fase 5 (`public/pyodide-worker.js` y `ideaboardSpec.ts`):**
  1. **`board.IO4` y `board.IO5`:** Añadir alias en `pyodide-worker.js:154-160` (`_board_mod.IO4 = _board_mod.IO04`, `_board_mod.IO5 = _board_mod.IO05`, `_board_mod.BOOT = _board_mod.IO0`) y campo `aliases` en `ideaboardSpec.ts`.
  2. **`ib.map_range(...)`:** Añadir `@staticmethod def map_range(...)` delegando a `IdeaBoard.mapa(...)` en `pyodide-worker.js:583-588`.
  3. **`keypad` en `board.IO0` (`bootButton.iss`):** Implementar módulo virtual `keypad` (`keypad.Keys((board.IO0,), value_when_pressed=False, pull=True)`, `keys.events.get()`) leyendo `bootPressed` desde `_poll_inputs()`.
  4. **`ideasense.IdeaSense` (`simple.iss`, `accelPointer.iss`, `textDemo.iss`, `weather.iss`):** Implementar módulo virtual `ideasense` (`HT16K33` matriz `5×5` `matrix[x, y]`, `fill`, `brightness`, `show`, propiedades `temp`, `humid`, `light`, `accel`, `gyro`, y `pressed`/`released` con consumo por lectura frente a `held` continuo).
  5. **`hcsr04.HCSR04.dist_cm()` (`ultrasonic.iss`):** Registrar `sys.modules["hcsr04"]` con subclase `HCSR04(_HCSR04)` exponiendo `dist_cm(self)` sin romper `adafruit_hcsr04.HCSR04.distance`.

---

## 4. Arquitectura Propuesta (Cobertura de las 5 Áreas)

### 4.1 Área 1 — UI Shell (Barra de 2 niveles, Cajones y Vistas)
- **Layout:** `TopToolbar` (`[PLANNED - Phase 4]`) superior fijo en 2 niveles (`Tier 1`: ícono + nombre editable + `Code` + `Start/Stop Simulation` verde + `Simulator time: HH:MM:SS` + `Send To` + `Circuit/Schematic/BOM`; `Tier 2`: `Rotate`, `Delete`, `Undo/Redo`, `Notes`, `Hide Notes`, `Wire Color`, `Wire Type`). **Sin botón `Mirror`**.
- **Área principal:** Lienzo SVG 100% ancho + `PropertyInspector` flotante arriba-derecha (solo cuando `selectionSize === 1`) + cajón derecho conmutable entre `ComponentDrawer` (colapsable, categorías `Basic`/`All`/`Starters`/`IdeaBoard & IdeaSense`, búsqueda, 2 columnas) y `CodeDrawer` (`Blocks`/`Blocks+Text`/`Text`, `Libraries`, `Debugger`, `Serial Monitor TX` + `Serial Plotter`).

### 4.2 Área 2 — Arquitectura SVG, Normalización `ideaboard.svg` y `explorer.svg`
- **Normalización de `ideaboard.svg`:** `ideaboard.svg` (`viewBox="0 0 42.7 65.7"`) equivale a `260 × 400.05 px`, mientras `src/hardware/ideaboardSpec.ts` actual usa `260 × 430 px` (`+7.49%`). `IdeaBoardRealisticSvg` (`[PLANNED - Phase 2]`) renderizará `<image href={IDEABOARD_SVG_METRICS.url} width={260} height={400.05} />` junto con sus **29 overlays** posicionados por porcentaje y sus **56 pines** + **`IO0` (`BOOT`)** usando `IDEABOARD_SVG_METRICS.normalizedPinGroups`, manteniendo intacto `IdeaBoardSvg.tsx` para el modo `Schematic`.
- **`explorer.svg` sin colisión de estilos:** Dado que `ideaboard.svg` y `explorer.svg` usan clases internas Inkscape (`.B`–`.T`), `ideaboard.svg` se renderiza como `<image>` con overlays React y `explorer.svg` se inyecta con prefijo de clases o `<object>` mismo-origen en `IdeaSenseExplorerSvg.tsx`, mutando en vivo los 25 `<path>` `path34`–`path82` (`#4488ff` vs `#b3b3b3`) y capturando los 3 hitboxes A/B/C.
- **Protoboard, pines y resistencias:** `PinTargetOverlay` dibuja cuadrado rojo + tooltip semántico en cada terminal; `BreadboardSvg` consulta `netlist.pinToBusHoles` para iluminar con círculos verdes todos los huecos del mismo bus; `resistorBands.ts` actualiza las 4 franjas IEC 60062 en vivo.

### 4.3 Área 3 — Máquina de Estados de Cableado y 3 Renderizadores
- `useWireTool` (`[PLANNED - Phase 3]`) implementa `IDLE` → `DRAWING` → `COMMITTED`:
  - Clic en pin/orificio inicia `DRAWING`.
  - Clic en vacío agrega `{ x, y }` a `waypoints` usando guías de alineación ortogonal (`0°`/`90°`) y `45°` (`6 px` umbral).
  - Proximidad a pin válido (`10 px`) activa snap magnético + cuadrado rojo + tooltip; clic confirma el cable (`COMMITTED`).
  - `Esc` cancela y vuelve a `IDLE`.
- `WireLayer` (`[PLANNED - Phase 3]`) renderiza `normal`, `hookup` y `alligator`, muestra tiradores circulares blancos en cada `waypoint` al seleccionar, y proyecta clics dobles sobre segmentos para insertar nuevos quiebres.

### 4.4 Área 4 — Lienzo SVG de 5 Capas, Zoom, Pan, Rotación `30°` e Historial
- **Transformación de cámara:** `translate(pan.x, pan.y) scale(zoom)` con `transformOrigin: '0 0'` (`zoom ∈ [0.25, 4.0]`). El zoom de rueda mantiene invariante `(mx - pan.x) / zoom`. `F` ajusta `zoom` y `pan` al *bounding box* de selección o circuito completo.
- **Pan vs Marquee:** `Middle-Drag`, `Right-Drag` y `Space + Left-Drag` hacen *Pan*; `Left-Drag` en vacío abre rectángulo *Marquee* (`Shift+Click` alterna selección múltiple).
- **Rejilla mundial `14 px` (`0.1"`) y rotación `30°`:** Patrón SVG `<pattern width="14" height="14">` dentro del contenedor transformado (`L0`). Al arrastrar o usar flechas (`14 px`, o `1 px` con `Shift`), se muestran guías ortogonales entre pines. `getPinWorldPos` rota los pines de cada componente por `comp.rotation` (`±30°`).
- **Z-order determinístico (`L0`–`L4`):** `L0` Grilla/Guías → `L1` Placas/Protoboards → `L2` Componentes → `L3` Cables → `L4` Overlays activos (`handles`, `marquee`, notas, pines rojos, anillos verdes, fallas `!`, popovers en vivo).
- **Historial (`historyReducer.ts`):** Patrón comando/snapshot para Undo/Redo y Copy/Paste/Duplicate (`(+28, +28)` con remapeo de IDs y cables internos).

### 4.5 Área 5 — Motor de Simulación, Bloqueo `EDIT`/`SIMULATING`, Fallas y Pyodide
- **Bloqueo estricto:** `isSimulating = status === 'running' || status === 'loading-python'` deshabilita mutaciones en `TopToolbar`, `ComponentDrawer`, `CircuitCanvas`, `WireLayer`, `PropertyInspector` y fija `readOnly={true}` en Monaco, permitiendo únicamente navegación (`Pan`/`Zoom`/`F`), `Serial TX`, `Debugger` y controles `data-interactive="true"`.
- **Solver DC y fallas (`electricalSolver.ts` + `netlist.ts`):** Propaga tiras de protoboard, interruptores y resistencias en serie. Calcula corriente en LEDs (`I = (V_drive - V_f) / max(R_series, 20)`); si `I > 20 mA` (ej. sin resistencia limitadora), marca `status: 'blown'` con badge rojo `!`, overlay de destello y mensaje diagnóstico en mA. Detecta cortocircuitos `GND ↔ V+/3.3v` y calcula lecturas del multímetro.
- **Bridge Pyodide + IdeaSense:** `useSimulation.ts` y `pyodide-worker.js` sincronizan `bootPressed`, `explorer` (`buttons`, `temp`, `humid`, `light`, `accel`, `gyro`) y retornan `explorerMatrix` (`number[25]`) junto a `pins` y `neopixel`.

---

## 5. Fases de Implementación Verificables (Fases 1–6)

### Fase 1 — Navegación 2D, Rejilla `0.1"` (`14 px`), Selección múltiple, Rotación `30°` y Undo/Redo
- **Objetivo:** Establecer la mecánica espacial exacta de Tinkercad Circuits en el lienzo antes de sumar placas nuevas y barras complejas.
- **Archivos objetivo:**
  - `[EXISTING]` `src/types/simulator.ts`, `src/components/CircuitCanvas.tsx`, `src/App.tsx`, `src/index.css`
  - `[PLANNED - Phase 1]` `src/state/historyReducer.ts`, `src/utils/geometry.ts`
- **Criterios de aceptación:**
  1. La rueda del ratón hace zoom anclado al cursor (`0.25x`–`4.0x`); `F` encuadra selección o circuito completo; `+`/`-` escalan al centro.
  2. `Middle-Drag` / `Space+Left-Drag` hacen pan; `Left-Drag` en vacío dibuja rectángulo *Marquee*; `Shift+Click` alterna selección múltiple.
  3. Arrastre ajusta a grilla mundial `14 px` (`0.1"`) con guías ortogonales; `Arrow Keys` desplazan; `R`/`Shift+R` rotan en pasos de `30°` con pines recalculados.
  4. `Ctrl+Z` / `Ctrl+Y` (`Ctrl+Shift+Z`) y `Ctrl+C/V/D` operan sobre inserción, movimiento, rotación y borrado.
- **Comandos de verificación:** `npx tsc --noEmit && npm run build`; pruebas unitarias de rotación `0°/30°/90°/180°` en `geometry.ts` y transiciones de pila en `historyReducer.ts`.

### Fase 2 — IdeaBoard Realista, IdeaSense Explorer, Protoboards y Biblioteca SVG Tinkercad
- **Objetivo:** Integrar `ideaboard.svg`, `explorer.svg`, protoboards con continuidad verde y los componentes SVG faltantes.
- **Archivos objetivo:**
  - `[EXISTING]` `src/hardware/ideascratchAssets.ts`, `src/hardware/ideaboardSpec.ts`, `src/hardware/componentSpecs.ts`, `src/components/IdeaBoardSvg.tsx`, `src/components/ExternalComponentSvg.tsx`, `src/types/simulator.ts`
  - `[PLANNED - Phase 2]` `src/components/IdeaBoardRealisticSvg.tsx`, `src/components/IdeaSenseExplorerSvg.tsx`, `src/components/BreadboardSvg.tsx`, `src/hardware/breadboardSpec.ts`, `src/hardware/ideaSenseSpec.ts`, `src/hardware/resistorBands.ts`, `src/components/PinTargetOverlay.tsx`
- **Criterios de aceptación:**
  1. IdeaBoard conmuta entre vista `Schematic` (`260×430`) y `Official` (`ideaboard.svg` `260×400.05`) con sus 56 pines + `IO0` `BOOT` + 29 overlays alineados.
  2. `IdeaSenseExplorerSvg` renderiza `explorer.svg`, controla los 25 LEDs `path34`–`path82` en `#4488ff`, responde a botones A/B/C y se vincula vía `STEMMA QT` (`IO21`/`IO22`).
  3. Hover en cualquier orificio de protoboard dibuja anillos circulares verdes en todo su bus; hover en cualquier pin muestra cuadrado rojo + tooltip semántico.
  4. La resistencia actualiza sus 4 bandas IEC 60062 para cualquier valor en `Ω`/`kΩ`/`MΩ`.
- **Comandos de verificación:** `npx tsc --noEmit && npm run build`; comprobar HTTP `200` de `dist/assets/ideascratch/ideaboard.svg` y `explorer.svg` en `vite preview`; pruebas de `resistorBands.ts` y equivalencia de buses en `breadboardSpec.ts`.

### Fase 3 — Cableado Interactivo por Puntos de Quiebre, 12 Colores y 3 Tipos
- **Objetivo:** Reemplazar cables Bézier de 2 puntos por trazado multicodo interactivo con edición de vértices y atajos `1–9, 0`.
- **Archivos objetivo:**
  - `[EXISTING]` `src/types/simulator.ts`, `src/hardware/componentSpecs.ts`, `src/hardware/starterTemplates.ts`, `src/components/CircuitCanvas.tsx`
  - `[PLANNED - Phase 3]` `src/components/WireLayer.tsx`, `src/hooks/useWireTool.ts`, `src/utils/wireRouting.ts`
- **Criterios de aceptación:**
  1. Clic en pin A inicia trazado; clic en vacío agrega quiebres con guías `0°`/`90°`/`45°`; aproximar pin B ajusta magnéticamente y clic confirma; `Esc` cancela.
  2. Seleccionar cable muestra tiradores blancos circulares; arrastrar mueve vértice; doble clic en segmento inserta nuevo quiebre; `Delete` elimina cable.
  3. Teclas `1–9, 0` (Mapeo A) recoloran cables seleccionados/activos; los 12 colores y 3 tipos (`Normal`, `Hookup`, `Alligator`) se distinguen visualmente sin romper las 4 plantillas existentes.
- **Comandos de verificación:** `npx tsc --noEmit && npm run build`; pruebas de proyección punto-a-segmento (`wireRouting.ts`) y retrocompatibilidad de `STARTER_TEMPLATES`.

### Fase 4 — Shell de Trabajo Tinkercad, Inspector Flotante, Cajón de Componentes y Vistas
- **Objetivo:** Replicar la disposición UI completa de Tinkercad Circuits en tema claro de trabajo.
- **Archivos objetivo:**
  - `[EXISTING]` `src/App.tsx`, `src/components/ComponentPalette.tsx`, `src/components/CodeAndConsolePanel.tsx`, `src/index.css`
  - `[PLANNED - Phase 4]` `src/components/TopToolbar.tsx`, `src/components/ComponentDrawer.tsx`, `src/components/PropertyInspector.tsx`, `src/components/NotesLayer.tsx`, `src/components/SchematicView.tsx`, `src/components/ComponentListView.tsx`, `src/utils/exporters.ts`
- **Criterios de aceptación:**
  1. Barra superior de 2 niveles fiel a Circuits (sin botón `Mirror`); cajón derecho de componentes colapsable con filtro `Basic`/`All`/`Starters` + búsqueda + tarjetas 2 columnas.
  2. Seleccionar un solo componente o cable abre el `PropertyInspector` flotante arriba-derecha (`Name` + campos específicos sincronizados con Undo/Redo).
  3. `N` agrega notas y `Shift+N` las oculta/muestra; vistas `Schematic` (PDF) y `Component List` (CSV) generan salidas válidas del circuito actual.
- **Comandos de verificación:** `npx tsc --noEmit && npm run build`; verificación visual en `npm run preview` de colapso de cajones, inspector de resistencia y exportación CSV.

### Fase 5 — Motor de Simulación, Edit-Lock, Fallas Eléctricas, Plotter y Paridad Pyodide/IdeaSense
- **Objetivo:** Completar el ciclo `EDIT` ↔ `SIMULATING`, diagnóstico eléctrico realista, controles en vivo y las 5 brechas Python de IdeaScratch.
- **Archivos objetivo:**
  - `[EXISTING]` `src/sim/netlist.ts`, `src/sim/useSimulation.ts`, `public/pyodide-worker.js`, `src/components/CodeAndConsolePanel.tsx`, `src/components/ExternalComponentSvg.tsx`, `src/App.tsx`
  - `[PLANNED - Phase 5]` `src/sim/electricalSolver.ts`, `src/components/SerialPlotter.tsx`, `src/components/LiveSensorPopover.tsx`
- **Criterios de aceptación:**
  1. `Start Simulation` cambia a `Stop Simulation` en verde brillante con `Simulator time: HH:MM:SS` y bloquea toda edición de circuito/código mientras permite pan/zoom, `Serial TX` y controles interactivos.
  2. LED conectado sin resistencia limitadora (`I > 20 mA`) muestra badge rojo `!` y overlay quemado con detalle en mA; al insertar `220 Ω` desaparece la falla y enciende normal.
  3. Ejecutan sin errores ejemplos con `board.IO4`, `ib.map_range`, `keypad` en `IO0` (`bootButton`), `hcsr04.HCSR04.dist_cm()` y `from ideasense import IdeaSense` (reflejado en `explorer.svg` `path34`–`path82`).
- **Comandos de verificación:** `npx tsc --noEmit && npm run build`; pruebas unitarias de `electricalSolver.ts` y `netlist.ts`; prueba de humo en `vite preview` ejecutando código Python de `blink`, `servo`, `bootButton` y `simple`.

### Fase 6 — Modos `Blocks` / `Blocks + Text`, Importador `.iss` y Endurecimiento GitHub Pages
- **Objetivo:** Integrar programación visual Blockly sincronizada con CircuitPython y carga nativa de los 30 ejemplos `.iss` oficiales.
- **Archivos objetivo:**
  - `[EXISTING]` `package.json`, `vite.config.ts`, `.github/workflows/deploy.yml`, `src/components/CodeAndConsolePanel.tsx`, `src/hardware/ideascratchAssets.ts`
  - `[PLANNED - Phase 6]` `src/components/CodeDrawer.tsx`, `src/components/LibrariesDrawer.tsx`, `src/blocks/blocklyWorkspace.ts`, `src/blocks/circuitPythonGenerator.ts`, `src/blocks/issImporter.ts`
- **Criterios de aceptación:**
  1. `Blocks + Text` regenera CircuitPython en tiempo real; proyecto nuevo inicia con `_defaultBlocks` (`controls_forever`).
  2. Los 30 archivos `.iss` de `public/assets/ideascratch/examples/` se cargan limpiamente con `issImporter.ts`, agregando/vinculando `IdeaSense Explorer` automáticamente si detecta bloques de `explorer_setup`.
  3. `npm run build` termina con código `0`, sin URLs absolutas `/assets/` en `dist/`, respetando presupuesto en `C:` y desplegando limpio en GitHub Pages.
- **Comandos de verificación:** `npx tsc --noEmit && npm run build`; script de validación sobre los 30 `.iss` en `public/assets/ideascratch/examples/*.iss`; inspección de `dist/index.html` y chunks para confirmar rutas relativas `./`.

---

## 6. Matriz de Trazabilidad y Rúbrica de Verificación

### 6.1 Matriz de trazabilidad (`ORIGINAL_REQUEST.md` → Documentación → Archivos del Repositorio)

| ID | Requisito / Área | Evidencia documental | Anclaje en repositorio (`[EXISTING]` y `[PLANNED - Phase N]`) | Criterio de aprobación |
|---|---|---|---|---|
| **R1** | Recursos e imagen oficial IdeaBoard, IdeaSense y ejemplos IdeaScratch | `docs/IDEASCRATCH_ASSETS_AND_EXAMPLES.md`, `TINKERCAD_CIRCUITS_RESEARCH.md` Área 2.3 | `[EXISTING]` `public/assets/ideascratch/*` (`37` archivos), `src/hardware/ideascratchAssets.ts`, `index.html:7` | 5 imágenes + `manifest.json` + 30 `.iss` existen (>0 B) con SHA-256 y dimensiones en `PROVENANCE.json` |
| **R2.1** | Tinkercad Área 1: UI Layout | `TINKERCAD_CIRCUITS_RESEARCH.md` Área 1 + `REPLICATION_PLAN.md` §4.1 | `[EXISTING]` `App.tsx`, `ComponentPalette.tsx`, `CodeAndConsolePanel.tsx`; `[PLANNED - Phase 4]` `TopToolbar.tsx`, `ComponentDrawer.tsx`, `PropertyInspector.tsx` | Barra 2 niveles (sin `Mirror`), cajón colapsable, inspector flotante, vistas y tabla de atajos |
| **R2.2** | Tinkercad Área 2: SVGs de placas/componentes | `TINKERCAD_CIRCUITS_RESEARCH.md` Área 2 + `REPLICATION_PLAN.md` §3.2, §4.2 | `[EXISTING]` `IdeaBoardSvg.tsx`, `ExternalComponentSvg.tsx`, `ideaboardSpec.ts` (`56` pines); `[PLANNED - Phase 2]` `IdeaBoardRealisticSvg.tsx`, `IdeaSenseExplorerSvg.tsx`, `BreadboardSvg.tsx`, `resistorBands.ts` | Cuadrados rojos en pines + tooltips, círculos verdes en protoboard, 29 overlays IdeaBoard, 25 LEDs IdeaSense (`path34`–`path82`) |
| **R2.3** | Tinkercad Área 3: Cableado interactivo | `TINKERCAD_CIRCUITS_RESEARCH.md` Área 3 + `REPLICATION_PLAN.md` §3.3, §4.3 | `[EXISTING]` `CircuitCanvas.tsx`, `simulator.ts`, `componentSpecs.ts`, `starterTemplates.ts`; `[PLANNED - Phase 3]` `WireLayer.tsx`, `useWireTool.ts`, `wireRouting.ts` | `IDLE`→`DRAWING`→`COMMITTED`, waypoints, tiradores blancos, doble clic, 12 colores (`1–9, 0` Mapeo A), 3 tipos |
| **R2.4** | Tinkercad Área 4: Comportamiento del lienzo | `TINKERCAD_CIRCUITS_RESEARCH.md` Área 4 + `REPLICATION_PLAN.md` §4.4 | `[EXISTING]` `CircuitCanvas.tsx`, `index.css`; `[PLANNED - Phase 1]` `historyReducer.ts`, `geometry.ts` | Zoom al cursor, `F`, Pan vs Marquee desambiguado, grilla `14 px` (`0.1"`), `30°` rotación, 5 capas `L0`–`L4`, Undo/Redo |
| **R2.5** | Tinkercad Área 5: Controles y simulación | `TINKERCAD_CIRCUITS_RESEARCH.md` Área 5 + `REPLICATION_PLAN.md` §3.4, §4.5 | `[EXISTING]` `useSimulation.ts`, `netlist.ts`, `buzzerAudio.ts`, `public/pyodide-worker.js`; `[PLANNED - Phase 5]` `electricalSolver.ts`, `SerialPlotter.tsx`, `LiveSensorPopover.tsx` | Botón verde + `HH:MM:SS`, `EDIT`/`SIMULATING` lock, fallas `!`/quemado, `Serial TX` + `Plotter`, 5 arreglos CircuitPython |
| **R3** | Plan accionable mapeado al repo actual | `REPLICATION_PLAN.md` §1–§5 | Todos los `[EXISTING]` verificados (`17` en `src/`, `1` worker, `37` assets) + `[PLANNED - Phase 1..6]` | Cero referencias `[EXISTING]` inexistentes; Fases 1–6 consistentes y verificables |
| **R4** | Disco `C:`, build `0` y GitHub Pages `base: './'` | `REPLICATION_PLAN.md` §1.2, Fase 6 + `IDEASCRATCH_ASSETS_AND_EXAMPLES.md` §1 | `[EXISTING]` `vite.config.ts`, `tsconfig.json`, `package.json`, `.github/workflows/deploy.yml`, `README.md` | Espacio `C:` verificado (`~1.24–1.30 GiB` libre), `npm run build` código `0`, sin tokens filtrados |

### 6.2 Lista de verificación rápida para auditoría independiente

- [ ] Todos los archivos marcados `[EXISTING]` existen en las rutas exactas indicadas (`17` en `src/`, `public/pyodide-worker.js`, `37` en `public/assets/ideascratch/`).
- [ ] Todos los módulos nuevos llevan etiqueta explícita `[PLANNED - Phase N]` coherente entre §2, §3, §4, §5 y §6.
- [ ] El conteo de pines conectables de `ideaboardSpec.ts` figura exactamente como **`56` pines conectables** (+ `IO0` `BOOT` y `SELECT`).
- [ ] Se documentan explícitamente la ausencia de herramienta `Mirror` en Tinkercad Circuits, el Mapeo A (`1–9, 0`) de cables y la desambiguación `Pan` vs `Marquee`.
- [ ] Las 5 brechas Python (`board.IO4/5`, `map_range`, `keypad` `IO0`, `ideasense.IdeaSense`, `hcsr04.dist_cm()`) y el contrato `${import.meta.env.BASE_URL}` para `vite` `base: './'` quedan cubiertos.
- [ ] `npm run build` (`tsc --noEmit && vite build`) finaliza con código de salida `0`.
