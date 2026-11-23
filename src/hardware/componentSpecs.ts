import { ComponentSpec, ComponentType } from '../types/simulator';

export const COMPONENT_SPECS: Record<ComponentType, ComponentSpec> = {
  led: {
    type: 'led',
    name: 'LED 5mm',
    shortDesc: 'Diodo emisor de luz (Ánodo a IOxx, Cátodo a GND)',
    width: 68,
    height: 92,
    pins: [
      { id: 'anode', label: 'A (+)', role: 'signal', x: 24, y: 82 },
      { id: 'cathode', label: 'K (-)', role: 'gnd', x: 44, y: 82 },
    ],
    defaultProps: { color: '#ef4444' },
  },
  button: {
    type: 'button',
    name: 'Pulsador',
    shortDesc: 'Botón táctil (conecta a IOxx y GND)',
    width: 78,
    height: 78,
    pins: [
      { id: 'sig', label: 'SIG', role: 'signal', x: 24, y: 68 },
      { id: 'gnd', label: 'GND', role: 'gnd', x: 54, y: 68 },
    ],
    defaultProps: { pressed: false },
  },
  potentiometer: {
    type: 'potentiometer',
    name: 'Potenciómetro',
    shortDesc: 'Perilla analógica 0–3.3V (3.3v, IOxx, GND)',
    width: 88,
    height: 98,
    pins: [
      { id: 'vcc', label: 'VCC', role: 'power', x: 22, y: 88 },
      { id: 'sig', label: 'SIG', role: 'signal', x: 44, y: 88 },
      { id: 'gnd', label: 'GND', role: 'gnd', x: 66, y: 88 },
    ],
    defaultProps: { value: 0.5 },
  },
  servo: {
    type: 'servo',
    name: 'Servomotor SG90',
    shortDesc: 'Servo 0°–180° (conecta SIG a IO04–IO26, V+ y GND)',
    width: 112,
    height: 112,
    pins: [
      { id: 'gnd', label: 'GND', role: 'gnd', x: 34, y: 102 },
      { id: 'vcc', label: 'V+', role: 'power', x: 56, y: 102 },
      { id: 'sig', label: 'SIG', role: 'signal', x: 78, y: 102 },
    ],
    defaultProps: {},
  },
  'dc-motor': {
    type: 'dc-motor',
    name: 'Motor DC + Rueda',
    shortDesc: 'Motor reductor amarillo (conecta a MOTOR1 o MOTOR2)',
    width: 120,
    height: 98,
    pins: [
      { id: 'pos', label: '+', role: 'motor-a', x: 44, y: 88 },
      { id: 'neg', label: '-', role: 'motor-b', x: 76, y: 88 },
    ],
    defaultProps: { wheelAngle: 0 },
  },
  ultrasonic: {
    type: 'ultrasonic',
    name: 'Sensor Ultrasónico',
    shortDesc: 'HC-SR04 con objeto de distancia arrastrable',
    width: 136,
    height: 108,
    pins: [
      { id: 'vcc', label: 'VCC', role: 'power', x: 32, y: 98 },
      { id: 'trig', label: 'TRIG', role: 'trig', x: 56, y: 98 },
      { id: 'echo', label: 'ECHO', role: 'echo', x: 80, y: 98 },
      { id: 'gnd', label: 'GND', role: 'gnd', x: 104, y: 98 },
    ],
    defaultProps: { distanceCm: 25 },
  },
  buzzer: {
    type: 'buzzer',
    name: 'Buzzer Piezo',
    shortDesc: 'Zumbador con audio real en el navegador',
    width: 78,
    height: 84,
    pins: [
      { id: 'pos', label: '+', role: 'signal', x: 26, y: 74 },
      { id: 'neg', label: '-', role: 'gnd', x: 52, y: 74 },
    ],
    defaultProps: {},
  },
};

export const WIRE_COLORS = [
  { name: 'Rojo', hex: '#ef4444' },
  { name: 'Negro', hex: '#334155' },
  { name: 'Amarillo', hex: '#eab308' },
  { name: 'Verde', hex: '#22c55e' },
  { name: 'Azul', hex: '#3b82f6' },
  { name: 'Naranja', hex: '#f97316' },
  { name: 'Morado', hex: '#a855f7' },
];
