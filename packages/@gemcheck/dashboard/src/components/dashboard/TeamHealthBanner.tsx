import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

interface TeamHealthBannerProps {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  issues: string[];
}

export const TeamHealthBanner = ({ score, grade, issues }: TeamHealthBannerProps) => {
  const getGradeColor = (g: string) => {
    switch (g) {
      case 'A': return 'bg-green-400 text-black border-black dark:border-white';
      case 'B': return 'bg-yellow-300 text-black border-black dark:border-white';
      case 'C': return 'bg-orange-400 text-black border-black dark:border-white';
      case 'D': return 'bg-red-500 text-white border-black dark:border-white';
      case 'F': return 'bg-red-900 text-white border-black dark:border-white';
      default: return 'bg-gray-400 text-black border-black dark:border-white';
    }
  };

  const getGradeIcon = (g: string) => {
    switch (g) {
      case 'A': return <CheckCircle size={24} />;
      case 'B': return <Info size={24} />;
      case 'C': return <AlertTriangle size={24} />;
      case 'D': 
      case 'F': return <XCircle size={24} />;
      default: return <Info size={24} />;
    }
  };

  const gradeColor = getGradeColor(grade);

  return (
    <div className={`border-4 p-6 mb-8 shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,1)] ${gradeColor}`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Grade Section */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center justify-center bg-white text-black border-4 border-black w-24 h-24 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <span className="text-6xl font-black">{grade}</span>
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase flex items-center gap-2">
              {getGradeIcon(grade)} Team Health Score
            </h2>
            <p className="font-bold text-lg opacity-90 mt-1">
              Puntuación: {score}/100
            </p>
          </div>
        </div>

        {/* Issues List */}
        <div className="w-full md:w-1/2">
          {issues.length === 0 ? (
            <div className="bg-white/20 p-4 border-2 border-current font-bold">
              ¡Excelente trabajo! No se detectaron problemas críticos en el flujo de trabajo del equipo.
            </div>
          ) : (
            <div className="bg-white text-black border-2 border-black p-4 max-h-32 overflow-y-auto shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <h4 className="font-black uppercase mb-2 text-sm border-b-2 border-black pb-1">Áreas de Mejora Detectadas</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm font-medium">
                {issues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
