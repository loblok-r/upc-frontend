import React from 'react';
import { Search, MessageSquare, Image, Type, Clock, MoreHorizontal, Filter,Trash2  } from 'lucide-react';
import type { HistoryItem } from '../../types';

interface HistoryViewProps {
  historyItems: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onDeleteHistory: (id: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ historyItems, onSelectHistory, onDeleteHistory }) => {

  return (
    // 1. 容器：保持与 DocumentsView 一致的动画和基础样式，使用 padding
    <div className="animate-fade-in px-8 py-8 w-full h-full overflow-y-auto">
      
      {/* 2. 头部区域：完全复刻 DocumentsView 的结构 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          {/* 修改：移除 font-serif，保持 sans-serif，字号颜色一致 */}
          <h1 className="text-3xl font-bold text-white mb-2">历史记录</h1> 
          <p className="text-gray-400">查看并回顾您与 AI 的过往对话</p>
        </div>
        
        {/* 右侧按钮：可选，这里放一个筛选按钮示例，保持布局平衡 */}
        <div className="flex gap-3">
            <button className="bg-[#1A1D2D] border border-white/10 text-gray-300 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2">
                <Filter size={18} />
                <span className="text-sm">筛选</span>
            </button>
        </div>
      </div>

      {/* 3. 搜索栏：复刻 DocumentsView 的搜索栏，保持视觉一致性 */}
      <div className="relative mb-10">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-500" />
        </div>
        <input
          type="text"
          className="block w-full pl-11 pr-4 py-3 bg-[#131522] border border-white/5 rounded-xl text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
          placeholder="搜索历史记录..."
        />
      </div>

      <div className="space-y-4">
        {historyItems.map((item) => (
          <div 
            key={item.id} 
            onClick={() => onSelectHistory(item)}
            className="group bg-[#151725] border border-white/5 hover:border-indigo-500/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-900/10 cursor-pointer"
          >
            <div className="flex flex-col gap-4">
                {/* Prompt Text */}
                <div className="text-gray-200 font-medium text-lg leading-relaxed group-hover:text-white transition-colors">
                   {item.messages && item.messages.length > 0 
                      ? item.messages[0].content 
                      : '无内容'}
                </div>

                {/* Metadata Row */}
                <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-white/5 mt-1">
                    {/* Type Badge */}
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#1E2130] text-emerald-400 border border-emerald-500/20">
                        {item.type === 'IMAGE' ? <Image size={12} /> : <Type size={12} />}
                        <span className="font-semibold tracking-wide">
                            {item.type === 'IMAGE' ? 'AI Image' : 'AI Text'}
                        </span>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-3 bg-gray-700"></div>

                    {/* Date */}
                    <div className="flex items-center gap-1.5 font-mono">
                        <Clock size={12} />
                       {new Date(item.timestamp).toLocaleString()}
                    </div>

                    {/* Action Icon (Right aligned) */}
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                        onClick={(e) => {
                            e.stopPropagation(); // 阻止点击事件向上冒泡到父 div
                            console.log("点击了更多选项");
                          }}
                        className="p-1.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                            <MoreHorizontal size={16} />
                        </button>
                    </div>
                </div>
            </div>
          </div>
        ))}

        {historyItems.length === 0 && (
            <div className="text-center py-20">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                    <MessageSquare size={24} />
                </div>
                <p className="text-gray-500">暂无历史记录</p>
            </div>
        )}
        
        <div className="text-center mt-12 mb-12">
            <p className="text-gray-600 text-sm">There's nothing more</p>
        </div>
      </div>
    </div>
  );
};

export default HistoryView;