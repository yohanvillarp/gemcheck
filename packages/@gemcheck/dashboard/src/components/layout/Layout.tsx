import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Toggle */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-2xl font-bold uppercase tracking-widest border-b-4 border-black dark:border-white inline-flex items-center gap-3 pb-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-8 h-8 stroke-black dark:stroke-white fill-none" strokeWidth="8" strokeLinejoin="miter">
              <polygon points="30,20 70,20 90,45 50,90 10,45" />
              <polyline points="30,55 45,70 75,35" strokeLinecap="square" />
            </svg>
            gemcheck
          </h1>
          <button 
            onClick={toggleTheme} 
            className="p-2 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
            title="Cambiar tema"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
};
