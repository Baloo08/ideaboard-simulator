import React from 'react';
import {
  Lightbulb,
  CircleDot,
  SlidersHorizontal,
  Gauge,
  Cog,
  Radio,
  Volume2,
  Plus,
} from 'lucide-react';
import { COMPONENT_SPECS } from '../hardware/componentSpecs';
import { ComponentType } from '../types/simulator';

interface ComponentPaletteProps {
  onAddComponent: (type: ComponentType) => void;
}

const ICONS: Record<ComponentType, React.ReactNode> = {
  led: <Lightbulb className="h-4 w-4 text-rose-400" />,
  button: <CircleDot className="h-4 w-4 text-sky-400" />,
  potentiometer: <SlidersHorizontal className="h-4 w-4 text-blue-400" />,
  servo: <Gauge className="h-4 w-4 text-amber-400" />,
  'dc-motor': <Cog className="h-4 w-4 text-yellow-400" />,
  ultrasonic: <Radio className="h-4 w-4 text-cyan-400" />,
  buzzer: <Volume2 className="h-4 w-4 text-purple-400" />,
};

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({ onAddComponent }) => {
  const items = Object.values(COMPONENT_SPECS);

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-slate-800 bg-slate-950">
      <div className="border-b border-slate-800 px-3 py-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Componentes
        </h2>
        <p className="mt-0.5 text-[11px] text-slate-500">
          Haz clic para añadir al circuito
        </p>
      </div>

      <div className="flex-1 space-y-1.5 overflow-y-auto p-2.5">
        {items.map((spec) => (
          <button
            key={spec.type}
            type="button"
            onClick={() => onAddComponent(spec.type)}
            className="group flex w-full items-start gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5 text-left transition-all hover:border-sky-500/60 hover:bg-slate-900"
          >
            <div className="mt-0.5 rounded-lg bg-slate-800 p-1.5">{ICONS[spec.type]}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">{spec.name}</span>
                <Plus className="h-3.5 w-3.5 text-slate-500 group-hover:text-sky-400" />
              </div>
              <p className="mt-0.5 text-[10.5px] leading-snug text-slate-400">
                {spec.shortDesc}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="border-t border-slate-800 bg-slate-900/40 p-3 text-[11px] leading-relaxed text-slate-400">
        <p className="font-semibold text-slate-300">Atajos rápidos:</p>
        <ul className="mt-1 space-y-0.5">
          <li>• Clic en 2 pines = crear cable</li>
          <li>• Arrastrar fondo = mover vista</li>
          <li>• Rueda = zoom / Supr = borrar</li>
        </ul>
      </div>
    </aside>
  );
};
