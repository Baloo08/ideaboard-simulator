import { BoardPinDef } from '../types/simulator';

export const BOARD_WIDTH = 260;
export const BOARD_HEIGHT = 430;

// Left 3x7 header columns: GND (x=26), V+ (x=40), IOxx (x=54)
const LEFT_ROWS: Array<{ id: string; gpio: number; y: number; desc: string }> = [
  { id: 'IO04', gpio: 4, y: 294, desc: 'GPIO 4 — Digital I/O, PWM, Servo, Touch' },
  { id: 'IO05', gpio: 5, y: 308, desc: 'GPIO 5 — Digital I/O, PWM, Servo' },
  { id: 'IO18', gpio: 18, y: 322, desc: 'GPIO 18 — Digital I/O, PWM, Servo, SPI SCK' },
  { id: 'IO19', gpio: 19, y: 336, desc: 'GPIO 19 — Digital I/O, PWM, Servo, SPI MISO' },
  { id: 'IO23', gpio: 23, y: 350, desc: 'GPIO 23 — Digital I/O, PWM, Servo, SPI MOSI' },
  { id: 'IO25', gpio: 25, y: 364, desc: 'GPIO 25 — Digital I/O, PWM, Servo, DAC1' },
  { id: 'IO26', gpio: 26, y: 378, desc: 'GPIO 26 — Digital I/O, PWM, Servo, DAC2' },
];

// Right 3x7 header columns: IOxx (x=206), 3.3v (x=220), GND (x=234)
const RIGHT_ROWS: Array<{
  id: string;
  boardName: string;
  gpio: number;
  y: number;
  inputOnly?: boolean;
  desc: string;
}> = [
  { id: 'IO27', boardName: 'IO27', gpio: 27, y: 294, desc: 'GPIO 27 — Digital I/O, PWM, ADC2' },
  { id: 'IO33', boardName: 'IO33', gpio: 33, y: 308, desc: 'GPIO 33 — Digital I/O, PWM, ADC1' },
  { id: 'IO32', boardName: 'IO32', gpio: 32, y: 322, desc: 'GPIO 32 — Digital I/O, PWM, ADC1' },
  { id: 'IO35', boardName: 'IO35', gpio: 35, y: 336, inputOnly: true, desc: 'GPIO 35 — Solo Entrada (DigitalIn / AnalogIn ADC1)' },
  { id: 'IO34', boardName: 'IO34', gpio: 34, y: 350, inputOnly: true, desc: 'GPIO 34 — Solo Entrada (DigitalIn / AnalogIn ADC1)' },
  { id: 'IO39', boardName: 'IO39', gpio: 39, y: 364, inputOnly: true, desc: 'VN / GPIO 39 — Solo Entrada (DigitalIn / AnalogIn ADC1)' },
  { id: 'IO36', boardName: 'IO36', gpio: 36, y: 378, inputOnly: true, desc: 'VP / GPIO 36 — Solo Entrada (DigitalIn / AnalogIn ADC1)' },
];

export const IDEABOARD_PINS: BoardPinDef[] = [
  // Vin Screw Terminal
  { id: 'VIN_POS', label: 'Vin +', kind: 'power-vplus', x: 63, y: 21, description: 'Entrada de alimentación externa (+5V a +9V DC)' },
  { id: 'VIN_GND', label: 'Vin -', kind: 'gnd', x: 79, y: 21, description: 'Tierra de alimentación externa (GND)' },

  // Motor Terminals
  { id: 'MOTOR2_A', label: 'M2+', kind: 'motor', x: 26, y: 152, description: 'Terminal + Motor 2 (Puente H IO13/IO15)' },
  { id: 'MOTOR2_B', label: 'M2-', kind: 'motor', x: 26, y: 168, description: 'Terminal - Motor 2 (Puente H IO13/IO15)' },
  { id: 'MOTOR1_A', label: 'M1+', kind: 'motor', x: 234, y: 152, description: 'Terminal + Motor 1 (Puente H IO12/IO14)' },
  { id: 'MOTOR1_B', label: 'M1-', kind: 'motor', x: 234, y: 168, description: 'Terminal - Motor 1 (Puente H IO12/IO14)' },

  // Left I2C Header (GND, 3.3v, SCL IO22, SDA IO21)
  { id: 'I2C_GND', label: 'GND', kind: 'gnd', x: 24, y: 264, description: 'Tierra común (GND)' },
  { id: 'I2C_3V3', label: '3.3v', kind: 'power-3v3', x: 38, y: 264, description: 'Salida regulada 3.3V' },
  { id: 'IO22', label: 'SCL (IO22)', boardName: 'IO22', gpio: 22, kind: 'i2c', x: 52, y: 264, description: 'GPIO 22 — I2C SCL / Digital I/O' },
  { id: 'IO21', label: 'SDA (IO21)', boardName: 'IO21', gpio: 21, kind: 'i2c', x: 66, y: 264, description: 'GPIO 21 — I2C SDA / Digital I/O' },

  // Right UART Header (TX0, RX0, +3.3v, GND)
  { id: 'TX0', label: 'TX0', boardName: 'TX', gpio: 1, kind: 'uart', x: 194, y: 264, description: 'UART0 TX (GPIO 1)' },
  { id: 'RX0', label: 'RX0', boardName: 'RX', gpio: 3, kind: 'uart', x: 208, y: 264, description: 'UART0 RX (GPIO 3)' },
  { id: 'UART_3V3', label: '3.3v', kind: 'power-3v3', x: 222, y: 264, description: 'Salida regulada 3.3V' },
  { id: 'UART_GND', label: 'GND', kind: 'gnd', x: 236, y: 264, description: 'Tierra común (GND)' },

  // Left 3x7 Header: GND, V+, IOxx
  ...LEFT_ROWS.flatMap((row): BoardPinDef[] => [
    {
      id: `L_GND_${row.id}`,
      label: 'GND',
      kind: 'gnd',
      x: 26,
      y: row.y,
      description: `Tierra común (GND) — Fila ${row.id}`,
    },
    {
      id: `L_VP_${row.id}`,
      label: 'V+',
      kind: 'power-vplus',
      x: 40,
      y: row.y,
      description: `Alimentación V+ (depende del jumper SELECT: Vin o +3.3v) — Fila ${row.id}`,
    },
    {
      id: row.id,
      label: row.id,
      boardName: row.id,
      gpio: row.gpio,
      kind: 'gpio',
      x: 54,
      y: row.y,
      description: row.desc,
    },
  ]),

  // Right 3x7 Header: IOxx, 3.3v, GND
  ...RIGHT_ROWS.flatMap((row): BoardPinDef[] => [
    {
      id: row.id,
      label: row.id === 'IO39' ? 'VN/39' : row.id === 'IO36' ? 'VN/36' : row.id,
      boardName: row.boardName,
      gpio: row.gpio,
      kind: row.inputOnly ? 'input-only' : 'gpio',
      x: 206,
      y: row.y,
      description: row.desc,
    },
    {
      id: `R_3V3_${row.id}`,
      label: '3.3v',
      kind: 'power-3v3',
      x: 220,
      y: row.y,
      description: `Salida regulada 3.3V — Fila ${row.id}`,
    },
    {
      id: `R_GND_${row.id}`,
      label: 'GND',
      kind: 'gnd',
      x: 234,
      y: row.y,
      description: `Tierra común (GND) — Fila ${row.id}`,
    },
  ]),
];

export const BOARD_PIN_MAP: Record<string, BoardPinDef> = Object.fromEntries(
  IDEABOARD_PINS.map((pin) => [pin.id, pin])
);

export const INPUT_ONLY_PINS = new Set(['IO34', 'IO35', 'IO36', 'IO39']);
export const POWER_VPLUS_PINS = new Set(
  IDEABOARD_PINS.filter((p) => p.kind === 'power-vplus').map((p) => p.id)
);
export const POWER_3V3_PINS = new Set(
  IDEABOARD_PINS.filter((p) => p.kind === 'power-3v3').map((p) => p.id)
);
export const GND_PINS = new Set(
  IDEABOARD_PINS.filter((p) => p.kind === 'gnd').map((p) => p.id)
);
