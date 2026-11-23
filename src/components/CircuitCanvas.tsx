import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Trash2, ZoomIn, ZoomOut, Maximize2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { BOARD_PIN_MAP } from '../hardware/ideaboardSpec';
import { COMPONENT_SPECS, WIRE_COLORS } from '../hardware/componentSpecs';
import { NetlistResult } from '../sim/netlist';
import {
  BoardPinDef,
  BoardRuntimeState,
  ComponentPinDef,
  PlacedComponent,
  PowerSelectMode,
  Wire,
} from '../types/simulator';
import { IdeaBoardSvg } from './IdeaBoardSvg';
import { ExternalComponentSvg } from './ExternalComponentSvg';

export const BOARD_ORIGIN = { x: 255, y: 55 };

interface CircuitCanvasProps {
  components: PlacedComponent[];
  wires: Wire[];
  runtime: BoardRuntimeState;
  powerSelect: PowerSelectMode;
  netlist: NetlistResult;
  activeWireColor: string;
  onSelectWireColor: (hex: string) => void;
  onAddWire: (from: { nodeId: string; pinId: string }, to: { nodeId: string; pinId: string }) => void;
  onDeleteWire: (wireId: string) => void;
  onUpdateWireColor: (wireId: string, color: string) => void;
  onMoveComponent: (compId: string, x: number, y: number) => void;
  onDeleteComponent: (compId: string) => void;
  onUpdateComponentProp: (compId: string, key: string, value: string | number | boolean) => void;
  onTogglePowerSelect: () => void;
  onResetBoard: () => void;
}

export const CircuitCanvas: React.FC<CircuitCanvasProps> = ({
  components,
  wires,
  runtime,
  powerSelect,
  netlist,
  activeWireColor,
  onSelectWireColor,
  onAddWire,
  onDeleteWire,
  onUpdateWireColor,
  onMoveComponent,
  onDeleteComponent,
  onUpdateComponentProp,
  onTogglePowerSelect,
  onResetBoard,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 24, y: 12 });
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [hoveredPin, setHoveredPin] = useState<BoardPinDef | null>(null);
  const [wireStart, setWireStart] = useState<{ nodeId: string; pinId: string } | null>(null);
  const [cursorWorld, setCursorWorld] = useState<{ x: number; y: number } | null>(null);

  const panState = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const dragCompState = useRef<{
    compId: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const screenToWorld = useCallback(
    (clientX: number, clientY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: (clientX - rect.left - pan.x) / zoom,
        y: (clientY - rect.top - pan.y) / zoom,
      };
    },
    [pan, zoom]
  );

  const getPinWorldPos = useCallback(
    (endpoint: { nodeId: string; pinId: string }): { x: number; y: number } | null => {
      if (endpoint.nodeId === 'board') {
        const pin = BOARD_PIN_MAP[endpoint.pinId];
        if (!pin) return null;
        return { x: BOARD_ORIGIN.x + pin.x, y: BOARD_ORIGIN.y + pin.y };
      }
      const comp = components.find((c) => c.id === endpoint.nodeId);
      if (!comp) return null;
      const spec = COMPONENT_SPECS[comp.type];
      const pin = spec.pins.find((p) => p.id === endpoint.pinId);
      if (!pin) return null;
      return { x: comp.x + pin.x, y: comp.y + pin.y };
    },
    [components]
  );

  const buildBezierPath = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const dx = Math.abs(b.x - a.x);
    const dy = Math.abs(b.y - a.y);
    const curve = Math.max(36, Math.min(140, (dx + dy) * 0.35));
    const c1x = a.x + (b.x >= a.x ? curve * 0.5 : -curve * 0.5);
    const c2x = b.x - (b.x >= a.x ? curve * 0.5 : -curve * 0.5);
    return `M ${a.x} ${a.y} C ${c1x} ${a.y}, ${c2x} ${b.y}, ${b.x} ${b.y}`;
  };

  // Global keyboard shortcuts (Delete / Escape)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement as HTMLElement | null)?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || (document.activeElement as HTMLElement | null)?.closest('.monaco-editor')) {
        return;
      }
      if (e.key === 'Escape') {
        setWireStart(null);
        setSelectedWireId(null);
        setSelectedCompId(null);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedWireId) {
          onDeleteWire(selectedWireId);
          setSelectedWireId(null);
        } else if (selectedCompId) {
          onDeleteComponent(selectedCompId);
          setSelectedCompId(null);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedWireId, selectedCompId, onDeleteWire, onDeleteComponent]);

  const handleEndpointClick = (endpoint: { nodeId: string; pinId: string }) => {
    if (!wireStart) {
      setWireStart(endpoint);
      setSelectedWireId(null);
      return;
    }
    if (wireStart.nodeId === endpoint.nodeId && wireStart.pinId === endpoint.pinId) {
      setWireStart(null);
      return;
    }
    onAddWire(wireStart, endpoint);
    setWireStart(null);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (wireStart) {
      setCursorWorld(screenToWorld(e.clientX, e.clientY));
    }
    if (dragCompState.current) {
      const dx = (e.clientX - dragCompState.current.startX) / zoom;
      const dy = (e.clientY - dragCompState.current.startY) / zoom;
      onMoveComponent(
        dragCompState.current.compId,
        Math.round(dragCompState.current.origX + dx),
        Math.round(dragCompState.current.origY + dy)
      );
      return;
    }
    if (panState.current) {
      const dx = e.clientX - panState.current.startX;
      const dy = e.clientY - panState.current.startY;
      setPan({ x: panState.current.origX + dx, y: panState.current.origY + dy });
    }
  };

  const handlePointerUp = () => {
    panState.current = null;
    dragCompState.current = null;
  };

  const selectedComp = components.find((c) => c.id === selectedCompId) ?? null;
  const selectedCompDiag = selectedComp ? netlist.diagnostics[selectedComp.id] : undefined;
  const wireStartPos = wireStart ? getPinWorldPos(wireStart) : null;

  return (
    <div
      ref={containerRef}
      className="workbench-grid relative h-full w-full overflow-hidden select-none"
      onWheel={(e) => {
        if (e.ctrlKey || Math.abs(e.deltaY) > 0) {
          const factor = e.deltaY < 0 ? 1.08 : 0.92;
          setZoom((z) => Math.max(0.45, Math.min(2.2, Number((z * factor).toFixed(2)))));
        }
      }}
      onPointerDown={(e) => {
        if (e.button !== 0 && e.button !== 1) return;
        setSelectedWireId(null);
        setSelectedCompId(null);
        panState.current = {
          startX: e.clientX,
          startY: e.clientY,
          origX: pan.x,
          origY: pan.y,
        };
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={() => {
        if (wireStart) setWireStart(null);
      }}
    >
      {/* Top Floating Wire Color & Instructions Bar */}
      <div
        className="absolute left-3 top-3 z-20 flex flex-wrap items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/90 px-3 py-1.5 backdrop-blur"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-xs font-medium text-slate-300">Cable:</span>
        <div className="flex items-center gap-1.5">
          {WIRE_COLORS.map((c) => {
            const active = selectedWireId
              ? wires.find((w) => w.id === selectedWireId)?.color === c.hex
              : activeWireColor === c.hex;
            return (
              <button
                key={c.hex}
                type="button"
                title={c.name}
                onClick={() => {
                  if (selectedWireId) {
                    onUpdateWireColor(selectedWireId, c.hex);
                  } else {
                    onSelectWireColor(c.hex);
                  }
                }}
                style={{ backgroundColor: c.hex }}
                className={`h-4 w-4 rounded-full border transition-transform ${
                  active ? 'scale-125 border-white' : 'border-slate-600 hover:scale-110'
                }`}
              />
            );
          })}
        </div>

        {(selectedWireId || selectedCompId) && (
          <button
            type="button"
            onClick={() => {
              if (selectedWireId) {
                onDeleteWire(selectedWireId);
                setSelectedWireId(null);
              } else if (selectedCompId) {
                onDeleteComponent(selectedCompId);
                setSelectedCompId(null);
              }
            }}
            className="ml-1 flex items-center gap-1 rounded-lg bg-rose-500/20 px-2 py-0.5 text-xs font-medium text-rose-300 hover:bg-rose-500/30"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar
          </button>
        )}

        {wireStart && (
          <span className="ml-2 rounded-md bg-sky-500/20 px-2 py-0.5 text-xs text-sky-300">
            Haz clic en el pin destino (Esc para cancelar)
          </span>
        )}
      </div>

      {/* Bottom-Left Info Pill (Hovered Pin or Selected Component Diagnostic) */}
      {(hoveredPin || selectedCompDiag) && (
        <div className="pointer-events-none absolute bottom-3 left-3 z-20 max-w-md rounded-xl border border-slate-700/80 bg-slate-900/92 px-3 py-2 text-xs shadow-lg backdrop-blur">
          {hoveredPin ? (
            <div>
              <span className="font-mono font-bold text-amber-300">{hoveredPin.label}</span>
              <span className="ml-2 text-slate-300">{hoveredPin.description}</span>
            </div>
          ) : selectedComp && selectedCompDiag ? (
            <div className="flex items-center gap-2">
              {selectedCompDiag.status === 'warning' ? (
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
              ) : (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              )}
              <div>
                <span className="font-semibold text-slate-100">{selectedComp.label}: </span>
                <span className="text-slate-300">{selectedCompDiag.message}</span>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Bottom-Right Zoom Controls */}
      <div
        className="absolute bottom-3 right-3 z-20 flex items-center gap-1 rounded-xl border border-slate-700/80 bg-slate-900/90 p-1 backdrop-blur"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.45, Number((z - 0.12).toFixed(2))))}
          className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-800"
          title="Alejar"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="min-w-[44px] text-center font-mono text-xs text-slate-300">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(2.2, Number((z + 0.12).toFixed(2))))}
          className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-800"
          title="Acercar"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            setZoom(1);
            setPan({ x: 24, y: 12 });
          }}
          className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-800"
          title="Centrar vista"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Transformed World Layer */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          position: 'absolute',
          inset: 0,
        }}
      >
        {/* IdeaBoard PCB */}
        <div
          style={{
            position: 'absolute',
            left: BOARD_ORIGIN.x,
            top: BOARD_ORIGIN.y,
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <IdeaBoardSvg
            runtime={runtime}
            powerSelect={powerSelect}
            activeWirePinId={wireStart?.nodeId === 'board' ? wireStart.pinId : null}
            hoveredPinId={hoveredPin?.id ?? null}
            onPinClick={(pin) => handleEndpointClick({ nodeId: 'board', pinId: pin.id })}
            onPinHover={setHoveredPin}
            onTogglePowerSelect={onTogglePowerSelect}
            onResetBoard={onResetBoard}
          />
        </div>

        {/* External Placed Components */}
        {components.map((comp) => (
          <ExternalComponentSvg
            key={comp.id}
            component={comp}
            selected={selectedCompId === comp.id}
            diagnostic={netlist.diagnostics[comp.id]}
            ledBrightness={netlist.ledOutputs[comp.id] ?? 0}
            motorThrottle={netlist.motorOutputs[comp.id] ?? 0}
            servoAngle={netlist.servoOutputs[comp.id] ?? null}
            buzzerFreq={netlist.buzzerOutputs[comp.id] ?? 0}
            activeWireEndpoint={wireStart}
            onSelect={() => {
              setSelectedCompId(comp.id);
              setSelectedWireId(null);
            }}
            onStartDrag={(e) => {
              e.stopPropagation();
              setSelectedCompId(comp.id);
              setSelectedWireId(null);
              dragCompState.current = {
                compId: comp.id,
                startX: e.clientX,
                startY: e.clientY,
                origX: comp.x,
                origY: comp.y,
              };
            }}
            onPinClick={(pin: ComponentPinDef) =>
              handleEndpointClick({ nodeId: comp.id, pinId: pin.id })
            }
            onUpdateProp={(key, value) => onUpdateComponentProp(comp.id, key, value)}
          />
        ))}

        {/* Bezier Wires Layer */}
        <svg
          width="3000"
          height="3000"
          className="pointer-events-none absolute left-0 top-0 overflow-visible"
        >
          {wires.map((wire) => {
            const p1 = getPinWorldPos(wire.from);
            const p2 = getPinWorldPos(wire.to);
            if (!p1 || !p2) return null;
            const d = buildBezierPath(p1, p2);
            const isSel = selectedWireId === wire.id;

            return (
              <g key={wire.id}>
                {/* Subtle shadow */}
                <path
                  d={d}
                  fill="none"
                  stroke="#000000"
                  strokeOpacity="0.45"
                  strokeWidth={isSel ? 7 : 5}
                  strokeLinecap="round"
                />
                {/* Selection halo */}
                {isSel && (
                  <path
                    d={d}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="7.5"
                    strokeOpacity="0.7"
                    strokeLinecap="round"
                  />
                )}
                {/* Actual colored wire */}
                <path
                  d={d}
                  fill="none"
                  stroke={wire.color}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="pointer-events-auto cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedWireId(wire.id);
                    setSelectedCompId(null);
                  }}
                />
                {/* Invisible thicker hit area */}
                <path
                  d={d}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="12"
                  className="pointer-events-auto cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedWireId(wire.id);
                    setSelectedCompId(null);
                  }}
                />
              </g>
            );
          })}

          {/* Live wire preview */}
          {wireStartPos && cursorWorld && (
            <path
              d={buildBezierPath(wireStartPos, cursorWorld)}
              fill="none"
              stroke={activeWireColor}
              strokeWidth="3.2"
              strokeDasharray="6 4"
              strokeLinecap="round"
            />
          )}
        </svg>
      </div>
    </div>
  );
};
