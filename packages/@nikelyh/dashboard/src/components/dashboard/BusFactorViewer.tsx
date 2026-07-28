import { Users, CheckCircle2, AlertTriangle } from 'lucide-react';

interface BusFactorViewerProps {
  busFactor: any[];
}

export const BusFactorViewer = ({ busFactor }: BusFactorViewerProps) => {
  if (!busFactor || busFactor.length === 0) {
    return (
      <div className="neo-card text-center">
        <CheckCircle2 className="mx-auto mb-4" size={48} />
        <h3 className="text-xl font-bold uppercase mb-2">Conocimiento Distribuido</h3>
        <p className="opacity-70">No se encontraron cuellos de botella de Bus Factor en el historial reciente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="neo-card">
        <h3 className="text-lg font-bold uppercase flex items-center gap-2 mb-2">
          <Users className="text-purple-600 dark:text-purple-400" />
          Riesgo de Fragmentación (Bus Factor)
        </h3>
        <p className="opacity-80">
          Archivos mantenidos casi en su totalidad (≥80%) por un único desarrollador.
          Si esta persona se va del proyecto, estos componentes podrían quedar huérfanos.
        </p>
      </div>

      <div className="grid gap-4">
        {busFactor.map((item, idx) => {
          const isCritical = item.ownershipPercentage >= 90;
          
          return (
            <div 
              key={idx} 
              className={`
                border-2 border-black dark:border-white p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center
                ${isCritical ? 'bg-red-50 dark:bg-red-950/20' : 'bg-white dark:bg-black'}
              `}
            >
              <div className="flex-1 w-full">
                <div className="flex items-center gap-2 mb-1">
                  {isCritical && <AlertTriangle className="text-red-500" size={18} />}
                  <h4 className="font-bold break-all font-mono text-sm md:text-base">{item.file}</h4>
                </div>
                
                <div className="flex flex-col gap-2 mt-3">
                  <div className="flex justify-between text-sm uppercase font-bold">
                    <span>{item.primaryAuthor}</span>
                    <span>{item.ownershipPercentage}%</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-4 bg-gray-200 dark:bg-zinc-800 border-2 border-black dark:border-white overflow-hidden flex">
                    <div 
                      className={`h-full border-r-2 border-black dark:border-white ${isCritical ? 'bg-red-500' : 'bg-purple-500'}`}
                      style={{ width: `${item.ownershipPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col text-right text-sm whitespace-nowrap md:pl-4 mt-2 md:mt-0 w-full md:w-auto">
                <span className="font-bold uppercase opacity-60">Datos</span>
                <span className="font-mono mt-1">{item.totalCommits} Commits Totales</span>
                <span className="font-mono">{item.totalAuthors} Colaborador(es)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
