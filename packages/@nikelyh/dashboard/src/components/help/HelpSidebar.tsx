import { Terminal, Search, GitCommit, Shield } from 'lucide-react';

export const HelpSidebar = () => {
  return (
    <div className="col-span-1">
      <div className="sticky top-6 border-4 border-black dark:border-white p-6 bg-white dark:bg-black">
        <h3 className="font-black text-xl mb-4 uppercase border-b-2 border-black dark:border-white pb-2">Contenido</h3>
        <ul className="space-y-4 font-bold">
          <li><a href="#quickstart" className="flex items-center gap-2 hover:underline"><Terminal size={18} /> Empezando</a></li>
          <li><a href="#scan" className="flex items-center gap-2 hover:underline"><Search size={18} /> Escaneo de Código (Scan)</a></li>
          <li><a href="#git" className="flex items-center gap-2 hover:underline"><GitCommit size={18} /> Evolución de Equipo (Git)</a></li>
          <li><a href="#complexity" className="flex items-center gap-2 hover:underline"><Search size={18} /> Complejidad de Código</a></li>
          <li><a href="#ci" className="flex items-center gap-2 hover:underline text-red-500"><Shield size={18} /> Integración CI/CD (Gating)</a></li>
        </ul>
      </div>
    </div>
  );
};
