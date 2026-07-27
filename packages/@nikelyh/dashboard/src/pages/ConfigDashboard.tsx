import { useState, useEffect } from 'react';
import { useConfig } from '../hooks/useConfig';
import { Settings, Save, RotateCcw, AlertTriangle } from 'lucide-react';

export const ConfigDashboard = () => {
  const { config, loading, saveConfig, resetConfig } = useConfig();
  const [localConfig, setLocalConfig] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Initialize local config when fetched
  useEffect(() => {
    if (config) setLocalConfig(JSON.parse(JSON.stringify(config)));
  }, [config]);

  if (loading || !localConfig) {
    return (
      <div className="flex justify-center items-center h-64 border-2 border-black dark:border-white">
        <span className="text-xl font-bold uppercase">Cargando Configuración...</span>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    await saveConfig(localConfig);
    setSaving(false);
  };

  const handleReset = async () => {
    if (confirm('¿Estás seguro de restaurar la configuración a los valores por defecto?')) {
      await resetConfig();
    }
  };

  const handleGitChange = (section: string, key: string, value: string) => {
    setLocalConfig({
      ...localConfig,
      git: {
        ...localConfig.git,
        [section]: {
          ...localConfig.git[section],
          [key]: Number(value)
        }
      }
    });
  };

  // Helper to render an input field with tooltip
  const NumberInput = ({ section, name, label, tooltip }: { section: string, name: string, label: string, tooltip: string }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-2 group relative">
        <span className="font-mono text-sm">{label}</span>
        <div className="w-5 h-5 rounded-full border border-black dark:border-white flex items-center justify-center text-xs cursor-help">?</div>
        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-black text-white dark:bg-white dark:text-black text-xs z-10 border border-white dark:border-black shadow-lg">
          {tooltip}
        </div>
      </div>
      <input
        type="number"
        value={localConfig.git[section][name]}
        onChange={(e) => handleGitChange(section, name, e.target.value)}
        className="w-24 p-1 border-2 border-black dark:border-white bg-transparent text-right font-mono outline-none focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black transition-colors"
      />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b-4 border-black dark:border-white pb-4">
        <div>
          <h2 className="text-4xl font-bold uppercase tracking-tighter flex items-center gap-3">
            <Settings size={40} /> Configuración
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2 uppercase text-sm tracking-widest font-semibold">
            Valores globales de análisis
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 border-2 border-black dark:border-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors uppercase font-bold text-sm"
          >
            <RotateCcw size={16} /> Reset
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-black text-white dark:bg-white dark:text-black hover:opacity-80 transition-opacity uppercase font-bold text-sm disabled:opacity-50"
          >
            <Save size={16} /> {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Hotspots */}
        <div className="border-2 border-black dark:border-white p-6 space-y-4">
          <h3 className="text-xl font-bold uppercase border-b border-black dark:border-white pb-2 flex items-center gap-2">
            <AlertTriangle size={20} /> Hotspots (Puntos Calientes)
          </h3>
          <p className="text-sm text-gray-500 mb-4">Umbrales para detectar archivos con alta frecuencia de cambios y bugs.</p>
          <div className="space-y-1">
            <NumberInput section="HOTSPOTS" name="HIGH_COMMITS_THRESHOLD" label="Commits Altos (High)" tooltip="Cantidad mínima de commits para considerar alta frecuencia (suma 30 pts de riesgo)." />
            <NumberInput section="HOTSPOTS" name="MEDIUM_COMMITS_THRESHOLD" label="Commits Medios (Medium)" tooltip="Cantidad mínima de commits para considerar frecuencia media (suma 15 pts)." />
            <NumberInput section="HOTSPOTS" name="HIGH_FIXES_THRESHOLD" label="Fixes Altos (High)" tooltip="Cantidad mínima de commits de tipo fix/bug para considerar alto riesgo (suma 40 pts)." />
            <NumberInput section="HOTSPOTS" name="MEDIUM_FIXES_THRESHOLD" label="Fixes Medios (Medium)" tooltip="Cantidad mínima de commits de tipo fix para riesgo medio (suma 20 pts)." />
            <NumberInput section="HOTSPOTS" name="CRITICAL_SCORE" label="Score Crítico (High Risk)" tooltip="Puntaje mínimo total para catalogar el archivo como Hotspot crítico (Penaliza Team Health)." />
          </div>
        </div>

        {/* Bus Factor */}
        <div className="border-2 border-black dark:border-white p-6 space-y-4">
          <h3 className="text-xl font-bold uppercase border-b border-black dark:border-white pb-2 flex items-center gap-2">
            <AlertTriangle size={20} /> Bus Factor
          </h3>
          <p className="text-sm text-gray-500 mb-4">Umbrales para identificar cuellos de botella y dependencia de desarrolladores.</p>
          <div className="space-y-1">
            <NumberInput section="BUS_FACTOR" name="MIN_COMMITS_TO_EVALUATE" label="Min. Commits (Evaluar)" tooltip="No evaluar archivos con menos de esta cantidad de commits (evita ruido)." />
            <NumberInput section="BUS_FACTOR" name="CRITICAL_OWNERSHIP_PERCENTAGE" label="Propiedad Crítica (%)" tooltip="Porcentaje mínimo de autoría de una sola persona para considerar un riesgo (Ej. 80%)." />
          </div>
        </div>

        {/* Coupling */}
        <div className="border-2 border-black dark:border-white p-6 space-y-4">
          <h3 className="text-xl font-bold uppercase border-b border-black dark:border-white pb-2 flex items-center gap-2">
            <AlertTriangle size={20} /> Acoplamiento Lógico
          </h3>
          <p className="text-sm text-gray-500 mb-4">Umbrales para detectar archivos que cambian juntos muy frecuentemente.</p>
          <div className="space-y-1">
            <NumberInput section="COUPLING" name="MAX_FILES_IN_COMMIT_TO_EVALUATE" label="Max Archivos (Ignorar)" tooltip="Ignorar commits masivos que tocan más de N archivos (suelen ser refactors automáticos)." />
            <NumberInput section="COUPLING" name="MIN_CO_CHANGES" label="Min. Cambios Juntos" tooltip="Veces mínimas que dos archivos deben modificarse en el mismo commit para evaluarlos." />
            <NumberInput section="COUPLING" name="MIN_COUPLING_PERCENTAGE" label="Porcentaje Acoplamiento" tooltip="Porcentaje de veces que cambian juntos respecto al total de commits del archivo (Ej. 75%)." />
          </div>
        </div>
        
        {/* Penalties */}
        <div className="border-2 border-black dark:border-white p-6 space-y-4">
          <h3 className="text-xl font-bold uppercase border-b border-black dark:border-white pb-2 flex items-center gap-2">
            <AlertTriangle size={20} /> Penalizaciones (Team Health)
          </h3>
          <p className="text-sm text-gray-500 mb-4">Puntos descontados de los 100 iniciales del Team Health Score por cada problema.</p>
          <div className="space-y-1">
            <NumberInput section="HEALTH_PENALTIES" name="PER_HIGH_RISK_HOTSPOT" label="Por cada Hotspot Crítico" tooltip="Puntos a restar por cada archivo marcado como Hotspot de riesgo alto." />
            <NumberInput section="HEALTH_PENALTIES" name="PER_CRITICAL_BUS_FACTOR_FILE" label="Por cada Bus Factor Crítico" tooltip="Puntos a restar por cada archivo con dependencia alta de 1 sola persona." />
            <NumberInput section="HEALTH_PENALTIES" name="PER_HIGH_COUPLING_PAIR" label="Por Par Acoplado" tooltip="Puntos a restar por cada par de archivos altamente acoplados lógicamente." />
          </div>
        </div>
      </div>
    </div>
  );
};
