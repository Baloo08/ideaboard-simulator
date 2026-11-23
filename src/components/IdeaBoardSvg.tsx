import React from 'react';
import { BOARD_HEIGHT, BOARD_WIDTH, IDEABOARD_PINS } from '../hardware/ideaboardSpec';
import { BoardPinDef, BoardRuntimeState, PowerSelectMode } from '../types/simulator';

interface IdeaBoardSvgProps {
  runtime: BoardRuntimeState;
  powerSelect: PowerSelectMode;
  activeWirePinId: string | null;
  hoveredPinId: string | null;
  onPinClick: (pin: BoardPinDef, e: React.MouseEvent) => void;
  onPinHover: (pin: BoardPinDef | null) => void;
  onTogglePowerSelect: () => void;
  onResetBoard: () => void;
}

export const IdeaBoardSvg: React.FC<IdeaBoardSvgProps> = ({
  runtime,
  powerSelect,
  activeWirePinId,
  hoveredPinId,
  onPinClick,
  onPinHover,
  onTogglePowerSelect,
  onResetBoard,
}) => {
  const [r, g, b] = runtime.neopixel;
  const br = runtime.neopixelBrightness;
  const isNeoLit = runtime.powered && (r > 0 || g > 0 || b > 0);
  const neoColor = isNeoLit
    ? `rgb(${Math.round(r * Math.max(0.25, br))}, ${Math.round(g * Math.max(0.25, br))}, ${Math.round(b * Math.max(0.25, br))})`
    : '#93c5fd';
  const neoFullColor = `rgb(${r}, ${g}, ${b})`;

  const pinColorForKind = (pin: BoardPinDef) => {
    if (pin.kind === 'gnd') return '#94a3b8';
    if (pin.kind === 'power-vplus' || pin.kind === 'power-3v3') return '#f87171';
    if (pin.kind === 'motor') return '#facc15';
    return '#eab308';
  };

  return (
    <svg
      width={BOARD_WIDTH}
      height={BOARD_HEIGHT}
      viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
      className="select-none overflow-visible"
    >
      <defs>
        <radialGradient id="neopixel-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={neoFullColor} stopOpacity={isNeoLit ? Math.min(1, br + 0.35) : 0} />
          <stop offset="45%" stopColor={neoFullColor} stopOpacity={isNeoLit ? 0.45 : 0} />
          <stop offset="100%" stopColor={neoFullColor} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pwr-led-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff3b30" stopOpacity={runtime.powered ? 0.95 : 0} />
          <stop offset="100%" stopColor="#ff3b30" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="esp-shield" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="50%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <filter id="pcb-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#000000" floodOpacity="0.55" />
        </filter>
      </defs>

      {/* Main PCB Body */}
      <rect
        x="4"
        y="4"
        width={BOARD_WIDTH - 8}
        height={BOARD_HEIGHT - 8}
        rx="14"
        fill="#222328"
        stroke="#383a42"
        strokeWidth="1.5"
        filter="url(#pcb-shadow)"
      />

      {/* Mounting Holes */}
      {[
        [18, 18],
        [BOARD_WIDTH - 18, 18],
        [18, BOARD_HEIGHT - 18],
        [BOARD_WIDTH - 18, BOARD_HEIGHT - 18],
      ].map(([cx, cy], idx) => (
        <g key={idx}>
          <circle cx={cx} cy={cy} r="9" fill="#9ca3af" />
          <circle cx={cx} cy={cy} r="5.2" fill="#0f172a" />
        </g>
      ))}

      {/* Silkscreen Brand */}
      <text
        x="15"
        y="128"
        fill="#e2e8f0"
        fontSize="9.5"
        fontWeight="700"
        fontStyle="italic"
        fontFamily="system-ui, sans-serif"
        transform="rotate(-90 15 128)"
        letterSpacing="0.4"
      >
        CRCibernetica
      </text>

      {/* Vin Green Screw Terminal */}
      <g>
        <rect x="46" y="6" width="48" height="30" rx="3" fill="#34a853" stroke="#1e7e34" strokeWidth="1" />
        <circle cx="63" cy="21" r="6.5" fill="#d1d5db" stroke="#6b7280" strokeWidth="1" />
        <line x1="59" y1="21" x2="67" y2="21" stroke="#4b5563" strokeWidth="1.5" />
        <circle cx="79" cy="21" r="6.5" fill="#d1d5db" stroke="#6b7280" strokeWidth="1" />
        <line x1="75" y1="21" x2="83" y2="21" stroke="#4b5563" strokeWidth="1.5" />
        <text x="37" y="25" fill="#cbd5e1" fontSize="10" fontWeight="700">+</text>
        <text x="98" y="25" fill="#cbd5e1" fontSize="10" fontWeight="700">-</text>
        <text x="46" y="45" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">Vin</text>
        <text x="72" y="45" fill="#cbd5e1" fontSize="6.5" fontFamily="monospace">+9V max</text>
      </g>

      {/* USB-C Connector */}
      <g>
        <rect x="114" y="0" width="34" height="32" rx="4" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
        <rect x="118" y="3" width="26" height="24" rx="2" fill="#94a3b8" opacity="0.45" />
        <text x="131" y="18" textAnchor="middle" fill="#334155" fontSize="6.5" fontWeight="700" fontFamily="monospace">
          USB-C
        </text>
      </g>

      {/* Power Red LED */}
      <g>
        <rect x="194" y="16" width="8" height="12" rx="1.5" fill="#111827" />
        <circle cx="198" cy="22" r="14" fill="url(#pwr-led-glow)" pointerEvents="none" />
        <rect
          x="195.5"
          y="18.5"
          width="5"
          height="7"
          rx="1"
          fill={runtime.powered ? '#ff3b30' : '#7f1d1d'}
        />
        <text x="198" y="37" textAnchor="middle" fill="#94a3b8" fontSize="6" fontFamily="monospace">
          PWR
        </text>
      </g>

      {/* Voltage Regulator & CH340C decorative ICs */}
      <rect x="44" y="68" width="22" height="18" rx="2" fill="#111317" stroke="#475569" strokeWidth="0.6" />
      <rect x="148" y="54" width="18" height="36" rx="2" fill="#111317" stroke="#475569" strokeWidth="0.6" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <React.Fragment key={i}>
          <rect x="143" y={57 + i * 5.5} width="5" height="2.6" fill="#cbd5e1" />
          <rect x="166" y={57 + i * 5.5} width="5" height="2.6" fill="#cbd5e1" />
        </React.Fragment>
      ))}

      {/* BOOT & RESET Tactile Buttons */}
      <g>
        <rect x="214" y="50" width="22" height="22" rx="2" fill="#cbd5e1" />
        <circle cx="225" cy="61" r="6" fill="#0f172a" />
        <text x="225" y="81" textAnchor="middle" fill="#cbd5e1" fontSize="6.5" fontWeight="600" fontFamily="monospace">
          BOOT
        </text>

        <g
          className="cursor-pointer"
          onClick={onResetBoard}
        >
          <title>Reiniciar simulación (RESET)</title>
          <rect x="214" y="88" width="22" height="22" rx="2" fill="#cbd5e1" />
          <circle cx="225" cy="99" r="6" fill="#0f172a" />
          <circle cx="225" cy="99" r="3" fill="#334155" />
          <text x="225" y="119" textAnchor="middle" fill="#cbd5e1" fontSize="6.5" fontWeight="600" fontFamily="monospace">
            RESET
          </text>
        </g>
      </g>

      {/* Dual H-Bridge Motor ICs */}
      <g>
        {/* Left Motor Driver (MOTOR2) */}
        <rect x="64" y="150" width="28" height="22" rx="2" fill="#111317" stroke="#475569" strokeWidth="0.7" />
        {[0, 1, 2, 3].map((i) => (
          <React.Fragment key={i}>
            <rect x={67 + i * 6} y="146" width="3" height="4" fill="#cbd5e1" />
            <rect x={67 + i * 6} y="172" width="3" height="4" fill="#cbd5e1" />
          </React.Fragment>
        ))}
        <text x="78" y="185" textAnchor="middle" fill="#cbd5e1" fontSize="7" fontFamily="monospace">
          IO13/IO15
        </text>
        <rect x="19" y="144" width="14" height="32" rx="2" fill="#111317" stroke="#334155" strokeWidth="1" />
        <text
          x="13"
          y="160"
          textAnchor="middle"
          fill="#e2e8f0"
          fontSize="7"
          fontWeight="700"
          fontFamily="monospace"
          transform="rotate(-90 13 160)"
        >
          MOTOR2
        </text>
        {runtime.powered && Math.abs(runtime.motor2Throttle) > 0.01 && (
          <circle
            cx="39"
            cy="160"
            r="3.2"
            fill={runtime.motor2Throttle > 0 ? '#22c55e' : '#f97316'}
          />
        )}

        {/* Right Motor Driver (MOTOR1) */}
        <rect x="168" y="150" width="28" height="22" rx="2" fill="#111317" stroke="#475569" strokeWidth="0.7" />
        {[0, 1, 2, 3].map((i) => (
          <React.Fragment key={i}>
            <rect x={171 + i * 6} y="146" width="3" height="4" fill="#cbd5e1" />
            <rect x={171 + i * 6} y="172" width="3" height="4" fill="#cbd5e1" />
          </React.Fragment>
        ))}
        <text x="182" y="185" textAnchor="middle" fill="#cbd5e1" fontSize="7" fontFamily="monospace">
          IO12/IO14
        </text>
        <rect x="227" y="144" width="14" height="32" rx="2" fill="#111317" stroke="#334155" strokeWidth="1" />
        <text
          x="248"
          y="160"
          textAnchor="middle"
          fill="#e2e8f0"
          fontSize="7"
          fontWeight="700"
          fontFamily="monospace"
          transform="rotate(-90 248 160)"
        >
          MOTOR1
        </text>
        {runtime.powered && Math.abs(runtime.motor1Throttle) > 0.01 && (
          <circle
            cx="221"
            cy="160"
            r="3.2"
            fill={runtime.motor1Throttle > 0 ? '#22c55e' : '#f97316'}
          />
        )}
      </g>

      {/* Power SELECT Jumper (Vin / SELECT / +3.3v) */}
      <g className="cursor-pointer" onClick={onTogglePowerSelect}>
        <title>{`Selector de voltaje V+: ${powerSelect} (clic para cambiar entre Vin y +3.3v)`}</title>
        <rect x="115" y="138" width="14" height="46" rx="2" fill="#111317" stroke="#334155" strokeWidth="1" />
        {[146, 161, 176].map((py, i) => (
          <rect key={i} x="119.5" y={py - 2.5} width="5" height="5" fill="#eab308" />
        ))}
        {/* Jumper Cap */}
        <rect
          x="116"
          y={powerSelect === 'Vin' ? 140 : 156}
          width="12"
          height="26"
          rx="2.5"
          fill="#3b82f6"
          fillOpacity="0.88"
          stroke="#93c5fd"
          strokeWidth="1"
        />
        <text x="133" y="149" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">Vin</text>
        <text x="133" y="164" fill="#94a3b8" fontSize="6.5" fontWeight="700" fontFamily="monospace">SELECT</text>
        <text x="133" y="179" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">+3.3v</text>
      </g>

      {/* Qwiic Connector */}
      <g>
        <rect x="12" y="196" width="24" height="32" rx="2" fill="#d6d3d1" stroke="#78716c" strokeWidth="1" />
        <rect x="14" y="201" width="10" height="22" rx="1" fill="#a8a29e" />
        <text
          x="43"
          y="212"
          textAnchor="middle"
          fill="#cbd5e1"
          fontSize="7"
          fontWeight="600"
          fontFamily="monospace"
          transform="rotate(90 43 212)"
        >
          Qwiic
        </text>
      </g>

      {/* Onboard WS2812B NeoPixel (IO02) */}
      <g>
        <circle cx="130" cy="212" r="36" fill="url(#neopixel-glow)" pointerEvents="none" />
        <rect x="118" y="200" width="24" height="24" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
        <circle cx="130" cy="212" r="8.5" fill={neoColor} stroke="#64748b" strokeWidth="0.6" />
        {isNeoLit && (
          <circle cx="130" cy="212" r="5" fill="#ffffff" fillOpacity="0.45" pointerEvents="none" />
        )}
        <text x="102" y="229" fill="#cbd5e1" fontSize="7" fontFamily="monospace">IO02</text>
        <text x="130" y="236" textAnchor="middle" fill="#cbd5e1" fontSize="7" fontWeight="700" fontFamily="monospace">
          WS2812B
        </text>
      </g>

      {/* Left I2C 4-pin Header Shroud & Labels */}
      <g>
        <rect x="17" y="257" width="56" height="14" rx="2" fill="#111317" stroke="#334155" strokeWidth="0.8" />
        <text x="24" y="254" textAnchor="middle" fill="#cbd5e1" fontSize="6" fontFamily="monospace">GND</text>
        <text x="38" y="246" textAnchor="middle" fill="#cbd5e1" fontSize="6" fontFamily="monospace">3.3v</text>
        <text x="52" y="244" textAnchor="middle" fill="#cbd5e1" fontSize="6" fontFamily="monospace">SCL</text>
        <text x="52" y="252" textAnchor="middle" fill="#94a3b8" fontSize="5.5" fontFamily="monospace">IO22</text>
        <text x="66" y="244" textAnchor="middle" fill="#cbd5e1" fontSize="6" fontFamily="monospace">SDA</text>
        <text x="66" y="252" textAnchor="middle" fill="#94a3b8" fontSize="5.5" fontFamily="monospace">IO21</text>
      </g>

      {/* Right UART 4-pin Header Shroud & Labels */}
      <g>
        <rect x="187" y="257" width="56" height="14" rx="2" fill="#111317" stroke="#334155" strokeWidth="0.8" />
        <text x="194" y="246" textAnchor="middle" fill="#cbd5e1" fontSize="6" fontFamily="monospace" transform="rotate(-90 194 246)">TX0</text>
        <text x="208" y="246" textAnchor="middle" fill="#cbd5e1" fontSize="6" fontFamily="monospace" transform="rotate(-90 208 246)">RX0</text>
        <text x="222" y="244" textAnchor="middle" fill="#cbd5e1" fontSize="5.8" fontFamily="monospace" transform="rotate(-90 222 244)">+3.3v</text>
        <text x="236" y="246" textAnchor="middle" fill="#cbd5e1" fontSize="6" fontFamily="monospace" transform="rotate(-90 236 246)">GND</text>
      </g>

      {/* Left 3x7 Header Block */}
      <g>
        <rect x="18" y="286" width="44" height="101" rx="3" fill="#111317" stroke="#334155" strokeWidth="1" />
        {['IO04', 'IO05', 'IO18', 'IO19', 'IO23', 'IO25', 'IO26'].map((lbl, idx) => (
          <text
            key={lbl}
            x="66"
            y={297 + idx * 14}
            fill="#e2e8f0"
            fontSize="7"
            fontWeight="600"
            fontFamily="monospace"
          >
            {lbl}
          </text>
        ))}
        <text x="26" y="399" textAnchor="middle" fill="#cbd5e1" fontSize="6.5" fontFamily="monospace">GND</text>
        <text x="41" y="399" textAnchor="middle" fill="#cbd5e1" fontSize="6.5" fontFamily="monospace">V+</text>
      </g>

      {/* Right 3x7 Header Block */}
      <g>
        <rect x="198" y="286" width="44" height="101" rx="3" fill="#111317" stroke="#334155" strokeWidth="1" />
        {['IO27', 'IO33', 'IO32', 'IO35', 'IO34', 'VN/39', 'VN/36'].map((lbl, idx) => (
          <text
            key={lbl}
            x="194"
            y={297 + idx * 14}
            textAnchor="end"
            fill="#e2e8f0"
            fontSize="7"
            fontWeight="600"
            fontFamily="monospace"
          >
            {lbl}
          </text>
        ))}
        <text x="219" y="399" textAnchor="middle" fill="#cbd5e1" fontSize="6.5" fontFamily="monospace">3.3v</text>
        <text x="235" y="399" textAnchor="middle" fill="#cbd5e1" fontSize="6.5" fontFamily="monospace">GND</text>
      </g>

      {/* ESP32-WROOM-32E Module Shield & PCB Meander Antenna */}
      <g>
        <rect x="92" y="288" width="76" height="86" rx="3" fill="url(#esp-shield)" stroke="#cbd5e1" strokeWidth="1" />
        <text x="130" y="328" textAnchor="middle" fill="#1e293b" fontSize="7.5" fontWeight="700" fontFamily="monospace">
          ESP32
        </text>
        <text x="130" y="339" textAnchor="middle" fill="#334155" fontSize="6" fontFamily="monospace">
          WROOM-32E
        </text>
        {/* Yellow Meander Antenna */}
        <path
          d="M 94 388 L 94 410 L 106 410 L 106 392 L 118 392 L 118 410 L 130 410 L 130 398 L 142 398 L 142 410 L 154 410 L 154 392 L 166 392 L 166 410"
          fill="none"
          stroke="#facc15"
          strokeWidth="4.2"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      </g>

      {/* Interactive Pin Pads */}
      {IDEABOARD_PINS.map((pin) => {
        const isWireStart = activeWirePinId === pin.id;
        const isHovered = hoveredPinId === pin.id;
        const pState = runtime.pins[pin.id];
        const isActiveHigh =
          runtime.powered &&
          pState &&
          ((pState.mode === 'DIGITAL_OUT' && pState.digitalValue) ||
            (pState.mode === 'PWM' && pState.pwmDuty > 0.05) ||
            pState.mode === 'SERVO');

        return (
          <g
            key={pin.id}
            className="cursor-crosshair"
            onClick={(e) => {
              e.stopPropagation();
              onPinClick(pin, e);
            }}
            onMouseEnter={() => onPinHover(pin)}
            onMouseLeave={() => onPinHover(null)}
          >
            <title>{`${pin.label}: ${pin.description}`}</title>
            {/* Invisible larger hit target */}
            <circle cx={pin.x} cy={pin.y} r="6.8" fill="transparent" />
            {/* Gold / Status pin square */}
            <rect
              x={pin.x - 3.3}
              y={pin.y - 3.3}
              width="6.6"
              height="6.6"
              rx="1"
              fill={isWireStart ? '#38bdf8' : isActiveHigh ? '#4ade80' : pinColorForKind(pin)}
              stroke={isWireStart || isHovered ? '#ffffff' : '#0f172a'}
              strokeWidth={isWireStart || isHovered ? 1.5 : 0.7}
            />
          </g>
        );
      })}
    </svg>
  );
};
