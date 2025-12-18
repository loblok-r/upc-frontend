import React, { useState, useEffect } from 'react';
import { Search, MessageSquare, Image, Type, Clock, MoreHorizontal, Filter, Trash2 } from 'lucide-react';
import type { HistoryItem } from '../../types';

interface HistoryViewProps {
  historyItems: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onDeleteHistory: (id: string) => void;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ 
  historyItems, 
  onSelectHistory, 
  onDeleteHistory 
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const formatDate = (timestamp: number | string) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '刚刚';
    return date.toLocaleString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  //点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // 过滤函数
  const filteredItems = historyItems.filter(item => {
    if (!searchQuery.trim()) return true;
    
    // 搜索第一条消息的内容
    const firstMessage = item.messages?.[0]?.content || '';
    return firstMessage.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="animate-fade-in px-8 py-8 w-full h-full">
      
      {/* 头部区域 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">历史记录</h1> 
          <p className="text-gray-400">查看并回顾您与 AI 的过往对话</p>
        </div>
        <div className="flex gap-3">
            <button className="bg-[#1A1D2D] border border-white/10 text-gray-300 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2">
                <Filter size={18} />
                <span className="text-sm">筛选</span>
            </button>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="relative mb-10">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-500" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-11 pr-12 py-3 bg-[#131522] border border-white/5 rounded-xl text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
          placeholder="搜索历史记录..."
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
            aria-label="清除搜索"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="space-y-4 pb-20">
        {filteredItems.map((item) => (
          <div 
            key={item.id} 
            onClick={() => onSelectHistory(item)}
            className="group bg-[#151725] border border-white/5 hover:border-indigo-500/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-900/10 cursor-pointer relative"
          >
            <div className="flex flex-col gap-4">
                {/* 文本内容 */}
                <div className="text-gray-200 font-medium text-lg leading-relaxed group-hover:text-white transition-colors line-clamp-2">
                   {item.messages && item.messages.length > 0 
                      ? item.messages[0].content 
                      : '无内容'}
                </div>

                {/* 底部信息栏 */}
                <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-white/5 mt-1 relative">
                    {/* 类型标签 */}
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#1E2130] text-emerald-400 border border-emerald-500/20">
                        {item.type === 'IMAGE' ? <Image size={12} /> : <Type size={12} />}
                        <span className="font-semibold tracking-wide">
                            {item.type === 'IMAGE' ? 'AI Image' : 'AI Text'}
                        </span>
                    </div>

                    <div className="w-px h-3 bg-gray-700"></div>

                    {/* 时间 */}
                    <div className="flex items-center gap-1.5 font-mono">
                        <Clock size={12} />
                        {formatDate(item.timestamp)}
                    </div>

                    {/* 右侧菜单按钮 */}
                    <div className="ml-auto relative">
                        <button 
                          onClick={(e) => {
                            // 阻止冒泡，防止触发 onSelectHistory
                            e.stopPropagation(); 
                            // 切换菜单显示
                            setActiveMenuId(activeMenuId === item.id ? null : item.id);
                          }}
                          className={`p-1.5 rounded-full transition-colors ${
                            activeMenuId === item.id 
                              ? 'bg-white/10 text-white opacity-100' 
                              : 'text-gray-400 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100'
                          }`}
                        >
                            <MoreHorizontal size={16} />
                        </button>

                        {/* 弹出删除菜单 */}
                        {activeMenuId === item.id && (
                          <div className="absolute right-0 bottom-full mb-2 w-32 bg-[#1E2130] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                            <button
                              onClick={(e) => {
                                // 阻止冒泡
                                e.stopPropagation(); 
                                onDeleteHistory(item.id); 
                                setActiveMenuId(null);    
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors text-left"
                            >
                              <Trash2 size={14} />
                              <span>删除</span>
                            </button>
                          </div>
                        )}
                    </div>
                </div>
            </div>
          </div>
        ))}

        {/* 优化空状态显示 */}
        {filteredItems.length === 0 && (
            <div className="h-[40vh] flex flex-col items-center justify-center text-center">
                {searchQuery ? (
                  <>
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-600">
                        <Search size={24} />
                    </div>
                    <p className="text-gray-500">未找到匹配的记录</p>
                    <p className="text-gray-600 text-sm mt-2">尝试使用不同的关键词搜索</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-600">
                        <MessageSquare size={24} />
                    </div>
                    <p className="text-gray-500">暂无历史记录</p>
                  </>
                )}
            </div>
        )}
        
        {/* 添加搜索结果统计信息 */}
        {filteredItems.length > 0 && filteredItems.length < historyItems.length && (
          <div className="text-center mt-8">
            <p className="text-gray-600 text-sm">
              找到 {filteredItems.length} 条记录（共 {historyItems.length} 条）
            </p>
          </div>
        )}
        
        {filteredItems.length > 0 && filteredItems.length === historyItems.length && (
          <div className="text-center mt-8">
              <p className="text-gray-600 text-sm">已加载全部记录</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;