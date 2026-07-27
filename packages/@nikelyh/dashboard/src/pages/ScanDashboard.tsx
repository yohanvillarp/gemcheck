import { useState } from 'react';
import { DuplicationViewer } from '../components/dashboard/DuplicationViewer';
import { FileMetricsTable } from '../components/dashboard/FileMetricsTable';
import { HistoryChart } from '../components/dashboard/HistoryChart';
import { MetricsSummary } from '../components/dashboard/MetricsSummary';
import { ProjectInfo } from '../components/dashboard/ProjectInfo';
import { TabsNavigation, type TabId } from '../components/dashboard/TabsNavigation';
import { useTheme } from '../hooks/useTheme';
import type { AuditData } from '../types';

interface ScanDashboardProps {
  data: AuditData;
  history: any[];
}

export const ScanDashboard = ({ data, history }: ScanDashboardProps) => {
  const [activeTab, setActiveTab] = useState<TabId>('metrics');
  const { isDarkMode } = useTheme();

  return (
    <>
      {/* Project Info Header */}
      <ProjectInfo data={data} />

      {/* Navegación de Pestañas */}
      <TabsNavigation activeTab={activeTab} onTabChange={setActiveTab} showGit={false} />

      {/* Contenido de la Pestaña Activa */}
      {activeTab === 'metrics' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <MetricsSummary metrics={data.metrics} />
          <HistoryChart history={history} isDarkMode={isDarkMode} />
        </div>
      )}

      {activeTab === 'files' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <FileMetricsTable data={data} />
        </div>
      )}

      {activeTab === 'duplication' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <DuplicationViewer />
        </div>
      )}
    </>
  );
};
