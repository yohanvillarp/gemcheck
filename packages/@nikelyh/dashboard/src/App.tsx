import './index.css';
import { useDashboardData } from './hooks/useDashboardData';
import { Layout } from './components/layout/Layout';
import { ScanDashboard } from './pages/ScanDashboard';
import { GitDashboard } from './pages/GitDashboard';
import { HelpDashboard } from './pages/HelpDashboard';
import { ConfigDashboard } from './pages/ConfigDashboard';

function App() {
  const { data, history, gitActivity } = useDashboardData();
  
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');
  const isGitMode = mode === 'git';
  const isHelpMode = mode === 'help';
  const isConfigMode = mode === 'config';

  if (isHelpMode) {
    return (
      <Layout>
        <HelpDashboard />
      </Layout>
    );
  }

  if (isConfigMode) {
    return (
      <Layout>
        <ConfigDashboard />
      </Layout>
    );
  }

  if (!data && !isGitMode) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center text-black dark:text-white">
        <div className="text-xl font-bold border-2 border-black dark:border-white p-8">
          CARGANDO REPORTE...
        </div>
      </div>
    );
  }

  if (isGitMode && !gitActivity) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center text-black dark:text-white">
        <div className="text-xl font-bold border-2 border-black dark:border-white p-8">
          CARGANDO ACTIVIDAD GIT...
        </div>
      </div>
    );
  }

  return (
    <Layout>
      {isGitMode ? (
        <GitDashboard gitActivity={gitActivity} />
      ) : (
        data && <ScanDashboard data={data} history={history} />
      )}
    </Layout>
  );
}

export default App;
