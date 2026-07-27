import { Flame, CheckCircle2 } from 'lucide-react';

interface HotspotsViewerProps {
  hotspots: any[];
}

export const HotspotsViewer = ({ hotspots }: HotspotsViewerProps) => {
  if (!hotspots || hotspots.length === 0) {
    return (
      <div className="border-2 border-black dark:border-white p-8 text-center bg-gray-50 dark:bg-zinc-900">
        <CheckCircle2 className="mx-auto mb-4" size={48} />
        <h3 className="text-xl font-bold uppercase mb-2">No se encontraron hotspots</h3>
        <p className="opacity-70">El proyecto parece estar estable en el historial reciente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-2 border-black dark:border-white p-6 bg-yellow-100 dark:bg-yellow-900/30">
        <h3 className="text-lg font-bold uppercase flex items-center gap-2 mb-2">
          <Flame className="text-red-500" />
          Evolutionary Hotspots
        </h3>
        <p className="opacity-80">
          Los archivos listados aquí sufren de alta agitación (churn) y parches constantes. 
          Son los candidatos principales para refactorización.
        </p>
      </div>

      <div className="grid gap-4">
        {hotspots.map((hotspot, idx) => {
          const isHighRisk = hotspot.risk.level === 'high';
          const isMediumRisk = hotspot.risk.level === 'medium';
          
          return (
            <div 
              key={idx} 
              className={`
                border-2 border-black dark:border-white p-4 flex flex-col md:flex-row gap-4 justify-between
                ${isHighRisk ? 'bg-red-50 dark:bg-red-950/20' : isMediumRisk ? 'bg-orange-50 dark:bg-orange-950/20' : 'bg-white dark:bg-black'}
              `}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {isHighRisk && <Flame className="text-red-500" size={18} />}
                  <h4 className="font-bold break-all font-mono text-sm md:text-base">{hotspot.file}</h4>
                </div>
                <p className="text-sm opacity-70 mb-2">{hotspot.risk.reason}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-bold uppercase bg-black text-white dark:bg-white dark:text-black px-2 py-1">
                    Risk Score: {hotspot.risk.score}
                  </span>
                  <span className="text-xs font-bold uppercase bg-gray-200 dark:bg-zinc-800 px-2 py-1">
                    {hotspot.commitsCount} Commits
                  </span>
                  <span className="text-xs font-bold uppercase bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 px-2 py-1">
                    {hotspot.fixesCount} Fixes
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col justify-center items-end text-sm font-mono whitespace-nowrap border-l-2 border-dashed border-gray-300 dark:border-gray-700 pl-4">
                <span className="text-green-600 dark:text-green-400">+{hotspot.addedLines}</span>
                <span className="text-red-600 dark:text-red-400">-{hotspot.deletedLines}</span>
                <span className="opacity-50 border-t border-gray-300 dark:border-gray-700 mt-1 pt-1">
                  = {hotspot.addedLines + hotspot.deletedLines}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
