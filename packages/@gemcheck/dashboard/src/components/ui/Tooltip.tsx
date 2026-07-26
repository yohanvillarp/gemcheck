import React from 'react';

export const Tooltip = ({ 
  children, 
  text, 
  position = 'top', 
  align = 'center' 
}: { 
  children: React.ReactNode; 
  text: string; 
  position?: 'top' | 'bottom'; 
  align?: 'center' | 'right' 
}) => {
  const positionClass = position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';
  const alignClass = align === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-0';
  
  return (
    <div className="relative group inline-flex items-center">
      {children}
      <div className={`absolute ${positionClass} ${alignClass} hidden group-hover:block w-64 p-3 bg-black text-white dark:bg-white dark:text-black text-xs normal-case tracking-normal border-2 border-black dark:border-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,1)] z-[100] text-center font-mono`}>
        {text}
      </div>
    </div>
  );
};
