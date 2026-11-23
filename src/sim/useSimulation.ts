import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BoardRuntimeState,
  ConsoleEntry,
  PowerSelectMode,
  SimulationStatus,
} from '../types/simulator';

const initialRuntime = (powerSelect: PowerSelectMode): BoardRuntimeState => ({
  powered: false,
  powerSelect,
  neopixel: [0, 0, 0],
  neopixelBrightness: 0.35,
  motor1Throttle: 0,
  motor2Throttle: 0,
  pins: {},
});

const formatTime = () => {
  const d = new Date();
  return d.toTimeString().slice(0, 8);
};

export function useSimulation(powerSelect: PowerSelectMode) {
  const workerRef = useRef<Worker | null>(null);
  const [status, setStatus] = useState<SimulationStatus>('idle');
  const [runtime, setRuntime] = useState<BoardRuntimeState>(() => initialRuntime(powerSelect));
  const [logs, setLogs] = useState<ConsoleEntry[]>([
    {
      id: 'init-1',
      timestamp: formatTime(),
      level: 'system',
      text: 'IdeaBoard Studio listo. Presiona "Ejecutar" para iniciar CircuitPython.',
    },
  ]);

  const appendLog = useCallback((level: ConsoleEntry['level'], text: string) => {
    setLogs((prev) => {
      const next = [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: formatTime(),
          level,
          text,
        },
      ];
      return next.length > 250 ? next.slice(next.length - 250) : next;
    });
  }, []);

  useEffect(() => {
    setRuntime((prev) => ({ ...prev, powerSelect }));
  }, [powerSelect]);

  useEffect(() => {
    const workerUrl = `${import.meta.env.BASE_URL}pyodide-worker.js`;
    const worker = new Worker(workerUrl);
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<{ type: string; payload: unknown }>) => {
      const { type, payload } = event.data;
      if (type === 'STATUS') {
        const nextStatus = payload as SimulationStatus;
        setStatus(nextStatus);
        if (nextStatus === 'running') {
          setRuntime((prev) => ({ ...prev, powered: true }));
          appendLog('system', 'Simulación en ejecución (CircuitPython).');
        } else if (nextStatus === 'idle' || nextStatus === 'error') {
          setRuntime((prev) => ({
            ...prev,
            powered: false,
            neopixel: [0, 0, 0],
            motor1Throttle: 0,
            motor2Throttle: 0,
            pins: {},
          }));
        }
      } else if (type === 'STATE_UPDATE') {
        const update = payload as Partial<BoardRuntimeState>;
        setRuntime((prev) => ({
          ...prev,
          powered: true,
          neopixel: update.neopixel ?? prev.neopixel,
          neopixelBrightness: update.neopixelBrightness ?? prev.neopixelBrightness,
          motor1Throttle: update.motor1Throttle ?? prev.motor1Throttle,
          motor2Throttle: update.motor2Throttle ?? prev.motor2Throttle,
          pins: update.pins ?? prev.pins,
        }));
      } else if (type === 'LOG') {
        const logPayload = payload as { level: ConsoleEntry['level']; text: string };
        appendLog(logPayload.level, logPayload.text);
      } else if (type === 'FINISHED') {
        setStatus('idle');
        setRuntime((prev) => ({ ...prev, powered: false }));
      } else if (type === 'ERROR_STOP') {
        setStatus('error');
        setRuntime((prev) => ({ ...prev, powered: false }));
      }
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [appendLog]);

  const runCode = useCallback(
    (
      code: string,
      inputs: {
        pinInputs: Record<string, { digital?: boolean; analog?: number }>;
        ultrasonicDistances: Record<string, number>;
      }
    ) => {
      if (!workerRef.current) return;
      appendLog('system', 'Cargando código en la IdeaBoard...');
      workerRef.current.postMessage({
        type: 'RUN',
        payload: { code, inputs },
      });
    },
    [appendLog]
  );

  const stopCode = useCallback(() => {
    if (!workerRef.current) return;
    workerRef.current.postMessage({ type: 'STOP' });
    appendLog('system', 'Simulación detenida.');
  }, [appendLog]);

  const sendInputs = useCallback(
    (inputs: {
      pinInputs: Record<string, { digital?: boolean; analog?: number }>;
      ultrasonicDistances: Record<string, number>;
    }) => {
      workerRef.current?.postMessage({
        type: 'INPUT_UPDATE',
        payload: inputs,
      });
    },
    []
  );

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    status,
    runtime,
    logs,
    runCode,
    stopCode,
    sendInputs,
    clearLogs,
  };
}
