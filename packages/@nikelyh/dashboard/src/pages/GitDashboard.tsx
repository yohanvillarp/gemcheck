import { useState } from 'react';
import { TeamHealthBanner } from '../components/dashboard/TeamHealthBanner';
import { GitActivityViewer } from '../components/dashboard/GitActivityViewer';
import { GitTabs, type GitTabId } from '../components/dashboard/GitTabs';
import { HotspotsViewer } from '../components/dashboard/HotspotsViewer';
import { TrendsViewer } from '../components/dashboard/TrendsViewer';
import { BusFactorViewer } from '../components/dashboard/BusFactorViewer';
import { CouplingViewer } from '../components/dashboard/CouplingViewer';
import { InsightsViewer } from '../components/dashboard/InsightsViewer';

interface GitDashboardProps {
  gitActivity: any;
}

export const GitDashboard = ({ gitActivity }: GitDashboardProps) => {
  const [activeTab, setActiveTab] = useState<GitTabId>('timeline');

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-black dark:border-white pb-4 gap-4 mt-8 mb-8">
        <div className="w-full">
          <p className="text-sm uppercase tracking-widest mb-1">Análisis Evolutivo (Git)</p>
          <p className="text-3xl font-bold uppercase">{gitActivity.projectName}</p>
          <p className="text-sm opacity-70 break-all font-mono mt-2">{gitActivity.projectPath || gitActivity.projectName}</p>
        </div>
      </div>

      {gitActivity.summary.teamHealthGrade && (
        <TeamHealthBanner 
          score={gitActivity.summary.teamHealthScore} 
          grade={gitActivity.summary.teamHealthGrade} 
          issues={gitActivity.summary.healthIssues} 
        />
      )}
      
      <GitTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'timeline' && <GitActivityViewer activity={gitActivity} />}
        {activeTab === 'hotspots' && <HotspotsViewer hotspots={gitActivity.hotspots} />}
        {activeTab === 'trends' && <TrendsViewer trends={gitActivity.trends} />}
        {activeTab === 'bus-factor' && <BusFactorViewer busFactor={gitActivity.busFactor} />}
        {activeTab === 'coupling' && <CouplingViewer coupling={gitActivity.coupling} />}
        {activeTab === 'insights' && <InsightsViewer advanced={gitActivity.advanced} />}
      </div>
    </>
  );
};
