export type PinKind = 'gpio' | 'input-only' | 'power-vplus' | 'power-3v3' | 'gnd' | 'motor' | 'i2c' | 'uart';

export interface BoardPinDef {
  id: string;
  label: string;
  /** CircuitPython `board.<name>` identifier if applicable */
  boardName?: string;
  /** GPIO number if applicable */
  gpio?: number;
  kind: PinKind;
  x: number;
  y: number;
  description: string;
}

export type ComponentType =
  | 'led'
  | 'button'
  | 'potentiometer'
  | 'servo'
  | 'dc-motor'
  | 'ultrasonic'
  | 'buzzer';

export interface ComponentPinDef {
  id: string;
  label: string;
  role: 'signal' | 'power' | 'gnd' | 'motor-a' | 'motor-b' | 'trig' | 'echo';
  /** Relative position inside component SVG */
  x: number;
  y: number;
}

export interface ComponentSpec {
  type: ComponentType;
  name: string;
  shortDesc: string;
  width: number;
  height: number;
  pins: ComponentPinDef[];
  defaultProps?: Record<string, string | number | boolean>;
}

export interface PlacedComponent {
  id: string;
  type: ComponentType;
  label: string;
  x: number;
  y: number;
  /** Interactive runtime / config properties (e.g. color, pressed, knobValue, distanceCm) */
  props: Record<string, string | number | boolean>;
}

export interface Wire {
  id: string;
  from: { nodeId: string; pinId: string }; // nodeId is 'board' or component id
  to: { nodeId: string; pinId: string };
  color: string;
}

export type PowerSelectMode = 'Vin' | '3.3v';

export interface PinRuntimeState {
  mode: 'UNUSED' | 'DIGITAL_OUT' | 'DIGITAL_IN' | 'ANALOG_IN' | 'PWM' | 'SERVO' | 'MOTOR';
  digitalValue: boolean; // true = HIGH (3.3V)
  pwmDuty: number; // 0..1
  analogValue: number; // 0..65535
  servoAngle: number | null; // 0..180
  frequency?: number;
}

export interface BoardRuntimeState {
  powered: boolean;
  powerSelect: PowerSelectMode;
  neopixel: [number, number, number];
  neopixelBrightness: number;
  motor1Throttle: number; // -1..1
  motor2Throttle: number; // -1..1
  pins: Record<string, PinRuntimeState>;
}

export interface ComponentDiagnostic {
  status: 'ok' | 'warning' | 'idle';
  message: string;
  boundGpios: Record<string, string>; // role -> board pinId (e.g. signal -> 'IO04')
}

export interface ConsoleEntry {
  id: string;
  timestamp: string;
  level: 'stdout' | 'stderr' | 'system';
  text: string;
}

export type SimulationStatus = 'idle' | 'loading-python' | 'running' | 'error';

export interface StarterTemplate {
  id: string;
  title: string;
  description: string;
  powerSelect: PowerSelectMode;
  components: PlacedComponent[];
  wires: Wire[];
  code: string;
}
