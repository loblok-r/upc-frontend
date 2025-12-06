import React from 'react';
import { Plus, FileText, MoreHorizontal } from "lucide-react";
import { Document } from "../types";

interface DocumentCardProps {
  doc: Document;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ doc }) => {
  if (doc.isPlaceholder) {
    return (
      <div className="group relative aspect-[4/3] rounded-2xl border-2 border-dashed border-white/10 hover:border-violet-500/50 bg-white/5 hover:bg-white/10 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:bg-violet-500/20">
          <Plus className="w-6 h-6 text-slate-400 group-hover:text-violet-400" />
        </div>
        <h3 className="text-slate-300 font-medium group-hover:text-white">{doc.title}</h3>
        <p className="text-xs text-slate-500 mt-1">{doc.date}</p>
        
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </div>
    );
  }

  return (
    <div className="group relative flex flex-col">
      {/* Preview Area */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-800 border border-white/10 group-hover:border-violet-500/30 transition-colors shadow-lg shadow-black/20">
        
        {/* Mock Thumbnail Content */}
        <div className={`absolute inset-0 ${doc.thumbnailColor || 'bg-slate-700'} p-6 flex flex-col`}>
             <div className="w-full h-full bg-white/5 rounded-lg border border-white/10 flex items-center justify-center relative overflow-hidden">
                {/* Abstract content decoration */}
                <div className="absolute top-4 left-4 w-12 h-2 rounded bg-white/20"></div>
                <div className="absolute top-8 left-4 w-20 h-2 rounded bg-white/10"></div>
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-orange-500/20"></div>
                
                <FileText className="w-10 h-10 text-white/20" />
             </div>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
            <button className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-500 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                打开
            </button>
        </div>
        
        {/* Type Badge */}
        <div className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
            {doc.type.toUpperCase()}
        </div>
      </div>

      {/* Meta Info */}
      <div className="mt-3 px-1 flex justify-between items-start">
        <div>
          <h3 className="text-slate-200 font-medium text-sm group-hover:text-violet-300 transition-colors">{doc.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{doc.date}</p>
        </div>
        <button className="text-slate-500 hover:text-white transition-colors">
            <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
