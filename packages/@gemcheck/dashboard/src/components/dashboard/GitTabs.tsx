import { Activity, Flame, TrendingUp, Users, Link, Brain } from 'lucide-react';

export type GitTabId = 'timeline' | 'hotspots' | 'trends' | 'bus-factor' | 'coupling' | 'insights';

interface GitTabsProps {
  activeTab: GitTabId;
  onTabChange: (tab: GitTabId) => void;
}

export const GitTabs = ({ activeTab, onTabChange }: GitTabsProps) => {
  const tabs = [
    { id: 'timeline' as GitTabId, label: 'Línea de Tiempo', icon: <Activity size={20} /> },
    { id: 'hotspots' as GitTabId, label: 'Hotspots', icon: <Flame size={20} /> },
    { id: 'trends' as GitTabId, label: 'Tendencias', icon: <TrendingUp size={20} /> },
    { id: 'bus-factor' as GitTabId, label: 'Bus Factor', icon: <Users size={20} /> },
    { id: 'coupling' as GitTabId, label: 'Acoplamiento', icon: <Link size={20} /> },
    { id: 'insights' as GitTabId, label: 'Insights', icon: <Brain size={20} /> }
  ];

  return (
    <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-6 py-3 font-bold uppercase tracking-wider
              border-2 border-black dark:border-white transition-all
              ${isActive 
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] translate-y-[-2px]' 
                : 'bg-white text-black dark:bg-black dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-900'
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
