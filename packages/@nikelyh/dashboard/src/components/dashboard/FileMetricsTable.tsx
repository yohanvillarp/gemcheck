import { HelpCircle } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';
import type { AuditData } from '../../types';

interface FileMetricsTableProps {
  data: AuditData;
}

export const FileMetricsTable = ({ data }: FileMetricsTableProps) => {
  if (!data.fileMetrics || data.fileMetrics.length === 0) {
    return (
      <div className="neo-card !p-0">
        <div className="p-4 border-b-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black">
          <h2 className="text-lg uppercase tracking-widest">Archivos con mayor Deuda Técnica</h2>
        </div>
        <div className="p-8 text-center uppercase tracking-widest">
          No hay métricas por archivo disponibles en este reporte.
        </div>
      </div>
    );
  }

  return (
    <div className="neo-card !p-0">
      <div className="p-4 border-b-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black">
        <h2 className="text-lg uppercase tracking-widest">Archivos con mayor Deuda Técnica</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-black dark:border-white text-sm uppercase">
              <th className="p-4 font-bold">Archivo</th>
              <th className="p-4 font-bold text-right border-l-2 border-black dark:border-white">Líneas</th>
              <th className="p-4 font-bold text-right border-l-2 border-black dark:border-white">
                <Tooltip text="Code Smells (Olores de código): Prácticas de programación que no son bugs, pero indican problemas de diseño o código sucio difícil de mantener." position="bottom" align="right">
                  <span className="inline-flex items-center gap-1 cursor-help hover:underline decoration-dashed underline-offset-4">
                    Smells <HelpCircle size={14} />
                  </span>
                </Tooltip>
              </th>
              <th className="p-4 font-bold text-right border-l-2 border-black dark:border-white">Deuda (Min)</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black dark:divide-white">
            {data.fileMetrics.filter(f => f.debtMinutes > 0).sort((a, b) => b.debtMinutes - a.debtMinutes).slice(0, 50).map((file, idx) => {
              let relativePath = file.filePath;
              if (data.projectName && relativePath.startsWith(data.projectName)) {
                relativePath = relativePath.substring(data.projectName.length);
              }
              if (relativePath.startsWith('/') || relativePath.startsWith('\\')) {
                relativePath = relativePath.substring(1);
              }
              const parts = relativePath.split(/[/\\]/);
              const fileName = parts.pop();
              const dirName = parts.join('/');

              return (
                <tr key={idx} className="hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                  <td className="p-4 text-sm max-w-sm">
                    <div className="font-bold text-base">{fileName}</div>
                    <div className="text-xs opacity-70 truncate font-mono mt-1" title={dirName}>
                      {dirName || './'}
                    </div>
                  </td>
                  <td className="p-4 text-right border-l-2 border-black dark:border-white">{file.linesOfCode}</td>
                  <td className="p-4 text-right border-l-2 border-black dark:border-white">{file.codeSmells}</td>
                  <td className="p-4 text-right border-l-2 border-black dark:border-white font-bold">{file.debtMinutes} min</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
