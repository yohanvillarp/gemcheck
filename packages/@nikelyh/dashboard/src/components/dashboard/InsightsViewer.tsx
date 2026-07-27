import { HelpCircle, Brain, ShieldAlert, GitCommit as GitCommitIcon, Clock, Users, Ghost } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

interface InsightsViewerProps {
  advanced: any;
}

export const InsightsViewer = ({ advanced }: InsightsViewerProps) => {
  if (!advanced) return null;

  const totalAtomicity = advanced.commitAtomicity.small + advanced.commitAtomicity.medium + advanced.commitAtomicity.large;
  const smallPct = totalAtomicity > 0 ? Math.round((advanced.commitAtomicity.small / totalAtomicity) * 100) : 0;
  const mediumPct = totalAtomicity > 0 ? Math.round((advanced.commitAtomicity.medium / totalAtomicity) * 100) : 0;
  const largePct = totalAtomicity > 0 ? Math.round((advanced.commitAtomicity.large / totalAtomicity) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="border-2 border-black dark:border-white p-6 bg-yellow-50 dark:bg-yellow-900/20">
        <h3 className="text-lg font-bold uppercase flex items-center gap-2 mb-2">
          <Brain className="text-yellow-600 dark:text-yellow-400" />
          Métricas Avanzadas (Insights)
        </h3>
        <p className="opacity-80">
          Evaluación empírica de los patrones de desarrollo de tu equipo extraída de la historia evolutiva del repositorio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Defect Density */}
        <div className="border-2 border-black dark:border-white p-6 flex flex-col justify-between">
          <div>
            <h4 className="font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
              <ShieldAlert size={18} />
              <Tooltip text="Densidad de Defectos: Número de commits tipo 'fix' por cada 1,000 líneas de código modificadas históricamente.">
                <span className="cursor-help hover:underline decoration-dashed flex items-center gap-1">
                  Densidad de Defectos <HelpCircle size={14} />
                </span>
              </Tooltip>
            </h4>
            <p className="opacity-70 text-sm mb-4">¿Qué tan frágil es el código al modificarse?</p>
          </div>
          <div className="text-4xl font-bold text-red-500">
            {advanced.defectDensity} <span className="text-lg text-black dark:text-white opacity-50 uppercase">fixes / 1k LOC</span>
          </div>
        </div>

        {/* Friday Fixes */}
        <div className="border-2 border-black dark:border-white p-6 flex flex-col justify-between">
          <div>
            <h4 className="font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
              <Clock size={18} />
              <Tooltip text="Porcentaje de bugs/arreglos que fueron introducidos o solucionados durante los días Viernes.">
                <span className="cursor-help hover:underline decoration-dashed flex items-center gap-1">
                  Viernes Rojos <HelpCircle size={14} />
                </span>
              </Tooltip>
            </h4>
            <p className="opacity-70 text-sm mb-4">Patrones de fatiga al final de la semana.</p>
          </div>
          <div className="text-4xl font-bold text-orange-500">
            {advanced.fridayFixes}% <span className="text-lg text-black dark:text-white opacity-50 uppercase">de los bugs</span>
          </div>
        </div>

        {/* Commit Atomicity */}
        <div className="border-2 border-black dark:border-white p-6 md:col-span-2">
          <h4 className="font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
            <GitCommitIcon size={18} />
            <Tooltip text="Distribución del tamaño de los commits. Commits grandes (+10 archivos) suelen introducir más bugs ocultos.">
              <span className="cursor-help hover:underline decoration-dashed flex items-center gap-1">
                Atomicidad de Commits <HelpCircle size={14} />
              </span>
            </Tooltip>
          </h4>
          <p className="opacity-70 text-sm mb-6">Hábitos de guardado e integración del equipo.</p>
          
          <div className="flex w-full h-8 border-2 border-black dark:border-white mb-3 bg-gray-100">
            <div className="bg-green-400 h-full border-r-2 border-black dark:border-white" style={{ width: `${smallPct}%` }} title={`Pequeños (1-2 archivos): ${smallPct}%`} />
            <div className="bg-yellow-400 h-full border-r-2 border-black dark:border-white" style={{ width: `${mediumPct}%` }} title={`Medianos (3-9 archivos): ${mediumPct}%`} />
            <div className="bg-red-400 h-full" style={{ width: `${largePct}%` }} title={`Grandes (10+ archivos): ${largePct}%`} />
          </div>
          
          <div className="flex justify-between text-xs font-mono uppercase font-bold text-center">
            <div className="flex flex-col items-center w-1/3 text-green-700 dark:text-green-400">
              <span>Pequeños</span>
              <span>{smallPct}% ({advanced.commitAtomicity.small})</span>
            </div>
            <div className="flex flex-col items-center w-1/3 text-yellow-700 dark:text-yellow-400">
              <span>Medianos</span>
              <span>{mediumPct}% ({advanced.commitAtomicity.medium})</span>
            </div>
            <div className="flex flex-col items-center w-1/3 text-red-700 dark:text-red-400">
              <span>Masivos</span>
              <span>{largePct}% ({advanced.commitAtomicity.large})</span>
            </div>
          </div>
        </div>

        {/* Intersection Complexity */}
        <div className="border-2 border-black dark:border-white p-6">
          <h4 className="font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
            <Users size={18} />
            <Tooltip text="Archivos modificados por demasiados desarrolladores distintos. Frecuentemente indican God Objects o cuellos de botella de equipo.">
              <span className="cursor-help hover:underline decoration-dashed flex items-center gap-1">
                Complejidad de Intersección <HelpCircle size={14} />
              </span>
            </Tooltip>
          </h4>
          <p className="opacity-70 text-sm mb-4">Archivos "Cuello de botella".</p>
          
          <ul className="space-y-2">
            {advanced.intersectionComplexity.length === 0 ? (
              <li className="text-sm opacity-50">No hay cuellos de botella detectados.</li>
            ) : (
              advanced.intersectionComplexity.map((item: any, i: number) => (
                <li key={i} className="flex justify-between items-center text-sm font-mono border-b border-dashed border-gray-300 dark:border-gray-700 pb-1">
                  <span className="truncate pr-4" title={item.file}>{item.file}</span>
                  <span className="font-bold text-purple-500 whitespace-nowrap">{item.authorCount} Devs</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Abandoned Files */}
        <div className="border-2 border-black dark:border-white p-6">
          <h4 className="font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
            <Ghost size={18} />
            <Tooltip text="Archivos cuyo autor principal ya no ha hecho modificaciones al repositorio en más de 6 meses. Posible código muerto o huérfano.">
              <span className="cursor-help hover:underline decoration-dashed flex items-center gap-1">
                Archivos Abandonados <HelpCircle size={14} />
              </span>
            </Tooltip>
          </h4>
          <p className="opacity-70 text-sm mb-4">Código huérfano (+6 meses sin tocar).</p>
          
          <ul className="space-y-2">
            {advanced.abandonedFiles.length === 0 ? (
              <li className="text-sm opacity-50">El código se mantiene activo.</li>
            ) : (
              advanced.abandonedFiles.map((item: any, i: number) => (
                <li key={i} className="flex justify-between items-center text-sm font-mono border-b border-dashed border-gray-300 dark:border-gray-700 pb-1">
                  <span className="truncate pr-4" title={item.file}>{item.file}</span>
                  <span className="font-bold text-gray-500 whitespace-nowrap">{item.monthsSinceLastCommit} meses</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
