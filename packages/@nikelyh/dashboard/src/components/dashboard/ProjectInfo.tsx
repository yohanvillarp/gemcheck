import { HelpCircle } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';
import { RatingBadge } from './RatingBadge';
import type { AuditData } from '../../types';

const getVerdict = (tdr: number) => {
  if (tdr <= 5) return "El código está en excelente estado. La deuda técnica es mínima.";
  if (tdr <= 10) return "El proyecto es estable, aunque requiere limpieza en componentes específicos.";
  if (tdr <= 20) return "Deuda técnica moderada. Se recomienda refactorizar antes de añadir nuevas funciones complejas.";
  if (tdr <= 50) return "Deuda técnica alta. El código es difícil de mantener y propenso a errores.";
  return "¡Alerta Crítica! La base de código es inmanejable. Refactorización urgente requerida.";
};

interface ProjectInfoProps {
  data: AuditData;
}

export const ProjectInfo = ({ data }: ProjectInfoProps) => {
  const { tdr } = data.metrics;

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-black dark:border-white pb-4 gap-4 mt-8">
      <div className="w-full md:w-2/3">
        <p className="text-sm uppercase tracking-widest mb-1">Proyecto Auditado</p>
        <p className="text-3xl font-bold uppercase">{data.projectName.split(/[/\\]/).pop()}</p>
        <p className="text-sm opacity-70 break-all font-mono mt-2">{data.projectName}</p>
        <p className="text-sm font-bold mt-4 px-3 py-2 bg-black text-white dark:bg-white dark:text-black inline-block shadow-[4px_4px_0_0_rgba(150,150,150,0.5)]">
          Veredicto: {getVerdict(tdr)}
        </p>
      </div>
      <div className="text-left md:text-right w-full md:w-1/3 flex flex-row items-end justify-start md:justify-end">
        <div>
          <p className="text-sm uppercase tracking-widest mb-1 flex items-center justify-start md:justify-end gap-2">
            <Tooltip text="Porcentaje de esfuerzo necesario para arreglar todo el código defectuoso vs reescribirlo.">
              <span className="flex items-center gap-1 cursor-help hover:underline decoration-dashed underline-offset-4">
                Technical Debt Ratio <HelpCircle size={14} />
              </span>
            </Tooltip>
          </p>
          <p className="text-5xl md:text-6xl font-bold">{tdr}%</p>
        </div>
        <RatingBadge tdr={tdr} />
      </div>
    </div>
  );
};
