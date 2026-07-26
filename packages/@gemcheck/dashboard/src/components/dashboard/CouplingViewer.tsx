import { Link, CheckCircle2, GitMerge } from 'lucide-react';

interface CouplingViewerProps {
  coupling: any[];
}

export const CouplingViewer = ({ coupling }: CouplingViewerProps) => {
  if (!coupling || coupling.length === 0) {
    return (
      <div className="border-2 border-black dark:border-white p-8 text-center bg-gray-50 dark:bg-zinc-900">
        <CheckCircle2 className="mx-auto mb-4" size={48} />
        <h3 className="text-xl font-bold uppercase mb-2">Bajo Acoplamiento</h3>
        <p className="opacity-70">No se encontraron dependencias ocultas fuertes entre archivos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-2 border-black dark:border-white p-6 bg-pink-100 dark:bg-pink-900/30">
        <h3 className="text-lg font-bold uppercase flex items-center gap-2 mb-2">
          <Link className="text-pink-600 dark:text-pink-400" />
          Acoplamiento Lógico (Logical Coupling)
        </h3>
        <p className="opacity-80">
          Archivos que frecuentemente se modifican juntos en los mismos commits.
          Un porcentaje alto indica que si tocas uno, probablemente romperás el otro si no lo modificas también.
        </p>
      </div>

      <div className="grid gap-4">
        {coupling.map((item, idx) => {
          const isCritical = item.couplingPercentage >= 80;
          
          return (
            <div 
              key={idx} 
              className={`
                border-2 border-black dark:border-white p-4 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center
                ${isCritical ? 'bg-orange-50 dark:bg-orange-950/20' : 'bg-white dark:bg-black'}
              `}
            >
              <div className="flex-1 w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center gap-2 font-mono text-sm break-all">
                  <span className="font-bold">{item.fileA}</span>
                  <GitMerge size={16} className="text-pink-500 hidden md:block" />
                  <span className="font-bold">{item.fileB}</span>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs md:text-sm uppercase font-bold opacity-70">
                    <span>Frecuencia de Co-cambio</span>
                    <span>{item.couplingPercentage}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 dark:bg-zinc-800 border-2 border-black dark:border-white overflow-hidden flex">
                    <div 
                      className={`h-full border-r-2 border-black dark:border-white ${isCritical ? 'bg-pink-600' : 'bg-pink-400'}`}
                      style={{ width: `${item.couplingPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col text-left lg:text-right text-sm whitespace-nowrap lg:pl-4 border-t-2 lg:border-t-0 lg:border-l-2 border-dashed border-gray-300 dark:border-gray-700 pt-2 lg:pt-0 w-full lg:w-auto">
                <span className="font-bold uppercase opacity-60">Estadísticas</span>
                <span className="font-mono mt-1 text-pink-600 dark:text-pink-400">
                  Cambiaron juntos: {item.coChangeCount} veces
                </span>
                <span className="font-mono opacity-70">Commits de A: {item.totalCommitsA}</span>
                <span className="font-mono opacity-70">Commits de B: {item.totalCommitsB}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
