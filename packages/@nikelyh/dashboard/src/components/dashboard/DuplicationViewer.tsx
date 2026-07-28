import { useState } from 'react';
import { File, ChevronDown, ChevronUp, Copy, Loader2, ArrowRight } from 'lucide-react';

interface IDuplicationLocation {
  name: string;
  startLoc: { line: number };
  endLoc: { line: number };
}

interface IDuplicationEntry {
  firstFile: IDuplicationLocation;
  secondFile: IDuplicationLocation;
  lines: number;
  fragment: string;
}

export const DuplicationViewer = () => {
  const [data, setData] = useState<IDuplicationEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const fetchDuplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/duplications');
      if (!res.ok) {
        throw new Error('No se encontraron detalles de duplicación.');
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  if (data === null && !loading && !error) {
    return (
      <div className="border-2 border-black dark:border-white p-6 text-center">
        <h2 className="text-xl font-bold uppercase mb-4 flex items-center justify-center gap-2">
          <Copy size={20} /> Inspección de Duplicaciones
        </h2>
        <p className="mb-6">Carga el reporte detallado para visualizar los fragmentos de código repetidos.</p>
        <button 
          onClick={fetchDuplications}
          className="px-6 py-3 border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-bold uppercase transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0_0_rgba(255,255,255,1)]"
        >
          Cargar Detalles
        </button>
      </div>
    );
  }

  return (
    <div className="neo-card">
      <h2 className="neo-title flex items-center gap-2">
        <Copy size={20} /> Detalle de Duplicaciones (Top 50)
      </h2>

      {loading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="animate-spin" size={32} />
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-2 border-red-500 text-red-700 p-4 font-bold">
          {error}
        </div>
      )}

      {data && data.length === 0 && (
        <div className="text-center py-10 font-bold opacity-70">
          No se encontró código duplicado relevante.
        </div>
      )}

      {data && data.length > 0 && (
        <div className="flex flex-col gap-6 mt-4">
          {data.map((dup, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <div key={index} className="neo-card !p-0 overflow-hidden transition-all">
                <div 
                  className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                  onClick={() => toggleExpand(index)}
                >
                  <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-start md:items-center flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 font-mono text-sm flex-1 min-w-0">
                      <File size={16} className="text-blue-500 flex-shrink-0" />
                      <span className="truncate" title={dup.firstFile.name}>{dup.firstFile.name}</span>
                      <span className="opacity-50 flex-shrink-0">(L{dup.firstFile.startLoc.line}-{dup.firstFile.endLoc.line})</span>
                    </div>
                    
                    <ArrowRight size={16} className="hidden md:block opacity-50 flex-shrink-0" />
                    
                    <div className="flex items-center gap-2 font-mono text-sm flex-1 min-w-0">
                      <File size={16} className="text-orange-500 flex-shrink-0" />
                      <span className="truncate" title={dup.secondFile.name}>{dup.secondFile.name}</span>
                      <span className="opacity-50 flex-shrink-0">(L{dup.secondFile.startLoc.line}-{dup.secondFile.endLoc.line})</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4 md:mt-0 flex-shrink-0">
                    <span className="neo-badge bg-red-100 text-red-800 whitespace-nowrap">{dup.lines} LOC</span>
                    <div className="flex-shrink-0">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="border-t-2 border-black dark:border-white grid grid-cols-1 md:grid-cols-2 divide-y-2 md:divide-y-0 md:divide-x-2 divide-black dark:divide-white bg-gray-50 dark:bg-black">
                    <div className="flex flex-col max-h-[500px]">
                      <div className="p-2 border-b-2 border-black dark:border-white bg-gray-200 dark:bg-zinc-800 font-mono text-xs text-center font-bold sticky top-0 flex items-start md:items-center justify-center gap-2">
                        <File size={14} className="text-blue-500 flex-shrink-0 mt-0.5 md:mt-0" />
                        <span className="break-all text-left md:text-center">{dup.firstFile.name}</span>
                      </div>
                      <pre className="text-xs font-mono overflow-auto p-4 text-gray-800 dark:text-gray-300 h-full">
                        <code>{dup.fragment}</code>
                      </pre>
                    </div>
                    
                    <div className="flex flex-col max-h-[500px]">
                      <div className="p-2 border-b-2 border-black dark:border-white bg-gray-200 dark:bg-zinc-800 font-mono text-xs text-center font-bold sticky top-0 flex items-start md:items-center justify-center gap-2">
                        <File size={14} className="text-orange-500 flex-shrink-0 mt-0.5 md:mt-0" />
                        <span className="break-all text-left md:text-center">{dup.secondFile.name}</span>
                      </div>
                      <pre className="text-xs font-mono overflow-auto p-4 text-gray-800 dark:text-gray-300 h-full">
                        <code>{dup.fragment}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
