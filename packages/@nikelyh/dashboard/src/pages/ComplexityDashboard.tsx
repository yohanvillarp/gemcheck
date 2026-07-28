import { LineChart, Brain, AlertTriangle } from 'lucide-react';

export const ComplexityDashboard = ({ complexityData }: { complexityData: any }) => {
  if (!complexityData) return null;

  const { files, totalFunctions, averageComplexity, highestComplexityFunction } = complexityData;

  const highComplexityFiles = files.filter((f: any) => f.maxComplexity > 10).sort((a: any, b: any) => b.maxComplexity - a.maxComplexity);
  
  return (
    <div className="space-y-8 mt-8">
      <div className="flex items-center justify-between border-b-4 border-black dark:border-white pb-4 mb-8">
        <h1 className="text-3xl font-bold uppercase tracking-tight">Complejidad Ciclomática</h1>
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
          <LineChart className="w-5 h-5" />
          <span>Análisis de Complejidad</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric Card 1 */}
        <div className="neo-card">
          <div className="flex items-center gap-3 neo-title">
            <Brain className="w-5 h-5" />
            <h3 className="uppercase">Funciones Analizadas</h3>
          </div>
          <p className="text-4xl font-bold mt-4">{totalFunctions}</p>
        </div>
        
        {/* Metric Card 2 */}
        <div className="neo-card">
          <div className="flex items-center gap-3 neo-title">
            <LineChart className="w-5 h-5" />
            <h3 className="uppercase">Complejidad Promedio</h3>
          </div>
          <p className="text-4xl font-bold mt-4">{(averageComplexity || 0).toFixed(2)}</p>
        </div>

        {/* Highest Complexity Card */}
        {highestComplexityFunction && (
          <div className="neo-card bg-red-100 dark:bg-red-900 relative overflow-hidden group">
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="neo-title">Función Más Compleja</p>
                <p className="text-4xl font-bold mt-4">{highestComplexityFunction.complexity}</p>
                <p className="text-sm mt-4 font-mono font-bold truncate max-w-[200px]" title={highestComplexityFunction.filePath}>
                  {highestComplexityFunction.name} 
                  <br/>
                  <span className="opacity-70 text-xs">{highestComplexityFunction.filePath}</span>
                </p>
              </div>
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="absolute -bottom-8 -right-8 opacity-10 group-hover:scale-110 transition-transform duration-300">
              <AlertTriangle className="w-48 h-48" />
            </div>
          </div>
        )}
      </div>

      <div className="border-2 border-black dark:border-white mt-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
        <h2 className="text-xl font-bold p-4 bg-black text-white dark:bg-white dark:text-black uppercase tracking-wider flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          Archivos con Alta Complejidad (&gt; 10)
        </h2>
        
        {highComplexityFiles.length === 0 ? (
          <div className="p-8 text-center font-bold uppercase tracking-widest bg-white dark:bg-black">
            ¡Felicidades! Ningún archivo tiene funciones con complejidad mayor a 10.
          </div>
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-black">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-black dark:border-white">
                  <th className="neo-table-th">Archivo</th>
                  <th className="neo-table-th text-right border-l-2 border-black dark:border-white">Complejidad Max</th>
                  <th className="neo-table-th text-right border-l-2 border-black dark:border-white">Promedio</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black dark:divide-white">
                {highComplexityFiles.map((file: any) => (
                  <tr key={file.filePath} className="hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                    <td className="p-4 text-sm font-mono font-bold">{file.filePath}</td>
                    <td className="neo-table-td text-right">
                      <span className="neo-badge bg-red-500 text-white">
                        {file.maxComplexity}
                      </span>
                    </td>
                    <td className="neo-table-td text-right font-mono">
                      {(file.averageComplexity || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

