import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, CheckCircle2, HelpCircle } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { Tooltip as CustomTooltip } from '../ui/Tooltip';

interface TrendsViewerProps {
  trends: any[];
}

type TrendMetric = 'loc' | 'commits' | 'archivos';

export const TrendsViewer = ({ trends }: TrendsViewerProps) => {
  const { isDarkMode } = useTheme();
  const [activeMetric, setActiveMetric] = useState<TrendMetric>('loc');

  if (!trends || trends.length === 0) {
    return (
      <div className="border-2 border-black dark:border-white p-8 text-center bg-gray-50 dark:bg-zinc-900">
        <CheckCircle2 className="mx-auto mb-4" size={48} />
        <h3 className="text-xl font-bold uppercase mb-2">Sin datos de tendencias</h3>
        <p className="opacity-70">No hay historial reciente para mostrar.</p>
      </div>
    );
  }

  const renderChart = () => {
    if (activeMetric === 'loc') {
      return (
        <>
          <Area 
            type="monotone" dataKey="addedLines" name="Líneas Agregadas"
            stroke="#16a34a" fill="#22c55e" fillOpacity={0.6}
          />
          <Area 
            type="monotone" dataKey="deletedLines" name="Líneas Eliminadas"
            stroke="#dc2626" fill="#ef4444" fillOpacity={0.6}
          />
        </>
      );
    }
    
    if (activeMetric === 'commits') {
      return (
        <>
          <Area 
            type="monotone" dataKey="totalCommits" name="Total Commits"
            stroke="#3b82f6" fill="#60a5fa" fillOpacity={0.6}
          />
          <Area 
            type="monotone" dataKey="fixes" name="Bug Fixes"
            stroke="#8b5cf6" fill="#a78bfa" fillOpacity={0.6}
          />
        </>
      );
    }

    if (activeMetric === 'archivos') {
      return (
        <Area 
          type="monotone" dataKey="filesTouched" name="Archivos Modificados"
          stroke="#f59e0b" fill="#fbbf24" fillOpacity={0.6}
        />
      );
    }
  };

  const getMetricDescription = () => {
    if (activeMetric === 'loc') return 'Visualiza el volumen de código agregado (verde) y eliminado (rojo) por día.';
    if (activeMetric === 'commits') return 'Compara el total de commits diarios (azul) versus los que fueron para arreglar bugs (morado).';
    if (activeMetric === 'archivos') return 'Muestra la dispersión o alcance del trabajo midiendo cuántos archivos se tocaron cada día.';
    return '';
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-black dark:border-white p-6 bg-blue-50 dark:bg-blue-900/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold uppercase flex items-center gap-2 mb-2">
            <TrendingUp className="text-blue-500" />
            Tendencias Históricas
            <CustomTooltip text={getMetricDescription()}>
              <span className="cursor-help text-black dark:text-white"><HelpCircle size={18} /></span>
            </CustomTooltip>
          </h3>
          <p className="opacity-80 text-sm">
            {getMetricDescription()}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: 'loc', label: 'LOC (Agregado/Eliminado)' },
            { id: 'commits', label: 'Commits y Fixes' },
            { id: 'archivos', label: 'Dispersión (Archivos)' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setActiveMetric(btn.id as TrendMetric)}
              className={`px-3 py-1.5 border-2 text-xs font-bold uppercase transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0_0_rgba(255,255,255,1)] ${
                activeMetric === btn.id 
                  ? 'border-black dark:border-white bg-black text-white dark:bg-white dark:text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,1)]' 
                  : 'border-black dark:border-white bg-white text-black dark:bg-black dark:text-white'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-2 border-black dark:border-white p-4 md:p-8 bg-white dark:bg-black">
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#333' : '#eee'} vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke={isDarkMode ? '#888' : '#666'} 
                fontSize={12}
                tickFormatter={(val) => {
                  const parts = val.split('-');
                  if (parts.length === 3) return `${parts[1]}-${parts[2]}`;
                  return val;
                }}
              />
              <YAxis stroke={isDarkMode ? '#888' : '#666'} fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#000' : '#fff',
                  border: `2px solid ${isDarkMode ? '#fff' : '#000'}`,
                  borderRadius: 0,
                  boxShadow: isDarkMode ? '4px 4px 0px 0px rgba(255,255,255,0.2)' : '4px 4px 0px 0px rgba(0,0,0,0.2)'
                }}
                labelStyle={{ fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000', marginBottom: '8px' }}
                itemStyle={{ fontWeight: 'bold' }}
              />
              {renderChart()}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
