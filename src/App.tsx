import React, { useEffect, useMemo, useState } from 'react';
import {
  Play,
  Square,
  Download,
  Volume2,
  VolumeX,
  Sparkles,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { COMPONENT_SPECS, WIRE_COLORS } from './hardware/componentSpecs';
import { STARTER_TEMPLATES } from './hardware/starterTemplates';
import { evaluateCircuit } from './sim/netlist';
import { buzzerAudio } from './sim/buzzerAudio';
import { useSimulation } from './sim/useSimulation';
import {
  ComponentType,
  PlacedComponent,
  PowerSelectMode,
  Wire,
} from './types/simulator';
import { ComponentPalette } from './components/ComponentPalette';
import { CircuitCanvas } from './components/CircuitCanvas';
import { CodeAndConsolePanel } from './components/CodeAndConsolePanel';

export function App() {
  const initialTemplate = STARTER_TEMPLATES[0];
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplate.id);
  const [powerSelect, setPowerSelect] = useState<PowerSelectMode>(initialTemplate.powerSelect);
  const [components, setComponents] = useState<PlacedComponent[]>(initialTemplate.components);
  const [wires, setWires] = useState<Wire[]>(initialTemplate.wires);
  const [code, setCode] = useState(initialTemplate.code);
  const [activeWireColor, setActiveWireColor] = useState(WIRE_COLORS[0].hex);
  const [muted, setMuted] = useState(false);

  const { status, runtime, logs, runCode, stopCode, sendInputs, clearLogs } =
    useSimulation(powerSelect);

  const netlist = useMemo(
    () => evaluateCircuit(components, wires, runtime),
    [components, wires, runtime]
  );

  // Sync interactive sensor inputs to worker whenever they change
  useEffect(() => {
    if (status === 'running') {
      sendInputs({
        pinInputs: netlist.pinInputs,
        ultrasonicDistances: netlist.ultrasonicDistances,
      });
    }
  }, [status, netlist.pinInputs, netlist.ultrasonicDistances, sendInputs]);

  // Sync buzzer sound
  useEffect(() => {
    buzzerAudio.setMuted(muted);
    if (status !== 'running') {
      buzzerAudio.stop();
      return;
    }
    const activeFreq = Object.values(netlist.buzzerOutputs).find((f) => f > 0) ?? 0;
    buzzerAudio.updateFrequency(activeFreq);
  }, [status, muted, netlist.buzzerOutputs]);

  const handleLoadTemplate = (templateId: string) => {
    const tpl = STARTER_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    if (status === 'running' || status === 'loading-python') {
      stopCode();
    }
    setSelectedTemplateId(tpl.id);
    setPowerSelect(tpl.powerSelect);
    setComponents(tpl.components.map((c) => ({ ...c, props: { ...c.props } })));
    setWires(tpl.wires.map((w) => ({ ...w, from: { ...w.from }, to: { ...w.to } })));
    setCode(tpl.code);
  };

  const handleAddComponent = (type: ComponentType) => {
    const spec = COMPONENT_SPECS[type];
    const count = components.filter((c) => c.type === type).length + 1;
    const newComp: PlacedComponent = {
      id: `${type}-${Date.now().toString(36)}`,
      type,
      label: `${spec.name.split(' ')[0]} ${count}`,
      x: 560 + ((count * 22) % 90),
      y: 90 + ((count * 38) % 240),
      props: { ...(spec.defaultProps ?? {}) },
    };
    setComponents((prev) => [...prev, newComp]);
  };

  const handleAddWire = (
    from: { nodeId: string; pinId: string },
    to: { nodeId: string; pinId: string }
  ) => {
    const newWire: Wire = {
      id: `wire-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      from,
      to,
      color: activeWireColor,
    };
    setWires((prev) => [...prev, newWire]);
  };

  const handleDeleteWire = (wireId: string) => {
    setWires((prev) => prev.filter((w) => w.id !== wireId));
  };

  const handleUpdateWireColor = (wireId: string, color: string) => {
    setWires((prev) => prev.map((w) => (w.id === wireId ? { ...w, color } : w)));
  };

  const handleMoveComponent = (compId: string, x: number, y: number) => {
    setComponents((prev) => prev.map((c) => (c.id === compId ? { ...c, x, y } : c)));
  };

  const handleDeleteComponent = (compId: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== compId));
    setWires((prev) =>
      prev.filter((w) => w.from.nodeId !== compId && w.to.nodeId !== compId)
    );
  };

  const handleUpdateComponentProp = (
    compId: string,
    key: string,
    value: string | number | boolean
  ) => {
    setComponents((prev) =>
      prev.map((c) =>
        c.id === compId ? { ...c, props: { ...c.props, [key]: value } } : c
      )
    );
  };

  const handleDownloadCode = () => {
    const blob = new Blob([code], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'code.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  const isRunningOrLoading = status === 'running' || status === 'loading-python';

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Studio Header */}
      <header className="flex h-13 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 shadow">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white">
                IdeaBoard Studio
              </h1>
              <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold text-sky-300">
                CircuitPython Sim
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Simulador web interactivo para CRCibernética IdeaBoard
            </p>
          </div>
        </div>

        {/* Center: Starter Template Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Ejemplo:</span>
          <select
            value={selectedTemplateId}
            onChange={(e) => handleLoadTemplate(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-200 outline-none focus:border-sky-500"
          >
            {STARTER_TEMPLATES.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.title}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Run / Stop / Audio / Download */}
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/CRCibernetica/circuitpython-ideaboard/wiki"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 md:flex"
            title="Abrir Wiki oficial de IdeaBoard"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Wiki
          </a>

          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className="rounded-lg border border-slate-700 bg-slate-800/80 p-1.5 text-slate-300 hover:bg-slate-800"
            title={muted ? 'Activar sonido del buzzer' : 'Silenciar buzzer'}
          >
            {muted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={handleDownloadCode}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800"
            title="Descargar code.py para tu IdeaBoard física"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar code.py
          </button>

          {!isRunningOrLoading ? (
            <button
              type="button"
              onClick={() =>
                runCode(code, {
                  pinInputs: netlist.pinInputs,
                  ultrasonicDistances: netlist.ultrasonicDistances,
                })
              }
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-emerald-500"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Ejecutar simulación
            </button>
          ) : (
            <button
              type="button"
              onClick={stopCode}
              className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-rose-500"
            >
              {status === 'loading-python' ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Cargando Python...
                </>
              ) : (
                <>
                  <Square className="h-3.5 w-3.5 fill-current" />
                  Detener
                </>
              )}
            </button>
          )}
        </div>
      </header>

      {/* Main 3-Pane Studio */}
      <div className="flex min-h-0 flex-1">
        <ComponentPalette onAddComponent={handleAddComponent} />

        <main className="min-w-0 flex-1">
          <CircuitCanvas
            components={components}
            wires={wires}
            runtime={runtime}
            powerSelect={powerSelect}
            netlist={netlist}
            activeWireColor={activeWireColor}
            onSelectWireColor={setActiveWireColor}
            onAddWire={handleAddWire}
            onDeleteWire={handleDeleteWire}
            onUpdateWireColor={handleUpdateWireColor}
            onMoveComponent={handleMoveComponent}
            onDeleteComponent={handleDeleteComponent}
            onUpdateComponentProp={handleUpdateComponentProp}
            onTogglePowerSelect={() =>
              setPowerSelect((p) => (p === 'Vin' ? '3.3v' : 'Vin'))
            }
            onResetBoard={() => {
              if (isRunningOrLoading) {
                stopCode();
                setTimeout(() => {
                  runCode(code, {
                    pinInputs: netlist.pinInputs,
                    ultrasonicDistances: netlist.ultrasonicDistances,
                  });
                }, 120);
              }
            }}
          />
        </main>

        <section className="w-[430px] shrink-0 xl:w-[490px]">
          <CodeAndConsolePanel
            code={code}
            onChangeCode={setCode}
            logs={logs}
            onClearLogs={clearLogs}
            runtime={runtime}
          />
        </section>
      </div>
    </div>
  );
}

export default App;
