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
