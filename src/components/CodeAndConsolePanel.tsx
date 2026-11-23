import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Terminal, Cpu, Trash2, Code2 } from 'lucide-react';
import { BoardRuntimeState, ConsoleEntry } from '../types/simulator';

interface CodeAndConsolePanelProps {
  code: string;
  onChangeCode: (val: string) => void;
  logs: ConsoleEntry[];
  onClearLogs: () => void;
  runtime: BoardRuntimeState;
}

const INSPECTED_PINS = [
  'IO02',
  'IO04',
  'IO05',
  'IO18',
  'IO19',
  'IO21',
  'IO22',
  'IO23',
  'IO25',
  'IO26',
  'IO27',
  'IO32',
  'IO33',
  'IO34',
  'IO35',
  'IO36',
  'IO39',
];

export const CodeAndConsolePanel: React.FC<CodeAndConsolePanelProps> = ({
  code,
  onChangeCode,
  logs,
  onClearLogs,
  runtime,
}) => {
  const [bottomTab, setBottomTab] = useState<'console' | 'pins'>('console');
  const logEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex h-full w-full flex-col border-l border-slate-800 bg-slate-950">
      {/* Code Editor Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/70 px-3 py-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <Code2 className="h-4 w-4 text-sky-400" />
          <span>code.py (CircuitPython)</span>
        </div>
        <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-400">
          IdeaBoard ESP32
        </span>
      </div>

      {/* Monaco Editor */}
      <div className="min-h-0 flex-1">
        <Editor
          height="100%"
          defaultLanguage="python"
          theme="vs-dark"
          value={code}
          onChange={(val) => onChangeCode(val ?? '')}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            tabSize: 4,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            padding: { top: 10 },
          }}
        />
      </div>

      {/* Bottom Drawer: Serial Console / Pin Inspector */}
      <div className="flex h-56 flex-col border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center justify-between border-b border-slate-800 px-2 py-1">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setBottomTab('console')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                bottomTab === 'console'
                  ? 'bg-slate-800 text-sky-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              Consola Serial
            </button>
            <button
              type="button"
              onClick={() => setBottomTab('pins')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                bottomTab === 'pins'
                  ? 'bg-slate-800 text-emerald-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              Estado de Pines
            </button>
          </div>

          {bottomTab === 'console' && (
            <button
              type="button"
              onClick={onClearLogs}
              className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              title="Limpiar consola"
            >
              <Trash2 className="h-3 w-3" />
              Limpiar
            </button>
          )}
        </div>

        {bottomTab === 'console' ? (
          <div className="flex-1 overflow-y-auto p-2.5 font-mono text-xs leading-relaxed">
            {logs.length === 0 && (
              <div className="text-slate-500">Sin mensajes en consola.</div>
            )}
            {logs.map((entry) => (
              <div
                key={entry.id}
                className={`whitespace-pre-wrap break-words py-0.5 ${
                  entry.level === 'stderr'
                    ? 'text-rose-400'
                    : entry.level === 'system'
                      ? 'text-sky-400/90'
                      : 'text-slate-200'
                }`}
              >
                <span className="mr-2 text-[10px] text-slate-500">[{entry.timestamp}]</span>
                {entry.text}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-2">
            <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
              <div className="rounded bg-slate-900 px-2 py-1 text-slate-300">
                <span className="text-slate-400">MOTOR1: </span>
                <span className="text-amber-300">{Math.round(runtime.motor1Throttle * 100)}%</span>
              </div>
              <div className="rounded bg-slate-900 px-2 py-1 text-slate-300">
                <span className="text-slate-400">MOTOR2: </span>
                <span className="text-amber-300">{Math.round(runtime.motor2Throttle * 100)}%</span>
              </div>
              {INSPECTED_PINS.map((pinId) => {
                const st = runtime.pins[pinId];
                let summary = 'Sin asignar';
                let colorCls = 'text-slate-500';
                if (pinId === 'IO02' && runtime.powered) {
                  const [r, g, b] = runtime.neopixel;
                  summary = `RGB(${r},${g},${b})`;
                  colorCls = 'text-sky-300';
                } else if (st) {
                  if (st.mode === 'DIGITAL_OUT') {
                    summary = st.digitalValue ? 'OUT HIGH' : 'OUT LOW';
                    colorCls = st.digitalValue ? 'text-emerald-400' : 'text-slate-400';
                  } else if (st.mode === 'DIGITAL_IN') {
                    summary = 'INPUT';
                    colorCls = 'text-cyan-300';
                  } else if (st.mode === 'ANALOG_IN') {
                    summary = `ADC ${st.analogValue}`;
                    colorCls = 'text-amber-300';
                  } else if (st.mode === 'PWM') {
                    summary = `PWM ${Math.round(st.pwmDuty * 100)}%`;
                    colorCls = 'text-purple-300';
                  } else if (st.mode === 'SERVO') {
                    summary = `SERVO ${Math.round(st.servoAngle ?? 90)}°`;
                    colorCls = 'text-orange-300';
                  }
                }
                return (
                  <div
                    key={pinId}
                    className="flex items-center justify-between rounded bg-slate-900 px-2 py-1"
                  >
                    <span className="font-semibold text-slate-300">{pinId}</span>
                    <span className={colorCls}>{summary}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
