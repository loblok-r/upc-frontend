import React from 'react';
import { Upload, Plus, Search, Filter } from "lucide-react";
import { MOCK_DOCUMENTS } from "../../data/constants";
import { DocumentCard } from "./DocumentCard";
import { Button } from "../ui/Button";

export const DocumentView: React.FC = () => {
  return (
    <main className="flex-1 overflow-y-auto p-8 relative">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">我的文档</h1>
          <p className="text-slate-400 text-sm">管理并创建您的 AI 生成内容</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
            新建文章
          </Button>
          <Button variant="glass" icon={<Upload className="w-4 h-4" />}>
            上传文件
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="mb-8 flex items-center justify-between bg-white/5 p-2 rounded-xl border border-white/5 backdrop-blur-sm">
        <div className="relative flex-1 max-w-md ml-2">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
                type="text" 
                placeholder="搜索文档..." 
                className="w-full bg-transparent border-none focus:ring-0 text-sm text-white pl-9 placeholder-slate-500"
            />
        </div>
        <div className="flex items-center gap-2 pr-2">
            <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <Filter className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 p-4">
        {MOCK_DOCUMENTS.map((doc) => (
          <DocumentCard key={doc.id} doc={doc} />
        ))}
        
        {/* Generating extra dummy items to fill the grid for visual balance similar to the second image vibe */}
        {[1, 2, 3, 4].map((i) => (
            <div key={`ghost-${i}`} className="opacity-0 pointer-events-none" aria-hidden="true">
                <div className="aspect-[4/3]"></div>
            </div>
        ))}
      </div>

      {/* Empty State / Decorative Background Element */}
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
    </main>
  );
};
