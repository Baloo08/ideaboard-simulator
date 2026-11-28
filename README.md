# IdeaBoard Studio — Simulador Web tipo Tinkercad para CRCibernética IdeaBoard

Simulador interactivo en el navegador para la tarjeta **CRCibernética IdeaBoard (ESP32 + CircuitPython)**. Diseñado para compilarse y publicarse 100% en la nube con **GitHub Actions + GitHub Pages** sin consumir recursos en tu computadora.

## Características incluidas (MVP)
- **Placa IdeaBoard en SVG vectorial de alta fidelidad:** Pines `IO04–IO26` (`V+`/`GND`), `IO27–VN/36` (`3.3v`/`GND`), `MOTOR1` (`IO12/IO14`), `MOTOR2` (`IO13/IO15`), `WS2812B` (`IO02`), `Qwiic` / I2C (`IO21/IO22`), `UART` (`TX0/RX0`) y selector interactivo `Vin / +3.3v`.
- **Ejecución real de CircuitPython en el navegador:** Usa Pyodide (WebAssembly) dentro de un Web Worker con soporte para `from ideaboard import IdeaBoard`, `board`, `digitalio`, `analogio`, `pwmio`, `neopixel`, `adafruit_motor` y `adafruit_hcsr04`.
- **Componentes interactivos con cableado Bézier y validación eléctrica (Netlist):**
  - LED 5mm (con selector de color)
  - Pulsador táctil
  - Potenciómetro rotativo (`0–3.3V`)
  - Servomotor SG90 (`0°–180°`)
  - Motor DC + rueda animada (`MOTOR1` / `MOTOR2`)
  - Sensor ultrasónico HC-SR04 (con deslizador de distancia en vivo)
  - Buzzer piezoeléctrico (con audio real por Web Audio API)
- **Editor Monaco + Consola Serial + Inspector de Pines + 4 ejemplos listos.**

## Recursos Oficiales de IdeaScratch (`v4.37`) Integrados
El repositorio incluye los gráficos oficiales y ejemplos extraídos de [`ideascratch.crcibernetica.com`](https://ideascratch.crcibernetica.com/) en [`public/assets/ideascratch/`](./public/assets/ideascratch/) y catalogados en [`src/hardware/ideascratchAssets.ts`](./src/hardware/ideascratchAssets.ts):
- **Placas SVG oficiales:** `ideaboard.svg` (IdeaBoard con 29 métricas de overlays) y `explorer.svg` (IdeaSense Explorer con matriz LED 5×5 `path34`–`path82` y botones A/B/C), además de `favicon.png` y logotipos institucionales.
- **Ejemplos oficiales (`.iss`):** [`examples/manifest.json`](./public/assets/ideascratch/examples/manifest.json) y los **30 proyectos `.iss` oficiales** (Basics, Sumobot, SumoBot v2, IdeaSense Explorer, IoT y Dashboard).
- **Procedencia verificada:** [`PROVENANCE.json`](./public/assets/ideascratch/PROVENANCE.json) con URL original, formato, dimensiones, tamaño en bytes y SHA-256.

## Documentación Técnica y Plan de Replicación Tinkercad Circuits
| Documento | Contenido |
|---|---|
| [`docs/IDEASCRATCH_ASSETS_AND_EXAMPLES.md`](./docs/IDEASCRATCH_ASSETS_AND_EXAMPLES.md) | Procedencia, verificación de espacio en disco `C:`, métricas de SVGs/overlays e inventario de los 30 ejemplos `.iss` + brechas CircuitPython. |
| [`docs/TINKERCAD_CIRCUITS_RESEARCH.md`](./docs/TINKERCAD_CIRCUITS_RESEARCH.md) | Investigación integral en 5 áreas de Tinkercad Circuits (UI, SVGs/pines, cableado, lienzo, simulación) y especificaciones de IdeaBoard e IdeaSense Explorer. |
| [`docs/REPLICATION_PLAN.md`](./docs/REPLICATION_PLAN.md) | Plan técnico accionable mapeado al estado actual del repositorio (`[EXISTING]` vs `[PLANNED - Phase 1..6]`), inventario gráfico/configuración, arquitectura y matriz de trazabilidad. |

## Publicar en GitHub Pages (sin compilar en tu PC)
1. Crea un repositorio vacío en GitHub (por ejemplo `ideaboard-simulator`).
2. En GitHub, ve a **Settings → Pages → Source** y selecciona **GitHub Actions**.
3. Sube este proyecto a la rama `main`:
   ```bash
   git init -b main
   git add .
   git commit -m "Initial IdeaBoard Studio simulator"
   git remote add origin https://github.com/Baloo08/ideaboard-simulator.git
   git push -u origin main
   ```
4. GitHub Actions ejecutará el workflow `.github/workflows/deploy.yml`, instalará dependencias, compilará la app y la publicará automáticamente en tu URL de GitHub Pages.
