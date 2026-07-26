import { HelpCircle } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';
import type { Metrics } from '../../types';

interface MetricsSummaryProps {
  metrics: Metrics;
}

export const MetricsSummary = ({ metrics }: MetricsSummaryProps) => {
  const { totalLinesOfCode, technicalDebtInMinutes, maintainabilityIndex, duplications } = metrics;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mt-8">
      <div className="border-2 border-black dark:border-white p-6">
        <h3 className="text-sm uppercase tracking-widest mb-2 border-b-2 border-black dark:border-white pb-2">
          <Tooltip text="Líneas de Código (LOC). Total de código ejecutable que el equipo debe mantener.">
            <span className="inline-flex items-center flex-wrap gap-1 cursor-help hover:underline decoration-dashed underline-offset-4">
              Esfuerzo Total <HelpCircle size={14} className="flex-shrink-0" />
            </span>
          </Tooltip>
        </h3>
        <p className="text-3xl">{totalLinesOfCode.toLocaleString()} LOC</p>
      </div>
      <div className="border-2 border-black dark:border-white p-6">
        <h3 className="text-sm uppercase tracking-widest mb-2 border-b-2 border-black dark:border-white pb-2">
          <Tooltip text="Tiempo estimado necesario para limpiar todo el código defectuoso (Smells).">
            <span className="inline-flex items-center flex-wrap gap-1 cursor-help hover:underline decoration-dashed underline-offset-4">
              Deuda Acumulada <HelpCircle size={14} className="flex-shrink-0" />
            </span>
          </Tooltip>
        </h3>
        <p className="text-3xl">{Math.round(technicalDebtInMinutes / 60)} HRS</p>
      </div>
      <div className="border-2 border-black dark:border-white p-6">
        <h3 className="text-sm uppercase tracking-widest mb-2 border-b-2 border-black dark:border-white pb-2">
          <Tooltip text="Porcentaje de líneas de código idénticas o muy similares copiadas a lo largo del proyecto.">
            <span className="inline-flex items-center flex-wrap gap-1 cursor-help hover:underline decoration-dashed underline-offset-4">
              Duplicación <HelpCircle size={14} className="flex-shrink-0" />
            </span>
          </Tooltip>
        </h3>
        <p className="text-3xl">{duplications}%</p>
      </div>
      <div className="border-2 border-black dark:border-white p-6">
        <h3 className="text-sm uppercase tracking-widest mb-2 border-b-2 border-black dark:border-white pb-2">
          <Tooltip text="Índice de 0 a 100. > 85 indica que el código es muy fácil de modificar de forma segura.">
            <span className="inline-flex items-center flex-wrap gap-1 cursor-help hover:underline decoration-dashed underline-offset-4">
              Mantenibilidad <HelpCircle size={14} className="flex-shrink-0" />
            </span>
          </Tooltip>
        </h3>
        <p className="text-3xl">{maintainabilityIndex}/100</p>
      </div>
    </div>
  );
};
