import React from 'react';
import { type LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({ label, icon: Icon, containerClassName, className, ...props }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
           {Icon && <Icon size={14} className="text-slate-400" />}
           {label}
        </label>
      )}
      <div className="relative group">
        <input
          className={`
            w-full px-4 py-3 rounded-lg bg-white border border-slate-200 
            text-slate-800 placeholder-slate-400
            transition-all duration-300 ease-out
            focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10
            group-hover:border-slate-300
            ${className}
          `}
          {...props}
        />
      </div>
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  icon?: LucideIcon;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, icon: Icon, className, ...props }) => {
  return (
    <div className="flex flex-col gap-1.5">
       {label && (
        <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
           {Icon && <Icon size={14} className="text-slate-400" />}
           {label}
        </label>
      )}
      <textarea
        className={`
          w-full px-4 py-3 rounded-lg bg-white border border-slate-200 
          text-slate-800 placeholder-slate-400
          transition-all duration-300 ease-out
          focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10
          min-h-[120px] resize-y
          ${className}
        `}
        {...props}
      />
    </div>
  );
};