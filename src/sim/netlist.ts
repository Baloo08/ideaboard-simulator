import {
  BOARD_PIN_MAP,
  GND_PINS,
  INPUT_ONLY_PINS,
  POWER_3V3_PINS,
  POWER_VPLUS_PINS,
} from '../hardware/ideaboardSpec';
import {
  BoardRuntimeState,
  ComponentDiagnostic,
  PlacedComponent,
  Wire,
} from '../types/simulator';

export interface NetlistResult {
  diagnostics: Record<string, ComponentDiagnostic>;
  /** Computed live inputs per board pin id to feed into the Python worker */
  pinInputs: Record<string, { digital?: boolean; analog?: number }>;
  /** Computed live ultrasonic distance by `${trigPin}:${echoPin}` and fallback */
  ultrasonicDistances: Record<string, number>;
  /** Effective motor throttles per component id */
  motorOutputs: Record<string, number>;
  /** Effective servo angles per component id */
  servoOutputs: Record<string, number | null>;
  /** Effective LED brightness (0..1) per component id */
  ledOutputs: Record<string, number>;
  /** Effective buzzer frequency (Hz, 0 = off) per component id */
  buzzerOutputs: Record<string, number>;
}

const keyOf = (nodeId: string, pinId: string) => `${nodeId}:${pinId}`;

export function evaluateCircuit(
  components: PlacedComponent[],
  wires: Wire[],
  runtime: BoardRuntimeState
): NetlistResult {
  // Build Union-Find over all wire endpoints + shared IdeaBoard internal power/GND planes
  const parent = new Map<string, string>();

  const find = (x: string): string => {
    if (!parent.has(x)) parent.set(x, x);
    let root = x;
    while (parent.get(root) !== root) {
      root = parent.get(root)!;
    }
    let cur = x;
    while (cur !== root) {
      const next = parent.get(cur)!;
      parent.set(cur, root);
      cur = next;
    }
    return root;
  };

  const union = (a: string, b: string) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  };

  // Internal IdeaBoard rails
  const gndList = Array.from(GND_PINS);
  for (let i = 1; i < gndList.length; i++) {
    union(keyOf('board', gndList[0]), keyOf('board', gndList[i]));
  }
  const v33List = Array.from(POWER_3V3_PINS);
  for (let i = 1; i < v33List.length; i++) {
    union(keyOf('board', v33List[0]), keyOf('board', v33List[i]));
  }
  const vplusList = Array.from(POWER_VPLUS_PINS);
  for (let i = 1; i < vplusList.length; i++) {
    union(keyOf('board', vplusList[0]), keyOf('board', vplusList[i]));
  }

  for (const wire of wires) {
    union(keyOf(wire.from.nodeId, wire.from.pinId), keyOf(wire.to.nodeId, wire.to.pinId));
  }

  const gndRoot = gndList.length > 0 ? find(keyOf('board', gndList[0])) : '';
  const v33Root = v33List.length > 0 ? find(keyOf('board', v33List[0])) : '';
  const vplusRoot = vplusList.length > 0 ? find(keyOf('board', vplusList[0])) : '';

  // Map every net root to the board pins connected to it
  const netBoardPins = new Map<string, string[]>();
  for (const pinId of Object.keys(BOARD_PIN_MAP)) {
    const r = find(keyOf('board', pinId));
    const arr = netBoardPins.get(r) ?? [];
    arr.push(pinId);
    netBoardPins.set(r, arr);
  }

  const getNetInfo = (compId: string, pinId: string) => {
    const root = find(keyOf(compId, pinId));
    const boardPins = netBoardPins.get(root) ?? [];
    const isGnd = root === gndRoot;
    const is3v3 = root === v33Root;
    const isVplus = root === vplusRoot;
    const isPower = is3v3 || isVplus;
    const gpioPin = boardPins.find((id) => {
      const def = BOARD_PIN_MAP[id];
      return def && (def.kind === 'gpio' || def.kind === 'input-only' || def.kind === 'i2c');
    });
    return { root, boardPins, isGnd, is3v3, isVplus, isPower, gpioPin };
  };

  const diagnostics: Record<string, ComponentDiagnostic> = {};
  const pinInputs: Record<string, { digital?: boolean; analog?: number }> = {};
  const ultrasonicDistances: Record<string, number> = {};
  const motorOutputs: Record<string, number> = {};
  const servoOutputs: Record<string, number | null> = {};
  const ledOutputs: Record<string, number> = {};
  const buzzerOutputs: Record<string, number> = {};

  for (const comp of components) {
    switch (comp.type) {
      case 'led': {
        const anode = getNetInfo(comp.id, 'anode');
        const cathode = getNetInfo(comp.id, 'cathode');
        let brightness = 0;

        if (!anode.gpioPin && !anode.isPower) {
          diagnostics[comp.id] = {
            status: 'idle',
            message: 'Conecta el ánodo (+) a un pin IOxx y el cátodo (-) a GND.',
            boundGpios: {},
          };
        } else if (anode.isGnd && cathode.gpioPin) {
          diagnostics[comp.id] = {
            status: 'warning',
            message: 'Polaridad invertida: conecta el ánodo (+) al pin IOxx y el cátodo (-) a GND.',
            boundGpios: {},
          };
        } else if (!cathode.isGnd) {
          diagnostics[comp.id] = {
            status: 'warning',
            message: 'Falta conectar el cátodo (-) del LED a GND.',
            boundGpios: anode.gpioPin ? { signal: anode.gpioPin } : {},
          };
        } else if (anode.gpioPin && INPUT_ONLY_PINS.has(anode.gpioPin)) {
          diagnostics[comp.id] = {
            status: 'warning',
            message: `${anode.gpioPin} es solo entrada en ESP32; usa otro pin IOxx para controlar el LED.`,
            boundGpios: { signal: anode.gpioPin },
          };
        } else if (anode.isPower && runtime.powered) {
          brightness = 1;
          diagnostics[comp.id] = {
            status: 'ok',
            message: 'Conectado directo a alimentación (+).',
            boundGpios: {},
          };
        } else if (anode.gpioPin) {
          const pinState = runtime.pins[anode.gpioPin];
          if (runtime.powered && pinState) {
            if (pinState.mode === 'PWM') brightness = pinState.pwmDuty;
            else if (pinState.mode === 'DIGITAL_OUT') brightness = pinState.digitalValue ? 1 : 0;
          }
          diagnostics[comp.id] = {
            status: 'ok',
            message: `Listo en ${anode.gpioPin}`,
            boundGpios: { signal: anode.gpioPin },
          };
        }
        ledOutputs[comp.id] = brightness;
        break;
      }

      case 'button': {
        const sig = getNetInfo(comp.id, 'sig');
        const gnd = getNetInfo(comp.id, 'gnd');
        const pressed = Boolean(comp.props.pressed);

        if (!sig.gpioPin) {
          diagnostics[comp.id] = {
            status: 'idle',
            message: 'Conecta SIG a un pin IOxx y el otro terminal a GND.',
            boundGpios: {},
          };
        } else if (!gnd.isGnd && !gnd.isPower) {
          diagnostics[comp.id] = {
            status: 'warning',
            message: 'Conecta el segundo terminal del pulsador a GND (o 3.3v).',
            boundGpios: { signal: sig.gpioPin },
          };
        } else {
          // If wired to GND (standard pull-up), pressed -> LOW (false), unpressed -> HIGH (true)
          // If wired to 3.3V/V+, pressed -> HIGH (true), unpressed -> LOW (false)
          const level = gnd.isPower ? pressed : !pressed;
          pinInputs[sig.gpioPin] = {
            ...pinInputs[sig.gpioPin],
            digital: level,
            analog: level ? 65535 : 0,
          };
          diagnostics[comp.id] = {
            status: 'ok',
            message: `Conectado a ${sig.gpioPin} (${gnd.isPower ? 'Pull-Down' : 'Pull-Up a GND'})`,
            boundGpios: { signal: sig.gpioPin },
          };
        }
        break;
      }

      case 'potentiometer': {
        const vcc = getNetInfo(comp.id, 'vcc');
        const sig = getNetInfo(comp.id, 'sig');
        const gnd = getNetInfo(comp.id, 'gnd');
        const val = typeof comp.props.value === 'number' ? comp.props.value : 0.5;

        if (!sig.gpioPin) {
          diagnostics[comp.id] = {
            status: 'idle',
            message: 'Conecta SIG a un pin IOxx analógico (ej. IO34, IO33, IO32).',
            boundGpios: {},
          };
        } else if (!vcc.isPower || !gnd.isGnd) {
          diagnostics[comp.id] = {
            status: 'warning',
            message: 'Falta conectar VCC a 3.3v y GND a tierra para leer el potenciómetro.',
            boundGpios: { signal: sig.gpioPin },
          };
        } else {
          pinInputs[sig.gpioPin] = {
            ...pinInputs[sig.gpioPin],
            analog: Math.round(val * 65535),
            digital: val >= 0.5,
          };
          diagnostics[comp.id] = {
            status: 'ok',
            message: `Lectura analógica en ${sig.gpioPin} (${(val * 3.3).toFixed(2)} V)`,
            boundGpios: { signal: sig.gpioPin },
          };
        }
        break;
      }

      case 'servo': {
        const gnd = getNetInfo(comp.id, 'gnd');
        const vcc = getNetInfo(comp.id, 'vcc');
        const sig = getNetInfo(comp.id, 'sig');
        let angle: number | null = null;

        if (!sig.gpioPin) {
          diagnostics[comp.id] = {
            status: 'idle',
            message: 'Conecta SIG a IO04–IO26, V+ y GND.',
            boundGpios: {},
          };
        } else if (!gnd.isGnd || !vcc.isPower) {
          diagnostics[comp.id] = {
            status: 'warning',
            message: 'Falta alimentación V+ o retorno GND para mover el servo.',
            boundGpios: { signal: sig.gpioPin },
          };
        } else if (INPUT_ONLY_PINS.has(sig.gpioPin)) {
          diagnostics[comp.id] = {
            status: 'warning',
            message: `${sig.gpioPin} es solo entrada y no genera señal PWM para servo.`,
            boundGpios: { signal: sig.gpioPin },
          };
        } else {
          const pinState = runtime.pins[sig.gpioPin];
          if (runtime.powered && pinState) {
            if (pinState.mode === 'SERVO' && pinState.servoAngle !== null) {
              angle = pinState.servoAngle;
            } else if (pinState.mode === 'PWM') {
              angle = Math.max(0, Math.min(180, pinState.pwmDuty * 180));
            }
          }
          diagnostics[comp.id] = {
            status: 'ok',
            message: `Servo conectado a ${sig.gpioPin} (${runtime.powerSelect})`,
            boundGpios: { signal: sig.gpioPin },
          };
        }
        servoOutputs[comp.id] = angle;
        break;
      }

      case 'dc-motor': {
        const pos = getNetInfo(comp.id, 'pos');
        const neg = getNetInfo(comp.id, 'neg');
        let throttle = 0;

        const hasM1A = pos.boardPins.includes('MOTOR1_A') || neg.boardPins.includes('MOTOR1_A');
        const hasM1B = pos.boardPins.includes('MOTOR1_B') || neg.boardPins.includes('MOTOR1_B');
        const hasM2A = pos.boardPins.includes('MOTOR2_A') || neg.boardPins.includes('MOTOR2_A');
        const hasM2B = pos.boardPins.includes('MOTOR2_B') || neg.boardPins.includes('MOTOR2_B');

        if (hasM1A && hasM1B) {
          const polarity = pos.boardPins.includes('MOTOR1_A') ? 1 : -1;
          throttle = runtime.powered ? runtime.motor1Throttle * polarity : 0;
          diagnostics[comp.id] = {
            status: 'ok',
            message: 'Conectado a MOTOR1 (IO12 / IO14)',
            boundGpios: { motor: 'MOTOR1' },
          };
        } else if (hasM2A && hasM2B) {
          const polarity = pos.boardPins.includes('MOTOR2_A') ? 1 : -1;
          throttle = runtime.powered ? runtime.motor2Throttle * polarity : 0;
          diagnostics[comp.id] = {
            status: 'ok',
            message: 'Conectado a MOTOR2 (IO13 / IO15)',
            boundGpios: { motor: 'MOTOR2' },
          };
        } else {
          diagnostics[comp.id] = {
            status: pos.boardPins.length || neg.boardPins.length ? 'warning' : 'idle',
            message: 'Conecta los 2 terminales a MOTOR1 (+ / -) o MOTOR2 (+ / -).',
            boundGpios: {},
          };
        }
        motorOutputs[comp.id] = throttle;
        break;
      }

      case 'ultrasonic': {
        const vcc = getNetInfo(comp.id, 'vcc');
        const trig = getNetInfo(comp.id, 'trig');
        const echo = getNetInfo(comp.id, 'echo');
        const gnd = getNetInfo(comp.id, 'gnd');
        const dist = typeof comp.props.distanceCm === 'number' ? comp.props.distanceCm : 25;

        if (!trig.gpioPin || !echo.gpioPin) {
          diagnostics[comp.id] = {
            status: 'idle',
            message: 'Conecta VCC (3.3v), TRIG (IOxx), ECHO (IOxx) y GND.',
            boundGpios: {},
          };
        } else if (!vcc.isPower || !gnd.isGnd) {
          diagnostics[comp.id] = {
            status: 'warning',
            message: 'Falta alimentación VCC o GND en el sensor ultrasónico.',
            boundGpios: { trig: trig.gpioPin, echo: echo.gpioPin },
          };
        } else {
          ultrasonicDistances[`${trig.gpioPin}:${echo.gpioPin}`] = dist;
          ultrasonicDistances['default'] = dist;
          diagnostics[comp.id] = {
            status: 'ok',
            message: `TRIG=${trig.gpioPin}, ECHO=${echo.gpioPin} (${dist.toFixed(0)} cm)`,
            boundGpios: { trig: trig.gpioPin, echo: echo.gpioPin },
          };
        }
        break;
      }

      case 'buzzer': {
        const pos = getNetInfo(comp.id, 'pos');
        const neg = getNetInfo(comp.id, 'neg');
        let freq = 0;

        if (!pos.gpioPin) {
          diagnostics[comp.id] = {
            status: 'idle',
            message: 'Conecta (+) a un pin IOxx y (-) a GND.',
            boundGpios: {},
          };
        } else if (!neg.isGnd) {
          diagnostics[comp.id] = {
            status: 'warning',
            message: 'Falta conectar el terminal (-) del buzzer a GND.',
            boundGpios: { signal: pos.gpioPin },
          };
        } else if (INPUT_ONLY_PINS.has(pos.gpioPin)) {
          diagnostics[comp.id] = {
            status: 'warning',
            message: `${pos.gpioPin} es solo entrada; usa otro pin IOxx para el buzzer.`,
            boundGpios: { signal: pos.gpioPin },
          };
        } else {
          const pinState = runtime.pins[pos.gpioPin];
          if (runtime.powered && pinState) {
            if (pinState.mode === 'PWM' && pinState.pwmDuty > 0.02) {
              freq = pinState.frequency || 440;
            } else if (pinState.mode === 'DIGITAL_OUT' && pinState.digitalValue) {
              freq = 880;
            }
          }
          diagnostics[comp.id] = {
            status: 'ok',
            message: `Conectado a ${pos.gpioPin}`,
            boundGpios: { signal: pos.gpioPin },
          };
        }
        buzzerOutputs[comp.id] = freq;
        break;
      }
    }
  }

  return {
    diagnostics,
    pinInputs,
    ultrasonicDistances,
    motorOutputs,
    servoOutputs,
    ledOutputs,
    buzzerOutputs,
  };
}
