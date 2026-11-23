import { StarterTemplate } from '../types/simulator';

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: 'neopixel-button-led',
    title: 'NeoPixel + Botón + LED',
    description: 'Controla el NeoPixel integrado (IO02) y un LED externo (IO04) usando un pulsador (IO27).',
    powerSelect: '3.3v',
    components: [
      {
        id: 'led-1',
        type: 'led',
        label: 'LED Rojo',
        x: 78,
        y: 230,
        props: { color: '#ef4444' },
      },
      {
        id: 'btn-1',
        type: 'button',
        label: 'Botón',
        x: 615,
        y: 265,
        props: { pressed: false },
      },
    ],
    wires: [
      {
        id: 'w-led-sig',
        from: { nodeId: 'led-1', pinId: 'anode' },
        to: { nodeId: 'board', pinId: 'IO04' },
        color: '#ef4444',
      },
      {
        id: 'w-led-gnd',
        from: { nodeId: 'led-1', pinId: 'cathode' },
        to: { nodeId: 'board', pinId: 'L_GND_IO04' },
        color: '#334155',
      },
      {
        id: 'w-btn-sig',
        from: { nodeId: 'btn-1', pinId: 'sig' },
        to: { nodeId: 'board', pinId: 'IO27' },
        color: '#3b82f6',
      },
      {
        id: 'w-btn-gnd',
        from: { nodeId: 'btn-1', pinId: 'gnd' },
        to: { nodeId: 'board', pinId: 'R_GND_IO27' },
        color: '#334155',
      },
    ],
    code: `from ideaboard import IdeaBoard
from time import sleep

ib = IdeaBoard()

# Botón en IO27 (conectado a GND, usa Pull-Up interno)
boton = ib.DigitalIn(ib.board.IO27, pull=ib.UP)
# LED externo en IO04
led = ib.DigitalOut(ib.board.IO04)

colores = [
    (255, 40, 40),    # Rojo
    (40, 255, 80),    # Verde
    (40, 140, 255),   # Azul
    (255, 200, 0),    # Amarillo
]
indice = 0

print("Presiona el botón en el circuito para cambiar el color y encender el LED!")

while True:
    # Con Pull-Up a GND: False significa botón presionado
    presionado = not boton.value
    led.value = presionado

    if presionado:
        ib.pixel = colores[indice]
        print("Botón presionado! Color:", colores[indice])
        indice = (indice + 1) % len(colores)
        sleep(0.25)
    else:
        ib.pixel = (20, 20, 45)
        sleep(0.05)
`,
  },
  {
    id: 'motors-robot',
    title: 'Robot 2WD (Motores DC)',
    description: 'Prueba los puentes H integrados MOTOR1 y MOTOR2 con avance, giro y reversa.',
    powerSelect: 'Vin',
    components: [
      {
        id: 'motor-left',
        type: 'dc-motor',
        label: 'Motor Izq (M2)',
        x: 42,
        y: 120,
        props: {},
      },
      {
        id: 'motor-right',
        type: 'dc-motor',
        label: 'Motor Der (M1)',
        x: 610,
        y: 120,
        props: {},
      },
    ],
    wires: [
      {
        id: 'w-m2-a',
        from: { nodeId: 'motor-left', pinId: 'pos' },
        to: { nodeId: 'board', pinId: 'MOTOR2_A' },
        color: '#eab308',
      },
      {
        id: 'w-m2-b',
        from: { nodeId: 'motor-left', pinId: 'neg' },
        to: { nodeId: 'board', pinId: 'MOTOR2_B' },
        color: '#334155',
      },
      {
        id: 'w-m1-a',
        from: { nodeId: 'motor-right', pinId: 'pos' },
        to: { nodeId: 'board', pinId: 'MOTOR1_A' },
        color: '#ef4444',
      },
      {
        id: 'w-m1-b',
        from: { nodeId: 'motor-right', pinId: 'neg' },
        to: { nodeId: 'board', pinId: 'MOTOR1_B' },
        color: '#334155',
      },
    ],
    code: `from ideaboard import IdeaBoard
from time import sleep

ib = IdeaBoard()

while True:
    print("Avanzando adelante...")
    ib.pixel = (0, 255, 100)
    ib.motor_1.throttle = 0.8
    ib.motor_2.throttle = 0.8
    sleep(1.5)

    print("Girando a la derecha...")
    ib.pixel = (255, 180, 0)
    ib.motor_1.throttle = -0.6
    ib.motor_2.throttle = 0.6
    sleep(1.0)

    print("Reversa...")
    ib.pixel = (255, 50, 50)
    ib.motor_1.throttle = -0.7
    ib.motor_2.throttle = -0.7
    sleep(1.2)

    print("Detenido")
    ib.pixel = (0, 0, 0)
    ib.motor_1.throttle = 0
    ib.motor_2.throttle = 0
    sleep(0.8)
`,
  },
  {
    id: 'pot-servo',
    title: 'Potenciómetro -> Servo',
    description: 'Gira la perilla del potenciómetro (IO34) para mover el servomotor SG90 (IO04) de 0° a 180°.',
    powerSelect: 'Vin',
    components: [
      {
        id: 'pot-1',
        type: 'potentiometer',
        label: 'Potenciómetro',
        x: 610,
        y: 300,
        props: { value: 0.5 },
      },
      {
        id: 'servo-1',
        type: 'servo',
        label: 'Servo SG90',
        x: 48,
        y: 255,
        props: {},
      },
    ],
    wires: [
      {
        id: 'w-pot-vcc',
        from: { nodeId: 'pot-1', pinId: 'vcc' },
        to: { nodeId: 'board', pinId: 'R_3V3_IO34' },
        color: '#ef4444',
      },
      {
        id: 'w-pot-sig',
        from: { nodeId: 'pot-1', pinId: 'sig' },
        to: { nodeId: 'board', pinId: 'IO34' },
        color: '#eab308',
      },
      {
        id: 'w-pot-gnd',
        from: { nodeId: 'pot-1', pinId: 'gnd' },
        to: { nodeId: 'board', pinId: 'R_GND_IO34' },
        color: '#334155',
      },
      {
        id: 'w-srv-gnd',
        from: { nodeId: 'servo-1', pinId: 'gnd' },
        to: { nodeId: 'board', pinId: 'L_GND_IO04' },
        color: '#334155',
      },
      {
        id: 'w-srv-vcc',
        from: { nodeId: 'servo-1', pinId: 'vcc' },
        to: { nodeId: 'board', pinId: 'L_VP_IO04' },
        color: '#ef4444',
      },
      {
        id: 'w-srv-sig',
        from: { nodeId: 'servo-1', pinId: 'sig' },
        to: { nodeId: 'board', pinId: 'IO04' },
        color: '#f97316',
      },
    ],
    code: `from ideaboard import IdeaBoard
from time import sleep

ib = IdeaBoard()

# Potenciómetro en pin analógico IO34
pot = ib.AnalogIn(ib.board.IO34)
# Servomotor en pin de potencia directa IO04
servo = ib.Servo(ib.board.IO04)

print("Gira la perilla del potenciómetro en el lienzo!")

while True:
    valor = pot.value  # 0 a 65535
    angulo = int(ib.mapa(valor, 0, 65535, 0, 180))
    servo.angle = angulo

    # Color proporcional en el NeoPixel
    rojo = int(ib.mapa(angulo, 0, 180, 0, 255))
    azul = 255 - rojo
    ib.pixel = (rojo, 40, azul)

    sleep(0.05)
`,
  },
  {
    id: 'ultrasonic-alarm',
    title: 'Sensor Ultrasónico + Buzzer',
    description: 'Mueve el obstáculo frente al HC-SR04 para activar alertas en el LED, NeoPixel y Buzzer.',
    powerSelect: '3.3v',
    components: [
      {
        id: 'us-1',
        type: 'ultrasonic',
        label: 'HC-SR04',
        x: 42,
        y: 250,
        props: { distanceCm: 28 },
      },
      {
        id: 'buz-1',
        type: 'buzzer',
        label: 'Buzzer',
        x: 612,
        y: 260,
        props: {},
      },
      {
        id: 'led-2',
        type: 'led',
        label: 'LED Alerta',
        x: 92,
        y: 120,
        props: { color: '#ef4444' },
      },
    ],
    wires: [
      {
        id: 'w-us-vcc',
        from: { nodeId: 'us-1', pinId: 'vcc' },
        to: { nodeId: 'board', pinId: 'L_VP_IO18' },
        color: '#ef4444',
      },
      {
        id: 'w-us-trig',
        from: { nodeId: 'us-1', pinId: 'trig' },
        to: { nodeId: 'board', pinId: 'IO18' },
        color: '#22c55e',
      },
      {
        id: 'w-us-echo',
        from: { nodeId: 'us-1', pinId: 'echo' },
        to: { nodeId: 'board', pinId: 'IO19' },
        color: '#3b82f6',
      },
      {
        id: 'w-us-gnd',
        from: { nodeId: 'us-1', pinId: 'gnd' },
        to: { nodeId: 'board', pinId: 'L_GND_IO18' },
        color: '#334155',
      },
      {
        id: 'w-buz-pos',
        from: { nodeId: 'buz-1', pinId: 'pos' },
        to: { nodeId: 'board', pinId: 'IO27' },
        color: '#a855f7',
      },
      {
        id: 'w-buz-neg',
        from: { nodeId: 'buz-1', pinId: 'neg' },
        to: { nodeId: 'board', pinId: 'R_GND_IO27' },
        color: '#334155',
      },
      {
        id: 'w-led2-a',
        from: { nodeId: 'led-2', pinId: 'anode' },
        to: { nodeId: 'board', pinId: 'IO04' },
        color: '#ef4444',
      },
      {
        id: 'w-led2-k',
        from: { nodeId: 'led-2', pinId: 'cathode' },
        to: { nodeId: 'board', pinId: 'L_GND_IO04' },
        color: '#334155',
      },
    ],
    code: `from ideaboard import IdeaBoard
import pwmio
from time import sleep

ib = IdeaBoard()
sonar = ib.Sonar(ib.board.IO18, ib.board.IO19)
led_alerta = ib.DigitalOut(ib.board.IO04)
buzzer = pwmio.PWMOut(ib.board.IO27, duty_cycle=0, frequency=660)

print("Mueve el deslizador de distancia en el sensor HC-SR04!")

while True:
    distancia = sonar.distance
    print(f"Distancia: {distancia:.1f} cm")

    if distancia < 15:
        ib.pixel = (255, 0, 0)
        led_alerta.value = True
        buzzer.frequency = 880
        buzzer.duty_cycle = 32768
        sleep(0.12)
        buzzer.duty_cycle = 0
        led_alerta.value = False
        sleep(0.12)
    elif distancia < 35:
        ib.pixel = (255, 160, 0)
        led_alerta.value = True
        buzzer.frequency = 520
        buzzer.duty_cycle = 32768
        sleep(0.2)
        buzzer.duty_cycle = 0
        sleep(0.3)
    else:
        ib.pixel = (0, 220, 100)
        led_alerta.value = False
        buzzer.duty_cycle = 0
        sleep(0.2)
`,
  },
];
