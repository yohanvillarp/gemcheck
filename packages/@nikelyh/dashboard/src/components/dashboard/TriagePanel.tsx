import { useEffect, useState } from 'react';
import { Target, AlertTriangle, AlertCircle, Wand2, CheckCircle2 } from 'lucide-react';

export const TriagePanel = () => {
  const [triageReport, setTriageReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fixingFiles, setFixingFiles] = useState<Record<string, boolean>>({});
  const [fixedFiles, setFixedFiles] = useState<Record<string, boolean>>({});
  const [isFixingAll, setIsFixingAll] = useState(false);

  const reloadData = () => {
    window.location.reload();
  };

  const handleFix = async (files: string[]) => {
    const isMultiple = files.length > 1;
    if (isMultiple) setIsFixingAll(true);
    else setFixingFiles(prev => ({ ...prev, [files[0]]: true }));

    try {
      const res = await fetch('/api/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files, rule: 'var-to-let' })
      });
      if (!res.ok) throw new Error('Error al ejecutar fix');
      
      const rescan = await fetch('/api/rescan', { method: 'POST' });
      if (!rescan.ok) throw new Error('Error al re-escanear');

      if (!isMultiple) setFixedFiles(prev => ({ ...prev, [files[0]]: true }));
      reloadData();
    } catch (err) {
      console.error(err);
      alert('Hubo un error al ejecutar el Auto-Fixer.');
    } finally {
      if (isMultiple) setIsFixingAll(false);
      else setFixingFiles(prev => ({ ...prev, [files[0]]: false }));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/triage');

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Error al obtener el Triage Inteligente.');
        }

        const data = await res.json();
        setTriageReport(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="border-2 border-black dark:border-white p-4 text-center animate-pulse mb-8 font-bold uppercase tracking-widest">Cargando Triage Inteligente...</div>;
  }

  if (error) {
    return (
      <div className="neo-card flex items-start gap-4 mb-8">
        <AlertTriangle className="text-yellow-600 dark:text-yellow-500 mt-1 flex-shrink-0" />
        <div>
          <h3 className="text-lg font-bold uppercase mb-1 text-yellow-900 dark:text-yellow-400">Triage Inteligente no disponible</h3>
          <p className="opacity-80 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const triageList = triageReport?.topFiles || [];
  const astWeight = triageReport?.weightsApplied?.ast || 40;
  const gitWeight = triageReport?.weightsApplied?.git || 60;

  if (triageList.length === 0) {
    return null;
  }

  return (
    <div className="border-2 border-black dark:border-white mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-black">
      <div className="p-4 border-b-2 border-black dark:border-white bg-purple-200 dark:bg-purple-900/30 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Target className="text-purple-700 dark:text-purple-400" />
          <h2 className="text-lg font-bold uppercase tracking-widest text-purple-900 dark:text-purple-100">Triage Inteligente (Top 5 Prioridades)</h2>
        </div>
        <button 
          onClick={() => handleFix(triageList.map((item: any) => item.file))}
          disabled={isFixingAll}
          className="neo-btn-purple flex items-center gap-2 text-xs disabled:opacity-50"
        >
          {isFixingAll ? 'Procesando...' : <><Wand2 size={14} /> Fix All</>}
        </button>
      </div>
      
      <div className="p-4 grid gap-6 bg-gray-50 dark:bg-zinc-950">
        <p className="text-sm opacity-80 mb-2 font-mono">
          Archivos ordenados cruzando su Deuda Técnica ({astWeight}%) con la Frecuencia de Cambios ({gitWeight}%).
        </p>
        {triageList.map((item: any, idx: number) => (
          <div key={idx} className="neo-card !p-4 flex flex-col md:flex-row gap-4 justify-between hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="neo-badge bg-purple-700 text-white text-sm">#{idx + 1}</span>
                <h4 className="font-bold break-all font-mono text-sm md:text-base">{item.file}</h4>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="neo-badge text-xs bg-black text-white dark:bg-white dark:text-black flex items-center gap-1">
                  <AlertCircle size={12} /> Score: {item.priorityScore}
                </span>
                <span className="neo-badge text-xs bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200">
                  Deuda: {item.debtMinutes} min
                </span>
                <span className="neo-badge text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200">
                  Riesgo Git: {item.gitRiskScore}/100
                </span>
              </div>
            </div>
            
            <div className="flex flex-col justify-center text-sm font-mono whitespace-nowrap md:border-l-2 md:border-dashed border-gray-300 dark:border-gray-700 md:pl-4 gap-2">
              <div>
                <div className="opacity-70 mb-1">Actividad en Git:</div>
                <div className="font-bold">{item.commitsCount} Commits</div>
                <div className="text-red-600 dark:text-red-400">{item.fixesCount} Fixes</div>
              </div>
              
              <button 
                onClick={() => handleFix([item.file])}
                disabled={fixingFiles[item.file] || fixedFiles[item.file] || isFixingAll}
                className={`neo-btn mt-2 flex items-center justify-center gap-2 text-xs
                  ${fixedFiles[item.file] 
                    ? '!bg-green-500 !text-white !border-green-600 dark:!border-green-400' 
                    : 'hover:bg-purple-100 dark:hover:bg-purple-900/50'
                  } disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0`}
              >
                {fixedFiles[item.file] ? (
                  <><CheckCircle2 size={14} /> Fixed</>
                ) : fixingFiles[item.file] ? (
                  'Fixing...'
                ) : (
                  <><Wand2 size={14} /> Fix</>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
