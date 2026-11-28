# Investigación Integral de Tinkercad Circuits y Hardware CRCibernética (IdeaBoard e IdeaSense Explorer)

Este documento recopila la investigación técnica de referencia sobre **Autodesk Tinkercad Circuits** en sus cinco áreas funcionales priorizadas y la integra con las especificaciones oficiales del hardware **CRCibernética IdeaBoard** e **IdeaSense Explorer** (extraídas de los repositorios oficiales de CRCibernética y del sitio oficial de IdeaScratch `v4.37`). Sirve como base normativa para el [Plan de Replicación en IdeaBoard Studio](./REPLICATION_PLAN.md).

- **Complemento de recursos gráficos y ejemplos:** [`docs/IDEASCRATCH_ASSETS_AND_EXAMPLES.md`](./IDEASCRATCH_ASSETS_AND_EXAMPLES.md)
- **Registro de procedencia verificada:** [`public/assets/ideascratch/PROVENANCE.json`](../public/assets/ideascratch/PROVENANCE.json)
- **Plan de replicación accionable:** [`docs/REPLICATION_PLAN.md`](./REPLICATION_PLAN.md)

---

## Resumen Ejecutivo y Diferencias Clave frente a Tinkercad 3D Design

Uno de los errores más frecuentes al documentar o clonar Tinkercad es mezclar comportamientos de **Tinkercad 3D Design** con **Tinkercad Circuits**. A partir del análisis contrastado de guías oficiales de Autodesk, manuales curriculares (DigiKey, Digital Maestro, Instructables, CUNY) y la arquitectura de circuitos en navegador, se confirman las siguientes reglas propias de **Tinkercad Circuits**:

| Dimensión | Tinkercad 3D Design | Tinkercad Circuits (Objetivo de paridad) |
|---|---|---|
| **Espacio de trabajo** | Cámara orbital 3D con plano de trabajo configurable (color y rejilla). | Lienzo **estrictamente 2D infinito** con fondo neutro fijo y paso de pines `0.1"` (`2.54 mm`). |
| **Herramienta Espejo (`Mirror`)** | Botón en barra superior y atajo `M`. | **No existe botón ni atajo nativo `M` de Mirror/Flip** en Circuits; la orientación se controla mediante rotación. |
| **Rotación (`R` / `Shift+R`)** | Giros en ejes X/Y/Z mediante arcos 3D. | Rotación planar en incrementos de **`30°`** (`12` pasos por vuelta completa de `360°`). |
| **Alineación (`L`) y Orden Z** | Herramienta *Align* (`L`) y plano base Z manual. | Sin herramienta *Align* 3D ni controles manuales *Bring to Front / Send to Back*; el **orden Z es determinístico por capa semántica**. |
| **Navegación (`Pan` / `Zoom`)** | Arrastrar botón derecho orbita en 3D; botón central hace pan. | Sin órbita 3D; rueda centrada en el cursor hace zoom, botón central (y arrastre en vacío según contexto) desplaza el lienzo 2D. |

---

## Área 1: Disposición e Interfaz de Usuario (UI)

La interfaz de Tinkercad Circuits maximiza el área del lienzo mediante una barra superior compacta de dos niveles, un cajón lateral derecho colapsable para componentes, un cajón dividido para programación/depuración y un inspector contextual flotante.

### 1.1 Barra superior de doble nivel (*Two-Tier Top Bar*)

1. **Nivel superior (Cabecera de proyecto, código, simulación y vistas):**
   - **Bloque izquierdo:** Logotipo/ícono de retorno al panel principal + campo **Nombre del proyecto** editable en línea (*inline-editable*).
   - **Bloque derecho:**
     - Botón **`Code`**: abre o cierra el cajón lateral dividido del editor de código y monitor serial.
     - Botón **`Start Simulation` / `Stop Simulation`**: al iniciar la simulación cambia su etiqueta a `Stop Simulation`, se ilumina en **verde brillante** y muestra junto a sí el contador **`Simulator time: HH:MM:SS`**.
     - Botón **`Send To`** (Compartir / Exportar): exportación de capturas, invitación de colaboradores, envío a Autodesk Fusion y exportación a placa `.brd` (Autodesk EAGLE).
     - **Selectores de Modo de Vista** (*View Mode Toggles*, grupo superior derecho):
       1. **`Circuit View`**: vista principal interactiva de protoboard, placas y cables (por defecto).
       2. **`Schematic View`**: diagrama esquemático estandarizado autogenerado a partir del circuito, con botón de **exportación a PDF**.
       3. **`Component List`**: tabla autogenerada de lista de materiales (BOM) con cantidades y valores, con botón de **exportación a CSV**.

2. **Nivel inferior (Barra de edición y herramientas contextuales):**
   - **Acciones de manipulación:** **`Rotate`** (flecha curva, atajos `R` / `Shift+R`) y **`Delete`** (papelera, atajos `Delete` / `Backspace`). *(Nota: sin botón `Mirror`.)*
   - **Historial:** **`Undo`** (`Ctrl+Z` / `Cmd+Z`) y **`Redo`** (`Ctrl+Y` / `Ctrl+Shift+Z` / `Cmd+Shift+Z`).
   - **Anotaciones:** **`Annotation / Notes`** (globo de comentario, atajo `N`) para fijar notas adhesivas en coordenadas del lienzo y **`View / Hide Notes`** (ojo, atajo `Shift+N`) para mostrar u ocultar todas las notas sin borrarlas.
   - **Controles contextuales de cableado:** Selector circular **`Wire Color`** (paleta de 12 colores) y desplegable **`Wire Type`** (`Normal`, `Hookup`, `Alligator`), activos cuando existe un cable seleccionado o en trazado.

### 1.2 Cajón lateral derecho de componentes (*Component Drawer*)

- Acoplado al borde derecho con una pestaña de flecha (*chevron*) para **colapsar o expandir** el panel y dar ancho completo al lienzo.
- **Filtro de categoría:** Desplegable superior con modos `Components: Basic` (por defecto), `Components: All`, `Starters: Basic`, `Starters: Arduino`, `Starters: Micro:bit` y ensamblajes (*Circuit Assemblies*).
- **Búsqueda instantánea:** Caja de texto bajo el selector de categoría para filtrado por subcadena en tiempo real (ej. `"resistor"`, `"TMP36"`, `"servo"`).
- **Rejilla de 2 columnas:** Tarjetas desplazables sobre fondo claro con miniatura vectorial limpia y nombre debajo. Soporta **clic para adjuntar al cursor y soltar** (*click-to-place*) o **arrastrar y soltar** (*drag-and-drop*) directo al lienzo.

### 1.3 Cajón dividido de código y consola (*Split Code Drawer*)

Se despliega desde el lateral derecho compartiendo o reemplazando temporalmente el cajón de componentes:

- **Selector de microcontrolador:** Desplegable activo cuando hay más de una placa programable en el circuito.
- **Selector de modo de código:**
  - **`Blocks`**: programación visual por bloques tipo Scratch/Blockly.
  - **`Blocks + Text`**: vista dividida sincronizada en vivo con bloques a la izquierda y el código textual generado a la derecha.
  - **`Text`**: editor de código completo (en IdeaBoard Studio, Monaco Editor con Python/CircuitPython).
- **Botón `Libraries`:** Despliega la lista de bibliotecas integradas disponibles para importar/incluir (`Servo`, `LiquidCrystal`, `Adafruit_NeoPixel`, `IRremote`; en IdeaBoard Studio: `ideaboard`, `ideasense`, `adafruit_hcsr04`, `keypad`, etc.).
- **Botón `Debugger` y controles de depuración:** Permite activar/desactivar puntos de ruptura (*breakpoints*) haciendo clic en el margen del editor, pausar/reanudar (**`Pause / Resume`**), avanzar línea por línea (**`Step Over`**) e inspeccionar valores de variables al pasar el cursor mientras la ejecución está pausada.
- **Descarga y reinicio:** Botón **`Download Code`** (`.ino` / `.py`) y botón de limpieza/reinicio.
- **Panel inferior colapsable `Serial Monitor` + `Serial Plotter`:** Consola de texto desplazable, campo de entrada TX + botón **`Send`**, botón **`Clear`**, y botón de conmutación **`Serial Plotter` / Gráfica** para visualizar series numéricas en tiempo real.

### 1.4 Inspector flotante de propiedades (*Component Property Inspector*)

Aparece en la zona superior derecha del lienzo (justo a la izquierda del cajón de componentes) únicamente cuando hay **un solo componente o cable seleccionado**:

- Campo editable estándar **`Name`** (`label` visible/identificador).
- Controles específicos según el tipo seleccionado:
  - **Resistencia (`Resistor`):** Campo numérico `Resistance` + selector de unidad (`Ω`, `kΩ`, `MΩ`) con recalculo inmediato de las 4 bandas de color en el SVG.
  - **LED:** Desplegable `Color` (`Red`, `Yellow`, `Green`, `Blue`, `Orange`, `White`).
  - **Batería / Fuente de alimentación:** `Count` (`1`–`4` celdas), `Voltage` (`V`) y límite de `Current` (`A`).
  - **Multímetro:** `Mode` (`Amperage`, `Voltage`, `Resistance`).
  - **Cable (`Wire`):** `Color` (12 colores) y `Type` (`Normal`, `Hookup`, `Alligator`).

### 1.5 Matriz completa de atajos de teclado en Tinkercad Circuits

| Atajo | Acción en Tinkercad Circuits | Contexto |
|---|---|---|
| `R` | Rotar componente(s) seleccionado(s) en sentido horario (`+30°`) | Modo `EDIT` |
| `Shift + R` | Rotar componente(s) seleccionado(s) en sentido antihorario (`-30°`) | Modo `EDIT` |
| `Delete` / `Backspace` | Eliminar componente(s), cable(s) o nodo de quiebre seleccionado | Modo `EDIT` |
| `Ctrl + Z` / `Cmd + Z` | Deshacer (*Undo*) | Modo `EDIT` |
| `Ctrl + Y` / `Ctrl + Shift + Z` / `Cmd + Shift + Z` | Rehacer (*Redo*) | Modo `EDIT` |
| `Ctrl + C` / `Ctrl + V` / `Ctrl + D` | Copiar / Pegar / Duplicar selección | Modo `EDIT` |
| `N` | Crear nota adhesiva / anotación en el lienzo | Modo `EDIT` |
| `Shift + N` | Mostrar / ocultar todas las notas del lienzo | `EDIT` y `SIMULATING` |
| `F` | *Zoom to Fit* (encuadra la selección o todo el circuito en la ventana) | `EDIT` y `SIMULATING` |
| `+` / `-` (o `Ctrl +` / `Ctrl -`) | Acercar / alejar zoom incremental | `EDIT` y `SIMULATING` |
| `1` – `9`, `0` | Asignar color rápido al cable seleccionado o en trazado (Mapeo A) | Modo `EDIT` |
| `Shift + Click` | Agregar o quitar elementos de la selección múltiple | Modo `EDIT` |
| `Flechas` (`Arrow Keys`) | Desplazar (*nudge*) componente(s) seleccionado(s) en incrementos finos | Modo `EDIT` |
| `Esc` | Cancelar cableado en curso / deseleccionar / cerrar diálogo | `EDIT` y `SIMULATING` |

---

## Área 2: Recursos Gráficos y SVG de Placas y Componentes

### 2.1 Arquitectura SVG vectorial por capas con paso `0.1"` (`2.54 mm`)

Tinkercad Circuits representa todas las placas y componentes mediante gráficos **SVG 2D cenitales** (*top-down*, funcionalmente equivalentes a la vista de protoboard de Fritzing) sobre una métrica modular de **`0.1"` (`2.54 mm`)** entre centros de pines. Esta arquitectura garantiza:

1. **Nitidez infinita:** Cero pixelación en cualquier nivel de zoom.
2. **Hit-testing por elemento DOM:** Cada terminal eléctrico expone su propio objetivo SVG (`<circle>` o `<rect>`) con coordenadas precisas.
3. **Mutación reactiva de atributos:** Permite modificar dinámicamente el relleno/resplandor de LEDs, bandas de resistencias, ángulos de servomotores y segmentos de pantallas sin redibujar toda la escena.

### 2.2 Retroalimentación de pines, continuidad en protoboard y overlays dinámicos

- **Pin Hover (Cuadrado rojo + Tooltip):** Al pasar el cursor sobre cualquier terminal o al aproximar la punta de un cable, el pin se resalta con un **contorno cuadrado rojo con borde contrastado** y muestra un **tooltip flotante** con el nombre semántico del pin (ej. `Anode`, `Cathode`, `Terminal 1`, `Wiper`, `1a`, `1b`, `2a`, `2b`, `IO04`, `GND`).
- **Continuidad interna de Protoboard (Círculos verdes):** Los orificios del protoboard siguen la matriz `0.1"` dividida en tiras verticales de 5 orificios (`a–e` y `f–j` separadas por el canal central DIP) y rieles horizontales de alimentación (`+` rojo y `-` negro/azul). Al pasar el cursor o arrastrar un cable sobre cualquier orificio, **todos los orificios conectados al mismo bus interno se iluminan simultáneamente con anillos circulares verde brillante**, enseñando de forma visual la conectividad eléctrica real.
- **Overlays visuales durante la simulación:**
  - **LED / RGB LED / NeoPixel:** Halo radial SVG proporcional a la corriente/ciclo PWM (con atenuación suave o color mezclado RGB).
  - **Motores y Servos:** Brazo del servo rotando de `0°` a `180°`; eje/rueda del motor DC girando con insignia numérica de `RPM`.
  - **Displays:** Matrices LED 5×5, displays de 7 segmentos y LCDs 16×2 actualizan sus píxeles, segmentos o caracteres directamente sobre el SVG.
  - **Resistencias de 4 bandas:** Las 4 franjas de color (`band1`, `band2`, `multiplier`, `tolerance`) se recalculan conforme al código IEC 60062 cada vez que el usuario cambia la resistencia (`Ω`, `kΩ`, `MΩ`).

### 2.3 Especificaciones de Hardware: CRCibernética IdeaBoard e IdeaSense Explorer

Información verificada directamente en los archivos primarios de `CRCibernetica/circuitpython-ideaboard` (`lib/ideaboard.py`, `lib/ideasense.py`, `skills/ideaboard.md`, `skills/ideasense.md`, `wiki/1.-Overview.md`, `wiki/2.-Pinouts-and-Jumper-Settings.md`) y en el paquete gráfico oficial `ideaboard.svg` / `explorer.svg` extraído de `https://ideascratch.crcibernetica.com/` (`v4.37`):

#### A. CRCibernética IdeaBoard

| Característica | Especificación verificada |
|---|---|
| **Microcontrolador** | `ESP32-WROOM-32E`, doble núcleo 32 bits @ `240 MHz`, lógica `3.3 V`, `520 KB` SRAM, `8 MB` Flash, Wi-Fi `802.11 b/g/n`, Bluetooth V4.2 + BLE. |
| **USB y Alimentación** | Puerto `USB-C` con puente serial `CH340G` (no monta unidad de almacenamiento masivo USB); bornera `Vin` (`+5 V` a `+9 V DC`). |
| **Jumper `SELECT` (`Vin` / `+3.3v`)** | Cabezal de 3 pines que puentea `SELECT` con `Vin` (envía voltaje bruto `Vin` al riel verde `V+` y puentes H) o con `+3.3v` (envía `3.3 V` regulados a `V+` y motores). Sin jumper, motores y riel `V+` quedan sin energía; los pines azules `3.3v` siempre entregan `3.3 V`. |
| **Pines conectables totales** | **`56` pines conectables** en el mapa actual (`2` bornera `Vin` + `4` Motor `M1+/M1-/M2+/M2-` + `4` header I2C + `4` header UART + `21` header izquierdo `3×7` `GND/V+/IOxx` + `21` header derecho `3×7` `IOxx/3.3v/GND`), más botón `BOOT` (`IO0`) y `RESET`. |
| **Headers G-V-S (`0.1"`)** | Cada GPIO en los bloques `3×7` se empareja en fila con su propio `GND` y `V+` (o `3.3v`) para conectar servos y sensores de 3 hilos directamente. |
| **Periféricos integrados** | • Doble puente H **`L9110S`** (`800 mA`/canal): `motor_1` (`IO12`, `IO14`) y `motor_2` (`IO13`, `IO15`).<br>• LED RGB **`WS2812B`** (`board.NEOPIXEL` / `board.IO02`).<br>• Conector **`STEMMA QT / QWIIC`** I2C (`IO21` SDA, `IO22` SCL).<br>• Botón **`BOOT`** (`IO0`, activo `LOW`) y botón **`RESET`** (`EN`).<br>• Puerto serial UART `TX0` (`IO1`) / `RX0` (`IO3`). |
| **Mapa GPIO de usuario** | `IO4` (digital, PWM, analógico*, touch), `IO5` (digital, PWM, SPI CS), `IO18` (SPI CLK), `IO19` (SPI MISO), `IO21` (I2C SDA), `IO22` (I2C SCL), `IO23` (SPI MOSI), `IO25` (PWM, analógico*, **DAC1**), `IO26` (PWM, analógico*, **DAC2**), `IO27` (PWM, analógico*, touch), `IO32` (PWM, analógico, touch), `IO33` (PWM, analógico, touch), `IO34`/`IO35`/`IO36`/`IO39` (**solo entrada** + analógico ADC1, sin pull-up/down interno). *(`IO4`, `IO25`, `IO26`, `IO27` usan ADC2 y no leen analógico con Wi-Fi activo.)* |
| **Gráfico oficial (`ideaboard.svg`)** | `381,808` B, SVG 1.1, `viewBox="0 0 42.7 65.7"` (mm, relación `0.6499`, equivalente a `260 × 400.05 px` frente al esquema actual `260 × 430 px` de relación `0.6047`). Define **29 overlays** posicionados por porcentaje (`#sim-pixel`, `#sim-boot-hitbox`, `#sim-motor1-overlay`, `#sim-motor2-overlay`, 5 overlays Servo, 6 Analógicos y 14 Digitales) detallados en `src/hardware/ideascratchAssets.ts`. |

#### B. CRCibernética IdeaSense Explorer

Placa de expansión conectada por el bus I2C **`STEMMA QT / QWIIC`** (`IO21` SDA / `IO22` SCL) que integra **4 circuitos I2C** y **3 botones táctiles**:

| Subsistema / Chip | Dirección I2C | Especificación técnica y mapeo gráfico (`explorer.svg`) |
|---|---|---|
| **`HT16K33`** (Matriz LED 5×5 + Botones) | `0x70` | Matriz monocromática azul `5×5` mapeada en `MatrixWrapper` mediante `hw_x = user_y + 1, hw_y = user_x` para origen superior izquierdo `(0..4, 0..4)`. En `explorer.svg` (`261,152` B, `viewBox="0 0 82.224442 87.847351"`, relación `0.9360`), los 25 LEDs corresponden a los `<path>` pares consecutivos **`path34` hasta `path82`** (`path{34 + 2*(y*5 + x)}`), con relleno activo `#4488ff` (`stroke-width: 3.32`) e inactivo `#b3b3b3`. Botones **`A`** (`key_number=0`, bit `1<<2`), **`B`** (`1`, bit `1<<3`) y **`C`** (`2`, bit `1<<4`) consultados en registro `0x40` con retención de liberación de `0.15 s` y 3 hitboxes (`top: 86.80%`, `left: 26.42% / 44.34% / 61.07%`). |
| **`SHT30`** (Temperatura y Humedad) | `0x44` | Sensor ambiental de temperatura (`°C`, propiedad `idea.temp`) y humedad relativa (`%`, `idea.humid`). |
| **`LTR303`** (Luz ambiente) | `0x29` | Sensor óptico visible + IR de luz ambiente en cuentas crudas enteras (`idea.light`). |
| **`LSM6DS3TR-C`** (IMU 6 ejes) | `0x6A` | Acelerómetro de 3 ejes en `m/s²` (`idea.accel`) y giroscopio de 3 ejes en `rad/s` (`idea.gyro`). |

---

## Área 3: Sistema de Cableado Interactivo

### 3.1 Ciclo de vida del cable (`IDLE` → `DRAWING` → `COMMITTED`)

1. **Inicio (`IDLE` → `DRAWING`):** Al hacer clic sobre cualquier pin de placa/componente u orificio de protoboard (resaltado con cuadrado rojo y tooltip), se inicia un cable elástico (*rubber-band preview*) desde el centro del terminal origen hasta el cursor.
2. **Puntos de quiebre (*Waypoints*):** Hacer clic sobre espacio vacío del lienzo **fija un vértice intermedio** (*bend point*) y continúa el trazado desde ese punto, permitiendo enrutado ortogonal limpio alrededor de placas y componentes.
3. **Guías ortogonales y de `45°`:** Durante el trazado y al arrastrar vértices, el sistema proyecta guías de alineación cuando el segmento se alinea horizontalmente (`0°`), verticalmente (`90°`) o a `45°` respecto al vértice anterior o pin destino.
4. **Imán de pines (*Magnetic Pin Snap*) y cierre (`COMMITTED`):** Al acercar el cursor a un pin válido o hueco de protoboard, el extremo se acopla magnéticamente al centro del pin y activa su cuadrado rojo + tooltip (y anillos verdes si es protoboard). Un clic confirma y guarda el cable con sus `waypoints`.
5. **Cancelación:** Pulsar **`Esc`** (o `Delete`/`Backspace` antes de finalizar) cancela el cable en progreso limpiamente y retorna a `IDLE` sin dejar fragmentos.

### 3.2 Edición posterior a la colocación (*Post-Placement Editing*)

- **Selección y tiradores de quiebre:** Al hacer clic sobre un cable existente, se resalta su trazo y se muestran **tiradores circulares blancos** (*bend handles*) en cada vértice intermedio.
- **Inserción de nuevos quiebres:** Hacer **doble clic** en cualquier punto de un segmento del cable inserta un nuevo vértice blanco en esa posición exacta (también es posible arrastrar un segmento según el modo).
- **Reubicación y borrado:** Arrastrar cualquier tirador circular blanco mueve esa esquina con guías de alineación ortogonal; seleccionar el cable y pulsar `Delete` / `Backspace` (o el ícono de papelera) lo elimina por completo.

### 3.3 Paleta de 12 colores, atajos `1–9, 0` (Mapeo A vs. B) y 3 tipos de cable

Tinkercad Circuits ofrece **12 colores** y **3 estilos visuales de cable** (idénticos eléctricamente en la simulación):

1. **Tipos de cable (`WireType`):**
   - **`Normal`** (por defecto): línea limpia y delgada con vértices definidos o redondeo sutil.
   - **`Hookup`**: cable puente más grueso y flexible para protoboard, con terminaciones metálicas peladas en los extremos.
   - **`Alligator`**: cable aislado grueso terminado en pinzas caimán (*alligator clips*) orientadas en ambos extremos.

2. **Paleta de 12 colores y nota de desambiguación de atajos (`0–9`):**
   En la documentación y tutoriales de Tinkercad coexisten dos asignaciones numéricas para los primeros 10 colores:
   - **Mapeo A (indexado desde `1`, estándar adoptado para IdeaBoard Studio):** `1`=Negro (`Black`), `2`=Rojo (`Red`), `3`=Naranja (`Orange`), `4`=Amarillo (`Yellow`), `5`=Verde (`Green`), `6`=Turquesa (`Turquoise`), `7`=Azul (`Blue`), `8`=Morado (`Purple`), `9`=Rosa (`Pink`), `0`=Café (`Brown`); Gris (`Grey`) y Blanco (`White`) mediante el desplegable del Inspector o barra.
   - **Mapeo B (indexado desde `0` en algunas listas heredadas):** `0`=Negro, `1`=Rojo, `2`=Naranja, ..., `9`=Café.
   - *Decisión de investigación:* Se adopta explícitamente el **Mapeo A (`1`–`9`, `0`)** por corresponder a la mayoría de currículos de Tinkercad Circuits en inglés y al orden visual superior-izquierdo del selector de colores, documentando la existencia del Mapeo B como salvedad explícita.

---

## Área 4: Comportamiento del Lienzo (Zoom, Pan, Rejilla y Selección)

### 4.1 Lienzo 2D infinito, Zoom centrado en cursor y *Zoom-to-Fit*

- El área de trabajo es un lienzo SVG 2D infinito gobernado por una transformación afín `translate(pan.x, pan.y) scale(zoom)` con origen `0 0`.
- **Zoom con rueda del ratón:** Escala manteniendo fijo el punto del mundo bajo el cursor (`worldPos` invariante antes y después del cambio de `zoom`).
- **Atajo `F` (*Zoom to Fit*):** Calcula la caja delimitadora (*bounding box*) de los objetos seleccionados —o de todo el circuito si no hay selección— con margen uniforme y ajusta `zoom` y `pan` para encuadrar el conjunto.
- **Atajos `+` / `-`:** Aplican pasos incrementales de zoom centrados en el viewport.

### 4.2 Desambiguación explícita: *Pan* vs. *Marquee Selection*

En tutoriales de Tinkercad Circuits aparece una ambigüedad conocida: algunas guías describen arrastrar con clic izquierdo en espacio vacío para hacer *pan*, mientras otras describen arrastre con clic izquierdo para selección rectangular (*marquee*), reservando clic central/derecho para *pan* (como en CAD 2D). Para garantizar usabilidad predecible sin conflictos en IdeaBoard Studio se especifica:

- **Selección múltiple por rectángulo (*Marquee*):** `Left-Drag` sobre espacio vacío dibuja un rectángulo de selección que captura componentes y cables contenidos/intersectados.
- **Desplazamiento del lienzo (*Pan*):** `Middle-Drag`, `Right-Drag` (suprimiendo menú contextual) o `Space + Left-Drag`.
- **Selección incremental:** `Shift + Click` agrega o quita componentes y cables de la selección múltiple.

### 4.3 Rejilla `0.1"`, ajuste (*Snap*), rotación `30°`, orden Z e historial

- **Rejilla y ajuste:** Paso base modular de **`0.1"` (`2.54 mm`)** —en IdeaBoard Studio **`14 px`** de paso mundial verificado en los cabezales de `src/hardware/ideaboardSpec.ts`— con patrón de puntos en coordenadas de mundo (que escala y se desplaza junto con el circuito), guías de alineación ortogonal al arrastrar y desplazamiento fino mediante **teclas de flecha** (`Arrow Keys`).
- **Rotación de `30°`:** `R` (`+30°`) y `Shift + R` (`-30°`) rotan cada componente seleccionado alrededor de su centro, recalculando las coordenadas mundiales de todos sus pines para mantener los cables acoplados con exactitud en los 12 ángulos posibles.
- **Orden Z determinístico en 5 capas (`L0`–`L4`):**
  - `L0`: Rejilla mundial `0.1"` y guías de alineación ortogonal.
  - `L1`: Placas base y protoboards (`IdeaBoard`, `IdeaSense Explorer`, `Breadboard`).
  - `L2`: Componentes externos colocados.
  - `L3`: Cables confirmados (`Normal`, `Hookup`, `Alligator`).
  - `L4`: Capas activas (previsualización de cable, tiradores blancos de quiebre, rectángulo de selección, notas `[N]`, cuadrados rojos de pin, anillos verdes de protoboard, insignias de falla `!` y controles en vivo de simulación).
- **Historial (*Command Pattern*):** Pila Undo/Redo (`Ctrl+Z` / `Ctrl+Y` / `Ctrl+Shift+Z`) y portapapeles (`Ctrl+C` / `Ctrl+V` / `Ctrl+D`) cubriendo inserción, borrado, movimiento, rotación, cableado, edición de quiebres y cambios de propiedades en el Inspector.

---

## Área 5: Configuración de Controles y Simulación

### 5.1 Ciclo de ejecución y bloqueo estricto `EDIT` ↔ `SIMULATING`

1. **Estado activo:** Al pulsar **`Start Simulation`**, el botón cambia a **verde brillante** con texto **`Stop Simulation`** y arranca el reloj **`Simulator time: HH:MM:SS`**.
2. **Bloqueo de edición (*Edit-Lock*):** Mientras el estado es `SIMULATING`, **se bloquean todas las modificaciones estructurales del circuito y del código**: no se pueden agregar, mover, rotar ni eliminar componentes, no se pueden crear, editar ni recolorar cables, ni editar el código en Monaco/Blockly hasta detener la simulación (`Stop Simulation`, que reinicia el estado eléctrico y desbloquea la edición).
3. **Interacciones permitidas en `SIMULATING`:**
   - Navegación del lienzo (`Pan`, `Zoom`, `F`).
   - Inspección de tooltips de pines y visualización de notas (`Shift+N`).
   - Envío de texto en `Serial Monitor` (`TX`) y uso del `Debugger`.
   - Manipulación directa de todos los controles e insumos interactivos en vivo sobre el lienzo.

### 5.2 Controles interactivos en vivo y paridad con IdeaScratch

- **Entradas mecánicas:** Los pulsadores se cierran mientras se mantiene presionado el botón del ratón; los interruptores deslizantes (`Slide Switch`) y DIP conmutan su posición al hacer clic; el botón **`BOOT` (`IO0`)** de IdeaBoard y los botones **`A`/`B`/`C`** de IdeaSense Explorer responden en tiempo real.
- **Controles analógicos y ambientales en lienzo:**
  - **Potenciómetro:** Arrastrar directamente la perilla rotatoria (`-135°` a `+135°`) varía el voltaje analógico en vivo.
  - **Sensor Ultrasónico `HC-SR04`:** Al hacer clic en simulación muestra un cono de detección y un **punto objetivo verde arrastrable** (`2–400 cm`) que actualiza `distance` / `dist_cm()` en tiempo real.
  - **`TMP36` y Fotorresistencia (`LDR`):** Popover/deslizador lineal directo sobre el lienzo para temperatura (`-40 °C` a `125 °C`) y nivel de iluminación.
  - **Paridad con IdeaScratch (`3.-IdeaScratch-Getting-Started.md`):** IdeaScratch define controles equivalentes para NeoPixel, `motor_1`/`motor_2` (barra verde/roja), barra angular de Servo, pines digitales interactivos, deslizadores ADC (`0–65535`), sensores IR, ultrasónico (`0–400 cm`), acelerómetro/giroscopio 6 ejes X/Y/Z, botones A/B/C, temperatura/humedad/luz de Explorer y matriz LED `5×5`.

### 5.3 Diagnóstico de fallas eléctricas, `Serial Monitor TX` y `Serial Plotter`

- **Alertas de falla y daño en componentes:** Cuando la simulación detecta sobrecorriente (ej. LED alimentado a `> 20 mA` sin resistencia limitadora), sobrevoltaje (`> 3.6 V` en GPIO ESP32), polaridad invertida o cortocircuito (`V+`/`3.3v` conectado a `GND`), se renderiza un **ícono circular rojo con signo de exclamación (`!`)** y/o un **overlay de componente quemado/destello** sobre el componente afectado, con tooltip detallando la corriente calculada frente al límite recomendado.
- **Monitor Serial y Graficador (*Plotter*):** El panel serial recibe flujo continuo `stdout`, permite enviar líneas desde la barra `TX + Send` (`sys.stdin` / `supervisor.runtime.serial_bytes_available`) y ofrece un modo **`Serial Plotter`** que grafica automáticamente valores numéricos separados por espacios/comas en tiempo real.

---

## Fuentes y Salvedades de Investigación

1. **Documentación oficial y repositorios primarios CRCibernética:**
   - [`CRCibernetica/circuitpython-ideaboard`](https://github.com/CRCibernetica/circuitpython-ideaboard): `lib/ideaboard.py`, `lib/ideasense.py`, `skills/ideaboard.md`, `skills/ideasense.md`, `wiki/1.-Overview.md`, `wiki/2.-Pinouts-and-Jumper-Settings.md`, `wiki/3.-IdeaScratch-Getting-Started.md`.
   - Sitio oficial **IdeaScratch `v4.37`** (`https://ideascratch.crcibernetica.com/`): `ideaboard.svg`, `explorer.svg`, `examples/manifest.json`, 30 archivos `.iss` y `js/generators.js` / `js/simulator.js` verificados en [`PROVENANCE.json`](../public/assets/ideascratch/PROVENANCE.json).
2. **Referencias técnicas de Autodesk Tinkercad Circuits:**
   - Guías de Autodesk Tinkercad Help Center, DigiKey TechForum, Instructables (*Getting Started with Tinkercad Circuits*), Digital Maestro Magazine y currículos universitarios (CUNY) contrastados para las 5 áreas.
3. **Salvedades documentadas:**
   - Las páginas SPA de `tinkercad.com` cargan su contenido por cliente Angular/Webpack, por lo que los detalles de Tinkercad fueron triangulados entre documentación técnica indexada y guías prácticas verificadas.
   - Existe divergencia documental menor entre el **Mapeo A (`1`–`9`, `0`)** y el **Mapeo B (`0`–`9`)** para los atajos de color de cable, y entre arrastre izquierdo como *Pan* vs. *Marquee*; ambas quedan resueltas explícitamente para IdeaBoard Studio en las Secciones 3.3 y 4.2.

---

## Método de Verificación

1. **Verificación de hardware IdeaBoard e IdeaSense:** Cotejar los pines (`56` conectables + `BOOT` `IO0`), puentes H (`IO12–15`), NeoPixel (`IO02`), jumper `SELECT` y direcciones I2C (`0x70`, `0x44`, `0x29`, `0x6A`) contra [`src/hardware/ideaboardSpec.ts`](../src/hardware/ideaboardSpec.ts) y [`src/hardware/ideascratchAssets.ts`](../src/hardware/ideascratchAssets.ts).
2. **Verificación de métricas SVG:** Comprobar que `ideaboard.svg` (`viewBox="0 0 42.7 65.7"`, 29 overlays) y `explorer.svg` (`viewBox="0 0 82.224442 87.847351"`, `path34`–`path82`, botones A/B/C) coincidan exactamente con [`PROVENANCE.json`](../public/assets/ideascratch/PROVENANCE.json).
3. **Condición de invalidación:** Cualquier discrepancia en direcciones I2C, conteo de pines (`56`), ausencia del aviso sobre falta de `Mirror` en Tinkercad Circuits o divergencia con `IDEASCRATCH_ASSETS_AND_EXAMPLES.md` invalida la sección correspondiente.
