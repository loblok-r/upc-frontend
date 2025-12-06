import React from 'react';
import { Plus, FileText, MoreHorizontal } from "lucide-react";
import type { Document } from "../../types";

interface DocumentCardProps {
  doc: Document;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ doc }) => {
  // 1. 新建文档的占位符样式 (Placeholder)
  if (doc.isPlaceholder) {
    return (
      <div className="group relative aspect-[4/3] w-full rounded-xl border border-dashed border-white/10 hover:border-violet-500/50 bg-white/5 hover:bg-white/10 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden">
        {/* 圆圈变大: w-6 -> w-10 */}
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 group-hover:bg-violet-500/20">
          {/* 图标变大: w-3.5 -> w-5 */}
          <Plus className="w-5 h-5 text-slate-400 group-hover:text-violet-400" />
        </div>
        
        {/* 字体变大: text-[11px] -> text-sm (14px) */}
        <h3 className="text-sm text-slate-300 font-medium group-hover:text-white">{doc.title}</h3>
        
        {/* 副标题变大: text-[9px] -> text-xs (12px) */}
        <p className="text-xs text-slate-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">点击创建</p>
        
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </div>
    );
  }

  // 2. 普通文档样式
  return (
    <div className="group relative flex flex-col w-full">
      {/* 缩略图区域 */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-800 border border-white/10 group-hover:border-violet-500/30 transition-colors shadow-sm hover:shadow-md shadow-black/20">
        
        {/* 内容装饰区：Padding 增大 p-2 -> p-3 或 p-4 */}
        <div className={`absolute inset-0 ${doc.thumbnailColor || 'bg-slate-700'} p-3 flex flex-col`}>
             <div className="w-full h-full bg-white/5 rounded-lg border border-white/10 flex items-center justify-center relative overflow-hidden">
                {/* 装饰线条尺寸微调 */}
                <div className="absolute top-2 left-2 w-8 h-1.5 rounded bg-white/20"></div>
                <div className="absolute top-5 left-2 w-12 h-1.5 rounded bg-white/10"></div>
                <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-orange-500/20"></div>
                
                {/* 中心图标显著变大: w-5 -> w-8 */}
                <FileText className="w-8 h-8 text-white/20" />
             </div>
        </div>

        {/* Hover 悬浮层 */}
        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-[1px]">
            {/* 按钮尺寸调整: text-[10px] -> text-xs, padding 增加 */}
            <button className="px-3 py-1.5 bg-violet-600 text-white rounded-md text-xs font-medium hover:bg-violet-500 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200 shadow-lg">
                打开文档
            </button>
        </div>
        
        {/* 类型标签 (Type Badge) - 字体变大 text-[8px] -> text-[10px] */}
        <div className="absolute top-2 left-2 bg-orange-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] shadow-sm">
            {doc.type.toUpperCase()}
        </div>
      </div>

      {/* 底部信息区 - 间距增大 mt-1.5 -> mt-3 */}
      <div className="mt-3 px-1 flex justify-between items-start">
        <div className="flex-1 min-w-0 pr-2">
          {/* 标题 - text-[11px] -> text-sm (14px) */}
          <h3 className="text-slate-200 font-medium text-sm group-hover:text-violet-300 transition-colors truncate">
            {doc.title}
          </h3>
          {/* 日期 - text-[9px] -> text-xs (12px) */}
          <p className="text-xs text-slate-500 mt-0.5 truncate">{doc.date}</p>
        </div>
        
        {/* 菜单按钮 - 稍微变大便于点击 */}
        <button className="text-slate-600 hover:text-white transition-colors p-1 -mr-1 hover:bg-white/5 rounded-full">
            <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};