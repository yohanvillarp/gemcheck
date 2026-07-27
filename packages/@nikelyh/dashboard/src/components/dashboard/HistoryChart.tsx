import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { HelpCircle } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';
import type { Metrics } from '../../types';

export interface IHistoryRecord {
  id: number;
  projectName: string;
  tdr: number;
  hashSignature: string;
  timestamp: string;
  dataJson: string;
}

interface HistoryChartProps {
  history: IHistoryRecord[];
  isDarkMode: boolean;
}

interface IChartData {
  dateStr: string;
  tdr: number;
  maintainabilityIndex: number;
  duplications: number;
  technicalDebtInMinutes: number;
  totalLinesOfCode: number;
}

type MetricKey = keyof Omit<IChartData, 'dateStr'>;

interface IMetricConfig {
  key: MetricKey;
  label: string;
  name: string;
  tooltip: string;
  color: string;
}

const METRICS_CONFIG: IMetricConfig[] = [
  {
    key: 'tdr',
    label: 'TDR',
    name: 'TDR %',
    tooltip: 'Evolución de la deuda técnica en el tiempo. Cada punto representa un escaneo en el que se detectaron cambios en el código.',
    color: '#ff4500' // Naranja/Rojo
  },
  {
    key: 'maintainabilityIndex',
    label: 'Mantenibilidad',
    name: 'Mantenibilidad',
    tooltip: 'Índice de Mantenibilidad. Valores más altos indican un código más fácil de mantener.',
    color: '#10b981' // Verde
  },
  {
    key: 'duplications',
    label: 'Duplicación',
    name: 'Duplicación %',
    tooltip: 'Porcentaje de código duplicado en el proyecto a lo largo del tiempo.',
    color: '#3b82f6' // Azul
  },
  {
    key: 'technicalDebtInMinutes',
    label: 'Esfuerzo (Min)',
    name: 'Esfuerzo (Min)',
    tooltip: 'Tiempo estimado en minutos para resolver toda la deuda técnica detectada.',
    color: '#8b5cf6' // Morado
  },
  {
    key: 'totalLinesOfCode',
    label: 'LOC',
    name: 'Total LOC',
    tooltip: 'Evolución de la cantidad total de líneas de código (LOC) del proyecto.',
    color: '#f59e0b' // Ámbar
  }
];

export const HistoryChart = ({ history, isDarkMode }: HistoryChartProps) => {
  const [activeMetricKey, setActiveMetricKey] = useState<MetricKey>('tdr');

  if (!history || history.length === 0) {
    return null;
  }

  const chartData: IChartData[] = history.map(h => {
    let parsedMetrics: Partial<Metrics> = {};
    try {
      const parsedData = JSON.parse(h.dataJson);
      if (parsedData && parsedData.metrics) {
        parsedMetrics = parsedData.metrics;
      }
    } catch (e) {
      console.warn('No se pudo parsear dataJson del historial', h.id);
    }

    return {
      dateStr: new Date(h.timestamp).toLocaleDateString() + ' ' + new Date(h.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      tdr: h.tdr,
      maintainabilityIndex: parsedMetrics.maintainabilityIndex ?? 0,
      duplications: parsedMetrics.duplications ?? 0,
      technicalDebtInMinutes: parsedMetrics.technicalDebtInMinutes ?? 0,
      totalLinesOfCode: parsedMetrics.totalLinesOfCode ?? 0
    };
  });

  const activeConfig = METRICS_CONFIG.find(m => m.key === activeMetricKey) || METRICS_CONFIG[0];

  return (
    <div className="border-2 border-black dark:border-white mt-12 p-6 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-lg uppercase tracking-widest font-bold flex items-center gap-2">
          Tendencia Histórica
          <Tooltip text={activeConfig.tooltip}>
            <span className="cursor-help"><HelpCircle size={18} /></span>
          </Tooltip>
        </h2>
        
        <div className="flex flex-wrap gap-2">
          {METRICS_CONFIG.map(metric => (
            <button
              key={metric.key}
              onClick={() => setActiveMetricKey(metric.key)}
              className={`px-4 py-2 border-2 text-sm font-bold uppercase transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0_0_rgba(255,255,255,1)] ${
                activeMetricKey === metric.key 
                  ? 'border-black dark:border-white bg-black text-white dark:bg-white dark:text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,1)]' 
                  : 'border-black dark:border-white bg-white text-black dark:bg-black dark:text-white'
              }`}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#444' : '#ccc'} />
            <XAxis 
              dataKey="dateStr" 
              stroke={isDarkMode ? '#fff' : '#000'}
              tick={{fill: isDarkMode ? '#fff' : '#000', fontSize: 12}}
              tickMargin={10}
            />
            <YAxis 
              stroke={isDarkMode ? '#fff' : '#000'} 
              tick={{fill: isDarkMode ? '#fff' : '#000', fontSize: 12}}
              domain={['auto', 'auto']}
              width={40}
            />
            <RechartsTooltip 
              contentStyle={{
                backgroundColor: isDarkMode ? '#000' : '#fff',
                color: isDarkMode ? '#fff' : '#000',
                border: `2px solid ${isDarkMode ? '#fff' : '#000'}`,
                borderRadius: 0,
                boxShadow: `4px 4px 0 0 ${isDarkMode ? '#fff' : '#000'}`,
                fontFamily: 'monospace'
              }}
              labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
            />
            <Line 
              type="monotone" 
              dataKey={activeConfig.key} 
              name={activeConfig.name}
              stroke={activeConfig.color} 
              strokeWidth={4} 
              dot={{ stroke: activeConfig.color, strokeWidth: 2, r: 4, fill: isDarkMode ? '#000' : '#fff' }}
              activeDot={{ r: 6, stroke: activeConfig.color, strokeWidth: 2, fill: isDarkMode ? '#fff' : '#000' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
