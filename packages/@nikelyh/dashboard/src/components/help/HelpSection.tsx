import type { ReactNode } from 'react';

interface HelpSectionProps {
  id: string;
  icon: ReactNode;
  title: string;
  className?: string;
  children: ReactNode;
  isDanger?: boolean;
}

export const HelpSection = ({ id, icon, title, className = '', children, isDanger = false }: HelpSectionProps) => {
  const containerClasses = isDanger
    ? "border-4 border-red-500 p-6 bg-red-50 dark:bg-red-900/20"
    : "border-2 border-black dark:border-white p-6 bg-white dark:bg-gray-800 " + className;

  const titleClasses = isDanger
    ? "text-red-600 dark:text-red-400"
    : "";

  return (
    <section id={id} className="scroll-mt-8">
      <h2 className={`text-3xl font-black uppercase mb-6 flex items-center gap-3 ${titleClasses}`}>
        {icon}
        {title}
      </h2>
      <div className={containerClasses}>
        {children}
      </div>
    </section>
  );
};
