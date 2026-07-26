import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface ConfigContextType {
  config: any;
  loading: boolean;
  saveConfig: (newConfig: any) => Promise<void>;
  resetConfig: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (err) {
      console.error('Error fetching config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const saveConfig = async (newConfig: any) => {
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      if (res.ok) {
        setConfig(newConfig);
      }
    } catch (err) {
      console.error('Error saving config:', err);
    }
  };

  const resetConfig = async () => {
    try {
      const res = await fetch('/api/config/reset', { method: 'POST' });
      if (res.ok) {
        await fetchConfig();
      }
    } catch (err) {
      console.error('Error resetting config:', err);
    }
  };

  return (
    <ConfigContext.Provider value={{ config, loading, saveConfig, resetConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
