import { BarChart3, Folder, Copy, GitCommit } from 'lucide-react';

export type TabId = 'metrics' | 'files' | 'duplication' | 'git';

interface TabsNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  showGit?: boolean;
}

export const TabsNavigation = ({ activeTab, onTabChange, showGit }: TabsNavigationProps) => {
  const tabs = [
    { id: 'metrics', label: 'Métricas', icon: <BarChart3 size={20} /> },
    { id: 'files', label: 'Archivos', icon: <Folder size={20} /> },
    { id: 'duplication', label: 'Duplicación', icon: <Copy size={20} /> },
    ...(showGit ? [{ id: 'git' as TabId, label: 'Commits', icon: <GitCommit size={20} /> }] : [])
  ] as const;

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase tracking-widest border-2 transition-transform 
              ${isActive 
                ? 'border-black dark:border-white bg-black text-white dark:bg-white dark:text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,1)] translate-x-[-4px] translate-y-[-4px]' 
                : 'border-black dark:border-white bg-white text-black dark:bg-black dark:text-white hover:-translate-y-1 hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0_0_rgba(255,255,255,1)]'
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
