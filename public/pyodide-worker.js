/* eslint-disable no-undef */
let pyodideReadyPromise = null;
let latestInputs = {
  pinInputs: {},
  ultrasonicDistances: {},
};

const emit = (type, payload) => {
  self.postMessage({ type, payload });
};

self._ibBridge = {
  emitState(stateJson) {
    try {
      emit('STATE_UPDATE', JSON.parse(stateJson));
    } catch (err) {
      // Ignore transient serialization errors
    }
  },
  emitLog(level, text) {
    emit('LOG', { level, text });
  },
  getInputsJson() {
    return JSON.stringify(latestInputs);
  },
};

const BOOTSTRAP_PYTHON = `
import ast
import asyncio
import json
import sys
import time as _real_time
import traceback
import types
import js

_bridge = js._ibBridge

class _StreamCatcher:
    def __init__(self, level):
        self.level = level
        self._buf = ""

    def write(self, data):
        if not data:
            return
        self._buf += str(data)
        while "\\n" in self._buf:
            line, self._buf = self._buf.split("\\n", 1)
            _bridge.emitLog(self.level, line)

    def flush(self):
        if self._buf:
            _bridge.emitLog(self.level, self._buf)
            self._buf = ""

sys.stdout = _StreamCatcher("stdout")
sys.stderr = _StreamCatcher("stderr")

_runtime_state = {
    "neopixel": [0, 0, 0],
    "neopixelBrightness": 0.35,
    "motor1Throttle": 0.0,
    "motor2Throttle": 0.0,
    "pins": {},
}
_dirty = False
_last_flush = 0.0
_last_yield = 0.0
_cached_inputs = {"pinInputs": {}, "ultrasonicDistances": {}}
_last_input_poll = 0.0

def _poll_inputs():
    global _cached_inputs, _last_input_poll
    now = _real_time.monotonic()
    if now - _last_input_poll >= 0.015:
        _last_input_poll = now
        try:
            _cached_inputs = json.loads(_bridge.getInputsJson())
        except Exception:
            pass
    return _cached_inputs

def _mark_dirty(force=False):
    global _dirty, _last_flush
    _dirty = True
    now = _real_time.monotonic()
    if force or (now - _last_flush >= 0.016):
        _dirty = False
        _last_flush = now
        _bridge.emitState(json.dumps(_runtime_state))

def _flush_if_dirty(force=False):
    global _dirty, _last_flush
    now = _real_time.monotonic()
    if _dirty and (force or (now - _last_flush >= 0.016)):
        _dirty = False
        _last_flush = now
        _bridge.emitState(json.dumps(_runtime_state))

def _reset_runtime_state():
    global _dirty
    _runtime_state["neopixel"] = [0, 0, 0]
    _runtime_state["neopixelBrightness"] = 0.35
    _runtime_state["motor1Throttle"] = 0.0
    _runtime_state["motor2Throttle"] = 0.0
    _runtime_state["pins"] = {}
    _dirty = False
    _bridge.emitState(json.dumps(_runtime_state))

async def _sim_yield():
    global _last_yield
    now = _real_time.monotonic()
    if now - _last_yield >= 0.016:
        _last_yield = now
        _flush_if_dirty(force=True)
        await asyncio.sleep(0.004)
        _poll_inputs()

async def _sim_sleep(seconds):
    try:
        secs = float(seconds)
    except Exception:
        secs = 0.0
    if secs < 0:
        secs = 0.0
    _flush_if_dirty(force=True)
    end = _real_time.monotonic() + secs
    while True:
        remaining = end - _real_time.monotonic()
        if remaining <= 0:
            break
        await asyncio.sleep(min(remaining, 0.025))
        _poll_inputs()
    _flush_if_dirty(force=True)

# --- Virtual CircuitPython Hardware Modules ---

class _Pin:
    def __init__(self, pin_id):
        self.id = pin_id
    def __repr__(self):
        return f"board.{self.id}"

_board_mod = types.ModuleType("board")
_PIN_NAMES = [
    "IO02", "IO04", "IO05", "IO12", "IO13", "IO14", "IO15",
    "IO18", "IO19", "IO21", "IO22", "IO23", "IO25", "IO26",
    "IO27", "IO32", "IO33", "IO34", "IO35", "IO36", "IO39",
]
for _pname in _PIN_NAMES:
    setattr(_board_mod, _pname, _Pin(_pname))
_board_mod.NEOPIXEL = _board_mod.IO02
_board_mod.LED = _board_mod.IO02
_board_mod.SDA = _board_mod.IO21
_board_mod.SCL = _board_mod.IO22
_board_mod.TX = _Pin("TX0")
_board_mod.RX = _Pin("RX0")
sys.modules["board"] = _board_mod

# digitalio
_digitalio_mod = types.ModuleType("digitalio")
class _Direction:
    INPUT = "INPUT"
    OUTPUT = "OUTPUT"
class _Pull:
    UP = "UP"
    DOWN = "DOWN"

class _DigitalInOut:
    def __init__(self, pin):
        self._pin = pin
        self._direction = _Direction.INPUT
        self._pull = None
        self._value = False
        _runtime_state["pins"][pin.id] = {
            "mode": "DIGITAL_IN",
            "digitalValue": False,
            "pwmDuty": 0.0,
            "analogValue": 0,
            "servoAngle": None,
        }
        _mark_dirty()

    @property
    def direction(self):
        return self._direction

    @direction.setter
    def direction(self, val):
        self._direction = val
        mode = "DIGITAL_OUT" if val == _Direction.OUTPUT else "DIGITAL_IN"
        entry = _runtime_state["pins"].setdefault(self._pin.id, {})
        entry["mode"] = mode
        _mark_dirty()

    @property
    def pull(self):
        return self._pull

    @pull.setter
    def pull(self, val):
        self._pull = val

    def switch_to_output(self, value=False):
        self.direction = _Direction.OUTPUT
        self.value = value

    def switch_to_input(self, pull=None):
        self.direction = _Direction.INPUT
        self.pull = pull

    @property
    def value(self):
        if self._direction == _Direction.OUTPUT:
            return self._value
        inputs = _poll_inputs().get("pinInputs", {})
        pin_in = inputs.get(self._pin.id)
        if pin_in is not None and "digital" in pin_in:
            return bool(pin_in["digital"])
        if self._pull == _Pull.UP:
            return True
        return False

    @value.setter
    def value(self, val):
        self._value = bool(val)
        entry = _runtime_state["pins"].setdefault(self._pin.id, {})
        entry["mode"] = "DIGITAL_OUT"
        entry["digitalValue"] = self._value
        _mark_dirty()

    def deinit(self):
        pass

_digitalio_mod.Direction = _Direction
_digitalio_mod.Pull = _Pull
_digitalio_mod.DigitalInOut = _DigitalInOut
sys.modules["digitalio"] = _digitalio_mod

# analogio
_analogio_mod = types.ModuleType("analogio")
class _AnalogIn:
    def __init__(self, pin):
        self._pin = pin
        _runtime_state["pins"][pin.id] = {
            "mode": "ANALOG_IN",
            "digitalValue": False,
            "pwmDuty": 0.0,
            "analogValue": 0,
            "servoAngle": None,
        }
        _mark_dirty()

    @property
    def value(self):
        inputs = _poll_inputs().get("pinInputs", {})
        pin_in = inputs.get(self._pin.id)
        if pin_in is not None and "analog" in pin_in:
            v = int(pin_in["analog"])
            _runtime_state["pins"][self._pin.id]["analogValue"] = v
            return v
        return 0

    @property
    def reference_voltage(self):
        return 3.3

    def deinit(self):
        pass

class _AnalogOut:
    def __init__(self, pin):
        self._pin = pin
        self._value = 0
        _runtime_state["pins"][pin.id] = {
            "mode": "PWM",
            "digitalValue": False,
            "pwmDuty": 0.0,
            "analogValue": 0,
            "servoAngle": None,
        }
        _mark_dirty()

    @property
    def value(self):
        return self._value

    @value.setter
    def value(self, val):
        self._value = max(0, min(65535, int(val)))
        entry = _runtime_state["pins"].setdefault(self._pin.id, {})
        entry["mode"] = "PWM"
        entry["pwmDuty"] = self._value / 65535.0
        entry["analogValue"] = self._value
        _mark_dirty()

    def deinit(self):
        pass

_analogio_mod.AnalogIn = _AnalogIn
_analogio_mod.AnalogOut = _AnalogOut
sys.modules["analogio"] = _analogio_mod

# pwmio
_pwmio_mod = types.ModuleType("pwmio")
class _PWMOut:
    def __init__(self, pin, duty_cycle=0, frequency=500, variable_frequency=True):
        self._pin = pin
        self._duty_cycle = int(duty_cycle)
        self._frequency = int(frequency)
        _runtime_state["pins"][pin.id] = {
            "mode": "PWM",
            "digitalValue": self._duty_cycle > 0,
            "pwmDuty": max(0.0, min(1.0, self._duty_cycle / 65535.0)),
            "analogValue": self._duty_cycle,
            "servoAngle": None,
            "frequency": self._frequency,
        }
        _mark_dirty()

    @property
    def duty_cycle(self):
        return self._duty_cycle

    @duty_cycle.setter
    def duty_cycle(self, val):
        self._duty_cycle = max(0, min(65535, int(val)))
        entry = _runtime_state["pins"].setdefault(self._pin.id, {})
        entry["mode"] = "PWM"
        entry["pwmDuty"] = self._duty_cycle / 65535.0
        entry["digitalValue"] = self._duty_cycle > 0
        entry["frequency"] = self._frequency
        _mark_dirty()

    @property
    def frequency(self):
        return self._frequency

    @frequency.setter
    def frequency(self, val):
        self._frequency = max(1, int(val))
        entry = _runtime_state["pins"].setdefault(self._pin.id, {})
        entry["frequency"] = self._frequency
        _mark_dirty()

    def deinit(self):
        pass

_pwmio_mod.PWMOut = _PWMOut
sys.modules["pwmio"] = _pwmio_mod

# neopixel
_neopixel_mod = types.ModuleType("neopixel")
def _normalize_color(color):
    if isinstance(color, int):
        return [(color >> 16) & 255, (color >> 8) & 255, color & 255]
    if isinstance(color, str) and color.startswith("#") and len(color) == 7:
        return [int(color[1:3], 16), int(color[3:5], 16), int(color[5:7], 16)]
    r, g, b = color[0], color[1], color[2]
    return [max(0, min(255, int(r))), max(0, min(255, int(g))), max(0, min(255, int(b)))]

class _NeoPixel:
    def __init__(self, pin, n=1, brightness=0.35, auto_write=True):
        self._pin = pin
        self._n = n
        self._brightness = float(brightness)
        self.auto_write = auto_write
        self._pixels = [[0, 0, 0] for _ in range(n)]

    @property
    def brightness(self):
        return self._brightness

    @brightness.setter
    def brightness(self, val):
        self._brightness = max(0.0, min(1.0, float(val)))
        _runtime_state["neopixelBrightness"] = self._brightness
        if self.auto_write:
            self.show()

    def __setitem__(self, index, val):
        c = _normalize_color(val)
        self._pixels[index] = c
        if index == 0 and self.auto_write:
            self.show()

    def __getitem__(self, index):
        return tuple(self._pixels[index])

    def fill(self, val):
        c = _normalize_color(val)
        for i in range(self._n):
            self._pixels[i] = list(c)
        if self.auto_write:
            self.show()

    def show(self):
        _runtime_state["neopixel"] = list(self._pixels[0])
        _runtime_state["neopixelBrightness"] = self._brightness
        _mark_dirty()

_neopixel_mod.NeoPixel = _NeoPixel
sys.modules["neopixel"] = _neopixel_mod

# adafruit_motor
_adafruit_motor = types.ModuleType("adafruit_motor")
_adafruit_motor_motor = types.ModuleType("adafruit_motor.motor")
_adafruit_motor_servo = types.ModuleType("adafruit_motor.servo")

class _DCMotor:
    def __init__(self, channel):
        self._channel = channel
        self._throttle = 0.0

    @property
    def throttle(self):
        return self._throttle

    @throttle.setter
    def throttle(self, val):
        if val is None:
            v = 0.0
        else:
            v = max(-1.0, min(1.0, float(val)))
        self._throttle = v
        if self._channel == 1:
            _runtime_state["motor1Throttle"] = v
        else:
            _runtime_state["motor2Throttle"] = v
        _mark_dirty()

class _Servo:
    def __init__(self, pin):
        self._pin = pin
        self._angle = 90
        _runtime_state["pins"][pin.id] = {
            "mode": "SERVO",
            "digitalValue": False,
            "pwmDuty": 0.5,
            "analogValue": 0,
            "servoAngle": 90.0,
        }
        _mark_dirty()

    @property
    def angle(self):
        return self._angle

    @angle.setter
    def angle(self, val):
        if val is None:
            return
        a = max(0.0, min(180.0, float(val)))
        self._angle = a
        entry = _runtime_state["pins"].setdefault(self._pin.id, {})
        entry["mode"] = "SERVO"
        entry["servoAngle"] = a
        _mark_dirty()

_adafruit_motor_motor.DCMotor = _DCMotor
_adafruit_motor_servo.Servo = _Servo
_adafruit_motor.motor = _adafruit_motor_motor
_adafruit_motor.servo = _adafruit_motor_servo
sys.modules["adafruit_motor"] = _adafruit_motor
sys.modules["adafruit_motor.motor"] = _adafruit_motor_motor
sys.modules["adafruit_motor.servo"] = _adafruit_motor_servo

# adafruit_hcsr04
_hcsr04_mod = types.ModuleType("adafruit_hcsr04")
class _HCSR04:
    def __init__(self, trigger_pin, echo_pin):
        self._trig = trigger_pin
        self._echo = echo_pin

    @property
    def distance(self):
        dists = _poll_inputs().get("ultrasonicDistances", {})
        key = f"{self._trig.id}:{self._echo.id}"
        if key in dists:
            return float(dists[key])
        if "default" in dists:
            return float(dists["default"])
        return 25.0

_hcsr04_mod.HCSR04 = _HCSR04
sys.modules["adafruit_hcsr04"] = _hcsr04_mod

# ideaboard helper library
_ideaboard_mod = types.ModuleType("ideaboard")

def _hsv_to_rgb(h):
    h = (h % 256) / 255.0
    i = int(h * 6.0)
    f = (h * 6.0) - i
    q = int(255 * (1.0 - f))
    t = int(255 * f)
    i = i % 6
    if i == 0: return (255, t, 0)
    if i == 1: return (q, 255, 0)
    if i == 2: return (0, 255, t)
    if i == 3: return (0, q, 255)
    if i == 4: return (t, 0, 255)
    return (255, 0, q)

class _DigitalInHelper:
    def __init__(self, pin, pull=_Pull.UP):
        self._dio = _DigitalInOut(pin)
        self._dio.switch_to_input(pull=pull)

    @property
    def value(self):
        return self._dio.value

class _DigitalOutHelper:
    def __init__(self, pin):
        self._dio = _DigitalInOut(pin)
        self._dio.switch_to_output(value=False)

    @property
    def value(self):
        return self._dio.value

    @value.setter
    def value(self, val):
        self._dio.value = val

class IdeaBoard:
    UP = _Pull.UP
    DOWN = _Pull.DOWN

    def __init__(self):
        self.board = _board_mod
        self._np = _NeoPixel(_board_mod.IO02, 1, brightness=0.35, auto_write=True)
        self.motor_1 = _DCMotor(1)
        self.motor_2 = _DCMotor(2)
        self._arcoiris = 0

    @property
    def pixel(self):
        return self._np[0]

    @pixel.setter
    def pixel(self, color):
        self._np[0] = color

    @property
    def brightness(self):
        return self._np.brightness

    @brightness.setter
    def brightness(self, val):
        self._np.brightness = val

    @property
    def arcoiris(self):
        return self._arcoiris

    @arcoiris.setter
    def arcoiris(self, hue):
        self._arcoiris = int(hue) % 256
        self.pixel = _hsv_to_rgb(self._arcoiris)

    def DigitalIn(self, pin, pull=_Pull.UP):
        return _DigitalInHelper(pin, pull=pull)

    def DigitalOut(self, pin):
        return _DigitalOutHelper(pin)

    def AnalogIn(self, pin):
        return _AnalogIn(pin)

    def AnalogOut(self, pin):
        return _AnalogOut(pin)

    def Servo(self, pin):
        return _Servo(pin)

    def Sonar(self, trig_pin, echo_pin):
        return _HCSR04(trig_pin, echo_pin)

    @staticmethod
    def mapa(x, in_min, in_max, out_min, out_max):
        if in_max == in_min:
            return out_min
        return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min

_ideaboard_mod.IdeaBoard = IdeaBoard
sys.modules["ideaboard"] = _ideaboard_mod

# --- AST Async Transformer ---

def _contains_async_trigger(node, async_names):
    for child in ast.walk(node):
        if isinstance(child, (ast.While, ast.For, ast.AsyncFor)):
            return True
        if isinstance(child, ast.Call):
            fn = child.func
            if isinstance(fn, ast.Name) and (fn.id == "sleep" or fn.id in async_names):
                return True
            if isinstance(fn, ast.Attribute) and fn.attr == "sleep":
                return True
    return False

class _SimTransformer(ast.NodeTransformer):
    def __init__(self, async_names):
        self.async_names = async_names

    def visit_FunctionDef(self, node):
        self.generic_visit(node)
        if node.name in self.async_names:
            return ast.AsyncFunctionDef(
                name=node.name,
                args=node.args,
                body=node.body,
                decorator_list=node.decorator_list,
                returns=node.returns,
                type_comment=getattr(node, "type_comment", None),
                type_params=getattr(node, "type_params", []),
            )
        return node

    def visit_While(self, node):
        self.generic_visit(node)
        yield_stmt = ast.Expr(
            value=ast.Await(
                value=ast.Call(func=ast.Name(id="_sim_yield", ctx=ast.Load()), args=[], keywords=[])
            )
        )
        node.body = [yield_stmt] + node.body
        return node

    def visit_For(self, node):
        self.generic_visit(node)
        yield_stmt = ast.Expr(
            value=ast.Await(
                value=ast.Call(func=ast.Name(id="_sim_yield", ctx=ast.Load()), args=[], keywords=[])
            )
        )
        node.body = [yield_stmt] + node.body
        return node

    def visit_Call(self, node):
        self.generic_visit(node)
        fn = node.func
        is_sleep = (
            (isinstance(fn, ast.Name) and fn.id == "sleep")
            or (isinstance(fn, ast.Attribute) and fn.attr == "sleep")
        )
        if is_sleep:
            new_call = ast.Call(
                func=ast.Name(id="_sim_sleep", ctx=ast.Load()),
                args=node.args,
                keywords=node.keywords,
            )
            return ast.Await(value=new_call)
        if isinstance(fn, ast.Name) and fn.id in self.async_names:
            return ast.Await(value=node)
        return node

def _compile_user_code(source_code):
    tree = ast.parse(source_code, filename="code.py", mode="exec")
    fn_defs = [n for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)]
    async_names = set()
    changed = True
    while changed:
        changed = False
        for fn in fn_defs:
            if fn.name not in async_names and _contains_async_trigger(fn, async_names):
                async_names.add(fn.name)
                changed = True

    transformed = _SimTransformer(async_names).visit(tree)
    wrapper = ast.AsyncFunctionDef(
        name="__user_main__",
        args=ast.arguments(posonlyargs=[], args=[], kwonlyargs=[], kw_defaults=[], defaults=[]),
        body=transformed.body if transformed.body else [ast.Pass()],
        decorator_list=[],
        returns=None,
    )
    mod = ast.Module(body=[wrapper], type_ignores=[])
    ast.fix_missing_locations(mod)
    return compile(mod, "code.py", "exec")

_current_task = None

async def _run_wrapper(code_obj, ns):
    try:
        exec(code_obj, ns)
        await ns["__user_main__"]()
        sys.stdout.flush()
        _bridge.emitLog("system", "Programa finalizado.")
        __raw_post(json.dumps({"type": "FINISHED"}))
    except asyncio.CancelledError:
        sys.stdout.flush()
    except Exception:
        sys.stderr.flush()
        _bridge.emitLog("stderr", traceback.format_exc())
        __raw_post(json.dumps({"type": "ERROR_STOP"}))

def _start_user_script(source_code):
    global _current_task
    _stop_user_script()
    _reset_runtime_state()
    try:
        code_obj = _compile_user_code(source_code)
    except SyntaxError:
        _bridge.emitLog("stderr", traceback.format_exc())
        return False

    ns = {
        "__name__": "__main__",
        "_sim_sleep": _sim_sleep,
        "_sim_yield": _sim_yield,
    }
    loop = asyncio.get_event_loop()
    _current_task = loop.create_task(_run_wrapper(code_obj, ns))
    return True

def _stop_user_script():
    global _current_task
    if _current_task is not None and not _current_task.done():
        _current_task.cancel()
    _current_task = None
    _reset_runtime_state()
`;

async function ensurePyodide() {
  if (!pyodideReadyPromise) {
    pyodideReadyPromise = (async () => {
      emit('STATUS', 'loading-python');
      importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');
      const pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
      });
      // Hook postMessage notifications from Python wrapper
      pyodide.globals.set('__raw_post', (msgJson) => {
        try {
          const parsed = JSON.parse(msgJson);
          emit(parsed.type, null);
        } catch {
          // ignore
        }
      });
      await pyodide.runPythonAsync(BOOTSTRAP_PYTHON);
      return pyodide;
    })();
  }
  return pyodideReadyPromise;
}

self.onmessage = async (event) => {
  const { type, payload } = event.data || {};
  if (type === 'INPUT_UPDATE') {
    latestInputs = payload;
    return;
  }

  if (type === 'RUN') {
    try {
      const pyodide = await ensurePyodide();
      if (payload.inputs) {
        latestInputs = payload.inputs;
      }
      pyodide.globals.set('__user_code_str', payload.code || '');
      const started = await pyodide.runPythonAsync('_start_user_script(__user_code_str)');
      if (started) {
        emit('STATUS', 'running');
      } else {
        emit('STATUS', 'error');
      }
    } catch (err) {
      emit('LOG', { level: 'stderr', text: String(err) });
      emit('STATUS', 'error');
    }
    return;
  }

  if (type === 'STOP') {
    if (pyodideReadyPromise) {
      try {
        const pyodide = await pyodideReadyPromise;
        await pyodide.runPythonAsync('_stop_user_script()');
      } catch {
        // ignore
      }
    }
    emit('STATUS', 'idle');
  }
};
