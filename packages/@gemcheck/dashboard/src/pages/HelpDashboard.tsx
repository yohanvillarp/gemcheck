import { Terminal, Shield, GitCommit, Search, BarChart3 } from 'lucide-react';
import { HelpHeader } from '../components/help/HelpHeader';
import { HelpSidebar } from '../components/help/HelpSidebar';
import { HelpSection } from '../components/help/HelpSection';

export const HelpDashboard = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      
      <HelpHeader />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <HelpSidebar />

        {/* Content */}
        <div className="col-span-2 space-y-12">
          
          <HelpSection 
            id="quickstart" 
            icon={<Terminal size={32} />} 
            title="Empezando"
            className="bg-yellow-100 dark:bg-yellow-900"
          >
            <p className="mb-4 text-lg">Hola! Gemcheck ofrece dos herramientas para ayudarte a entender tu código: un analizador estático (scan) y un analizador del historial (git).</p>
            <div className="bg-black text-white p-4 font-mono text-sm shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]">
              # Ver la ayuda rápida en terminal<br/>
              $ gemcheck help<br/><br/>
              # Ver este manual visual<br/>
              $ gemcheck help --ui
            </div>
          </HelpSection>

          <HelpSection 
            id="scan" 
            icon={<Search size={32} />} 
            title="gemcheck scan"
          >
            <p className="mb-4 text-lg">Este comando le da un vistazo a tu código para encontrar puntos donde podrías mejorar la claridad y reducir duplicación.</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Deuda Técnica:</strong> Una estimación amistosa del tiempo que tomaría limpiar el código de cosas que podrían causar problemas después.</li>
              <li><strong>Duplicación:</strong> Encuentra bloques de código que se repiten para que puedas abstraerlos y mantener tu base de código limpia.</li>
            </ul>
            <div className="bg-black text-white p-4 font-mono text-sm">
              $ gemcheck scan --ui --project ./mi-app
            </div>
          </HelpSection>

          <HelpSection 
            id="git" 
            icon={<GitCommit size={32} />} 
            title="gemcheck git"
          >
            <p className="mb-4 text-lg">Analizamos los commits recientes para descubrir dinámicas del equipo y ver cómo fluye el trabajo conjunto.</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Hotspots:</strong> Archivos que todos tocan mucho y suelen tener bugs. ¡Un buen lugar para hacer refactor!</li>
              <li><strong>Bus Factor:</strong> Nos ayuda a saber si todo el conocimiento de un archivo importante está en la cabeza de una sola persona.</li>
              <li><strong>Team Health Score:</strong> Una forma simple de ver qué tan sano es nuestro ritmo de trabajo y detectar cosas a mejorar.</li>
            </ul>
            <div className="bg-black text-white p-4 font-mono text-sm">
              $ gemcheck git --ui
            </div>
          </HelpSection>

          <HelpSection 
            id="ci" 
            icon={<Shield size={32} />} 
            title="Integración CI/CD"
            isDanger={true}
          >
            <p className="mb-4 text-lg font-bold">Ayuda a mantener la calidad automáticamente en tus flujos de trabajo.</p>
            <p className="mb-4">Al usar la opción <code className="bg-red-200 dark:bg-red-800 px-2 py-1 font-mono">--ci</code>, Gemcheck funciona de forma silenciosa y revisa el Team Health Score. Si la puntuación baja demasiado, nos avisa fallando el proceso (exit 1), lo cual es ideal para detener Pull Requests que podrían afectar la salud del proyecto.</p>
            
            <h4 className="font-black uppercase mb-2">Ejemplo para GitHub Actions:</h4>
            <div className="bg-black text-green-400 p-4 font-mono text-sm mb-4">
              - name: Check Team Health<br/>
              &nbsp;&nbsp;run: npx gemcheck git --ci --min-health-score 85
            </div>
            
            <div className="flex gap-2 items-start mt-4 bg-white dark:bg-black border-2 border-black dark:border-white p-4">
              <BarChart3 className="shrink-0" />
              <p className="text-sm font-medium">Por defecto pedimos una nota mínima de 80. Si por ejemplo un PR hace que un archivo pase a depender de una sola persona, Gemcheck nos avisará para que compartamos ese conocimiento con el equipo.</p>
            </div>
          </HelpSection>

        </div>
      </div>
    </div>
  );
};
