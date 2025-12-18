import React from 'react';
import { Plus, Search, Upload } from 'lucide-react';
import type { DocumentItem } from '../../types';

interface DocumentsViewProps {
  documents: DocumentItem[];
}

const DocumentsView: React.FC<DocumentsViewProps> = ({ documents }) => {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">我的文档</h1>
          <p className="text-gray-400">管理并创建您的 AI 生成内容</p>
        </div>
        <div className="flex gap-3">
            <button className="bg-gradient-to-r from-orange-500 to-pink-600 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-orange-500/20">
                <Plus size={18} />
                新建文章
            </button>
            <button className="bg-[#1A1D2D] border border-white/10 text-gray-300 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors">
                <Upload size={18} />
            </button>
        </div>
      </div>

      <div className="relative mb-10">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-500" />
        </div>
        <input
          type="text"
          className="block w-full pl-11 pr-4 py-3 bg-[#131522] border border-white/5 rounded-xl text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
          placeholder="搜索文档..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group cursor-pointer bg-[#151725] hover:bg-[#1A1D2D] border border-white/5 hover:border-indigo-500/30 rounded-2xl h-56 flex flex-col items-center justify-center transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-[#1E2130] group-hover:bg-[#25283A] flex items-center justify-center mb-3 transition-colors">
            <Plus className="text-gray-400 group-hover:text-white" size={24} />
          </div>
          <span className="text-gray-400 group-hover:text-white font-medium transition-colors">新建文档</span>
        </div>

        {documents.map((doc) => (
          <div key={doc.id} className="group cursor-pointer bg-[#151725] hover:bg-[#1A1D2D] border border-white/5 hover:border-white/10 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5">
            <div className={`h-32 w-full relative ${doc.thumbnailColor} opacity-80 group-hover:opacity-100 transition-opacity`}>
               <div className="absolute top-3 left-3">
                   <span className={`text-[10px] font-bold px-2 py-1 rounded bg-black/40 text-white backdrop-blur-sm border border-white/10`}>
                       {doc.type}
                   </span>
               </div>
               <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-12 h-12 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
               </div>
               <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></div>
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <h3 className="text-gray-200 font-medium truncate mb-1 group-hover:text-white transition-colors">{doc.title}</h3>
              <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
                <span>{doc.updatedAt}</span>
                <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-opacity">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentsView;