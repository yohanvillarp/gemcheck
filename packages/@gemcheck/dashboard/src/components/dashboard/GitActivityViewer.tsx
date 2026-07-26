import { AlertTriangle, CheckCircle2, GitMerge } from 'lucide-react';

interface GitActivityViewerProps {
  activity: any; // GitReport
}

export const GitActivityViewer = ({ activity }: GitActivityViewerProps) => {
  if (!activity || !activity.commits) {
    return (
      <div className="border-2 border-black dark:border-white p-8 text-center bg-yellow-100 dark:bg-yellow-900 text-black dark:text-white">
        No se encontró actividad de Git para mostrar. Asegúrate de ejecutar `gemcheck git` en un repositorio.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-2 border-black dark:border-white bg-white dark:bg-black p-6">
        <h2 className="text-2xl font-black uppercase mb-4 flex items-center gap-3">
          <GitMerge size={28} />
          Rama Activa: <span className="bg-black text-white dark:bg-white dark:text-black px-2 py-1 ml-2">{activity.branch}</span>
        </h2>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-red-500 border-2 border-black"></span>
            <span className="font-bold">Alto Riesgo: {activity.summary.highRiskCommits}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-yellow-400 border-2 border-black"></span>
            <span className="font-bold">Medio Riesgo: {activity.summary.mediumRiskCommits}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-green-400 border-2 border-black"></span>
            <span className="font-bold">Bajo Riesgo: {activity.summary.lowRiskCommits}</span>
          </div>
        </div>
      </div>

      <div className="relative border-l-4 border-black dark:border-white ml-6 pl-8 space-y-12 pb-8">
        {activity.commits.map((commit: any) => {
          const isHighRisk = commit.risk.level === 'high';
          const isMediumRisk = commit.risk.level === 'medium';
          
          let bgColor = 'bg-green-400';
          if (isHighRisk) bgColor = 'bg-red-500';
          else if (isMediumRisk) bgColor = 'bg-yellow-400';

          return (
            <div key={commit.hash} className="relative group">
              {/* Nodo de la línea de tiempo */}
              <div className={`absolute -left-[44px] top-1 w-6 h-6 rounded-full border-4 border-black dark:border-white ${bgColor}`} />
              
              <div className={`border-2 border-black dark:border-white bg-white dark:bg-black p-4 transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0_0_rgba(255,255,255,1)]`}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-bold text-lg leading-tight flex items-center gap-2">
                      <span className="font-mono bg-gray-200 dark:bg-gray-800 px-1">{commit.hash.substring(0, 7)}</span>
                      {commit.message}
                    </h3>
                    <p className="text-sm opacity-70 mt-1">Por {commit.author} el {commit.date}</p>
                  </div>
                  
                  <div className="flex gap-4 font-mono font-bold shrink-0">
                    <span className="text-green-600 dark:text-green-400">+{commit.metrics.addedLines}</span>
                    <span className="text-red-600 dark:text-red-400">-{commit.metrics.deletedLines}</span>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap text-xs font-bold uppercase mt-2">
                  <span className={`px-2 py-1 border-2 border-black ${bgColor} text-black flex items-center gap-1`}>
                    {isHighRisk && <AlertTriangle size={14} />}
                    {!isHighRisk && !isMediumRisk && <CheckCircle2 size={14} />}
                    {commit.risk.reason}
                  </span>
                  <span className="px-2 py-1 bg-gray-200 dark:bg-gray-800">
                    {commit.metrics.filesTouched} ARCHIVOS
                  </span>
                  {commit.isFix && (
                    <span className="px-2 py-1 bg-blue-400 text-black border-2 border-black">
                      FIX
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
