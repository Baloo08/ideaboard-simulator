import React, { useEffect, useRef, useState } from 'react';
import { COMPONENT_SPECS } from '../hardware/componentSpecs';
import { ComponentDiagnostic, ComponentPinDef, PlacedComponent } from '../types/simulator';

interface ExternalComponentSvgProps {
  component: PlacedComponent;
  selected: boolean;
  diagnostic?: ComponentDiagnostic;
  ledBrightness: number;
  motorThrottle: number;
  servoAngle: number | null;
  buzzerFreq: number;
  activeWireEndpoint: { nodeId: string; pinId: string } | null;
  onSelect: (e: React.MouseEvent) => void;
  onStartDrag: (e: React.PointerEvent) => void;
  onPinClick: (pin: ComponentPinDef, e: React.MouseEvent) => void;
  onUpdateProp: (key: string, value: string | number | boolean) => void;
}

export const ExternalComponentSvg: React.FC<ExternalComponentSvgProps> = ({
  component,
  selected,
  diagnostic,
  ledBrightness,
  motorThrottle,
  servoAngle,
  buzzerFreq,
  activeWireEndpoint,
  onSelect,
  onStartDrag,
  onPinClick,
  onUpdateProp,
}) => {
  const spec = COMPONENT_SPECS[component.type];
  const [wheelAngle, setWheelAngle] = useState(0);
  const wheelAngleRef = useRef(0);

  // Smooth continuous wheel rotation for DC motor
  useEffect(() => {
    if (component.type !== 'dc-motor' || Math.abs(motorThrottle) < 0.01) return;
    let rafId = 0;
    let lastTime = performance.now();
    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      wheelAngleRef.current = (wheelAngleRef.current + motorThrottle * 380 * dt) % 360;
      setWheelAngle(wheelAngleRef.current);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [component.type, motorThrottle]);

  const ledColor = String(component.props.color ?? '#ef4444');
  const pressed = Boolean(component.props.pressed);
  const potValue = typeof component.props.value === 'number' ? component.props.value : 0.5;
  const distanceCm = typeof component.props.distanceCm === 'number' ? component.props.distanceCm : 25;
  const effectiveServo = servoAngle ?? 90;

  return (
    <div
      style={{
        position: 'absolute',
        left: component.x,
        top: component.y,
        width: spec.width,
        userSelect: 'none',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(e);
      }}
      onPointerDown={(e) => {
        // Only start dragging component if not clicking interactive controls
        const target = e.target as HTMLElement;
        if (target.closest('[data-interactive="true"]')) return;
        onStartDrag(e);
      }}
      className={`group cursor-grab active:cursor-grabbing rounded-xl transition-shadow ${
        selected ? 'ring-2 ring-sky-400 shadow-lg shadow-sky-500/20' : ''
      }`}
    >
      {/* Header badge */}
      <div className="pointer-events-none absolute -top-5 left-0 right-0 flex items-center justify-between px-1">
        <span className="truncate text-[10px] font-semibold tracking-wide text-slate-300">
          {component.label}
        </span>
        {diagnostic && diagnostic.status === 'warning' && (
          <span
            title={diagnostic.message}
            className="inline-block h-2 w-2 rounded-full bg-amber-400"
          />
        )}
        {diagnostic && diagnostic.status === 'ok' && (
          <span
            title={diagnostic.message}
            className="inline-block h-2 w-2 rounded-full bg-emerald-400"
          />
        )}
      </div>

      {/* Main SVG Body */}
      <svg
        width={spec.width}
        height={spec.height}
        viewBox={`0 0 ${spec.width} ${spec.height}`}
        className="overflow-visible"
      >
        {component.type === 'led' && (
          <g>
            <defs>
              <radialGradient id={`led-glow-${component.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={ledColor} stopOpacity={Math.min(1, ledBrightness)} />
                <stop offset="55%" stopColor={ledColor} stopOpacity={ledBrightness * 0.45} />
                <stop offset="100%" stopColor={ledColor} stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Legs */}
            <path d="M 24 56 L 24 82" stroke="#94a3b8" strokeWidth="3" />
            <path d="M 44 56 L 44 82" stroke="#94a3b8" strokeWidth="3" />
            {/* Glow */}
            {ledBrightness > 0.02 && (
              <circle
                cx="34"
                cy="34"
                r="32"
                fill={`url(#led-glow-${component.id})`}
                pointerEvents="none"
              />
            )}
            {/* LED Dome */}
            <path
              d="M 18 52 L 18 32 A 16 16 0 0 1 50 32 L 50 52 Z"
              fill={ledColor}
              fillOpacity={0.28 + ledBrightness * 0.72}
              stroke={ledColor}
              strokeWidth="1.5"
            />
            <rect x="15" y="51" width="38" height="7" rx="2" fill={ledColor} fillOpacity="0.85" />
            <ellipse cx="28" cy="27" rx="3.5" ry="6" fill="#ffffff" fillOpacity="0.35" />
          </g>
        )}

        {component.type === 'button' && (
          <g>
            {/* Legs */}
            <line x1="24" y1="54" x2="24" y2="68" stroke="#94a3b8" strokeWidth="3" />
            <line x1="54" y1="54" x2="54" y2="68" stroke="#94a3b8" strokeWidth="3" />
            {/* Housing */}
            <rect x="13" y="8" width="52" height="48" rx="6" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
            {[
              [20, 15],
              [58, 15],
              [20, 49],
              [58, 49],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="2.2" fill="#94a3b8" />
            ))}
            {/* Interactive Cap */}
            <g
              data-interactive="true"
              className="cursor-pointer"
              onPointerDown={(e) => {
                e.stopPropagation();
                onUpdateProp('pressed', true);
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                onUpdateProp('pressed', false);
              }}
              onPointerLeave={() => {
                if (pressed) onUpdateProp('pressed', false);
              }}
            >
              <circle
                cx="39"
                cy={pressed ? 33 : 31}
                r="14"
                fill={pressed ? '#38bdf8' : '#0f172a'}
                stroke="#cbd5e1"
                strokeWidth="1.5"
              />
              <text
                x="39"
                y={pressed ? 36 : 34}
                textAnchor="middle"
                fill={pressed ? '#0f172a' : '#e2e8f0'}
                fontSize="7"
                fontWeight="700"
              >
                {pressed ? 'ON' : 'PUSH'}
              </text>
            </g>
          </g>
        )}

        {component.type === 'potentiometer' && (
          <g>
            <line x1="22" y1="68" x2="22" y2="88" stroke="#94a3b8" strokeWidth="3" />
            <line x1="44" y1="68" x2="44" y2="88" stroke="#94a3b8" strokeWidth="3" />
            <line x1="66" y1="68" x2="66" y2="88" stroke="#94a3b8" strokeWidth="3" />
            <rect x="12" y="10" width="64" height="58" rx="8" fill="#1d4ed8" stroke="#60a5fa" strokeWidth="1.5" />
            <circle cx="44" cy="39" r="21" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
            {/* Rotating indicator (-135deg to +135deg) */}
            <g transform={`rotate(${-135 + potValue * 270} 44 39)`}>
              <circle cx="44" cy="39" r="15" fill="#1e293b" />
              <line x1="44" y1="39" x2="44" y2="22" stroke="#facc15" strokeWidth="3" strokeLinecap="round" />
            </g>
            <text x="44" y="8" textAnchor="middle" fill="#93c5fd" fontSize="8" fontFamily="monospace">
              {(potValue * 3.3).toFixed(2)}V
            </text>
          </g>
        )}

        {component.type === 'servo' && (
          <g>
            {/* 3-wire ribbon */}
            <line x1="34" y1="76" x2="34" y2="102" stroke="#78350f" strokeWidth="3" />
            <line x1="56" y1="76" x2="56" y2="102" stroke="#ef4444" strokeWidth="3" />
            <line x1="78" y1="76" x2="78" y2="102" stroke="#f97316" strokeWidth="3" />
            {/* SG90 Blue Body */}
            <rect x="14" y="34" width="84" height="44" rx="4" fill="#2563eb" stroke="#60a5fa" strokeWidth="1.2" />
            <rect x="6" y="48" width="100" height="8" rx="2" fill="#1d4ed8" />
            <rect x="44" y="16" width="24" height="22" rx="12" fill="#1e40af" />
            {/* Rotating Servo Horn */}
            <g transform={`rotate(${effectiveServo - 90} 56 26)`}>
              <rect x="49" y="4" width="14" height="28" rx="7" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
              <circle cx="56" cy="26" r="4.5" fill="#cbd5e1" />
              <circle cx="56" cy="11" r="2" fill="#475569" />
            </g>
            <text x="56" y="64" textAnchor="middle" fill="#e0f2fe" fontSize="9.5" fontWeight="700" fontFamily="monospace">
              {Math.round(effectiveServo)}°
            </text>
          </g>
        )}

        {component.type === 'dc-motor' && (
          <g>
            <line x1="44" y1="72" x2="44" y2="88" stroke="#ef4444" strokeWidth="3" />
            <line x1="76" y1="72" x2="76" y2="88" stroke="#334155" strokeWidth="3" />
            {/* Yellow TT Gearbox */}
            <rect x="26" y="28" width="68" height="44" rx="6" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
            <rect x="16" y="36" width="14" height="28" rx="3" fill="#cbd5e1" />
            {/* Spinning Wheel */}
            <g transform={`rotate(${wheelAngle} 60 36)`}>
              <circle cx="60" cy="36" r="26" fill="#1e293b" stroke="#475569" strokeWidth="2.5" />
              <circle cx="60" cy="36" r="19" fill="#0f172a" />
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <line
                  key={deg}
                  x1="60"
                  y1="36"
                  x2={60 + 17 * Math.cos((deg * Math.PI) / 180)}
                  y2={36 + 17 * Math.sin((deg * Math.PI) / 180)}
                  stroke="#facc15"
                  strokeWidth="2.4"
                />
              ))}
              <circle cx="60" cy="36" r="5" fill="#f8fafc" />
            </g>
            <text x="60" y="81" textAnchor="middle" fill="#fef08a" fontSize="8.5" fontWeight="700" fontFamily="monospace">
              {Math.round(motorThrottle * 100)}%
            </text>
          </g>
        )}

        {component.type === 'ultrasonic' && (
          <g>
            {[32, 56, 80, 104].map((px) => (
              <line key={px} x1={px} y1="68" x2={px} y2="98" stroke="#94a3b8" strokeWidth="3" />
            ))}
            <rect x="10" y="16" width="116" height="54" rx="6" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
            <circle cx="38" cy="43" r="18" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
            <circle cx="38" cy="43" r="12" fill="#334155" />
            <circle cx="98" cy="43" r="18" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
            <circle cx="98" cy="43" r="12" fill="#334155" />
            <rect x="61" y="28" width="14" height="10" rx="2" fill="#cbd5e1" />
            <text x="68" y="64" textAnchor="middle" fill="#e0f2fe" fontSize="8" fontWeight="700" fontFamily="monospace">
              {distanceCm.toFixed(0)} cm
            </text>
          </g>
        )}

        {component.type === 'buzzer' && (
          <g>
            <line x1="26" y1="54" x2="26" y2="74" stroke="#ef4444" strokeWidth="3" />
            <line x1="52" y1="54" x2="52" y2="74" stroke="#334155" strokeWidth="3" />
            {buzzerFreq > 0 && (
              <>
                <circle cx="39" cy="32" r="28" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4 3" />
                <circle cx="39" cy="32" r="34" fill="none" stroke="#c084fc" strokeWidth="1" opacity="0.6" />
              </>
            )}
            <circle cx="39" cy="32" r="22" fill="#18181b" stroke="#52525b" strokeWidth="1.8" />
            <circle cx="39" cy="32" r="6" fill="#27272a" stroke="#71717a" strokeWidth="1" />
            <text x="24" y="22" fill="#f87171" fontSize="9" fontWeight="700">+</text>
            {buzzerFreq > 0 && (
              <text x="39" y="6" textAnchor="middle" fill="#d8b4fe" fontSize="8" fontFamily="monospace">
                {buzzerFreq} Hz
              </text>
            )}
          </g>
        )}

        {/* Component Interactive Pins */}
        {spec.pins.map((pin) => {
          const isWireStart =
            activeWireEndpoint?.nodeId === component.id && activeWireEndpoint?.pinId === pin.id;
          return (
            <g
              key={pin.id}
              data-interactive="true"
              className="cursor-crosshair"
              onClick={(e) => {
                e.stopPropagation();
                onPinClick(pin, e);
              }}
            >
              <title>{`${component.label} — ${pin.label}`}</title>
              <circle cx={pin.x} cy={pin.y} r="7" fill="transparent" />
              <circle
                cx={pin.x}
                cy={pin.y}
                r="4.2"
                fill={
                  isWireStart
                    ? '#38bdf8'
                    : pin.role === 'gnd'
                      ? '#64748b'
                      : pin.role === 'power'
                        ? '#ef4444'
                        : '#facc15'
                }
                stroke="#ffffff"
                strokeWidth={isWireStart ? 1.8 : 1}
              />
              <text
                x={pin.x}
                y={pin.y + 13}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="7"
                fontFamily="monospace"
              >
                {pin.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Inline Interactive Controls for Sensors/LED */}
      {component.type === 'potentiometer' && (
        <div data-interactive="true" className="mt-2 px-1">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={potValue}
            onChange={(e) => onUpdateProp('value', parseFloat(e.target.value))}
            className="h-1.5 w-full cursor-pointer accent-sky-400"
          />
        </div>
      )}

      {component.type === 'ultrasonic' && (
        <div data-interactive="true" className="mt-2 px-1">
          <input
            type="range"
            min={2}
            max={100}
            step={1}
            value={distanceCm}
            onChange={(e) => onUpdateProp('distanceCm', parseFloat(e.target.value))}
            className="h-1.5 w-full cursor-pointer accent-cyan-400"
          />
        </div>
      )}

      {selected && component.type === 'led' && (
        <div data-interactive="true" className="mt-2 flex justify-center gap-1">
          {['#ef4444', '#22c55e', '#3b82f6', '#eab308'].map((hex) => (
            <button
              key={hex}
              type="button"
              onClick={() => onUpdateProp('color', hex)}
              style={{ backgroundColor: hex }}
              className={`h-3.5 w-3.5 rounded-full border ${
                ledColor === hex ? 'border-white scale-110' : 'border-slate-700'
              }`}
              title="Cambiar color de LED"
            />
          ))}
        </div>
      )}
    </div>
  );
};
