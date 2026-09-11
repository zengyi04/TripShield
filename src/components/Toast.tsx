import React from 'react';
import { Check } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

/**
 * Shared toast notification component used across screens.
 * Renders an absolute-positioned banner with consistent styling.
 */
export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[340px] bg-slate-900 text-white p-3 rounded-2xl border border-blue-400 shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in">
      <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
        <Check size={14} strokeWidth={3} />
      </div>
      <span>{message}</span>
    </div>
  );
};
