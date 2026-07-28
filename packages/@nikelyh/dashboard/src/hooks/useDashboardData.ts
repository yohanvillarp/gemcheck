import { useState, useEffect } from 'react';
import type { AuditData } from '../types';

export const useDashboardData = () => {
  const [data, setData] = useState<AuditData | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [gitActivity, setGitActivity] = useState<any | null>(null);
  const [complexityData, setComplexityData] = useState<any | null>(null);

  useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error('Error cargando data.json', err));
      
    fetch('/api/history')
      .then(res => res.json())
      .then(json => {
        if (Array.isArray(json)) setHistory(json);
      })
      .catch(err => console.error('Error cargando historial', err));

    fetch('/api/git')
      .then(res => {
        if (!res.ok) throw new Error('Git data not available');
        return res.json();
      })
      .then(json => setGitActivity(json))
      .catch(() => console.log('No git activity found.'));

    fetch('/api/complexity')
      .then(res => {
        if (!res.ok) throw new Error('Complexity data not available');
        return res.json();
      })
      .then(json => setComplexityData(json))
      .catch(() => console.log('No complexity data found.'));
  }, []);

  return { data, history, gitActivity, complexityData };
};
