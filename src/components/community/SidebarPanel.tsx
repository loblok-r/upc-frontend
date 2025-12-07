import React, { useState, useEffect } from 'react'; // 1. 引入 useState, useEffect
import { SidebarTab } from '../../types/community';
import { MOCK_USERS, LEADERBOARD_DATA } from '../../data/constants_community';
import { Search, Trophy, X, ChevronRight, TrendingUp, Music, Film, ArrowLeft } from 'lucide-react'; // 2. 引入 ArrowLeft

interface SidebarPanelProps {
  activeTab: SidebarTab;
  onClose: () => void;
}

// 定义排行榜内部的视图状态
type LeaderboardView = 'SUMMARY' | 'ALL_CREATORS' | 'ALL_REMIXES';

const SidebarPanel: React.FC<SidebarPanelProps> = ({ activeTab, onClose }) => {
  // 3. 添加状态来控制当前显示的视图
  const [lbView, setLbView] = useState<LeaderboardView>('SUMMARY');

  // 当 Tab 切换或者关闭时，重置回概览视图
  useEffect(() => {
    if (activeTab !== SidebarTab.LEADERBOARD) {
      setLbView('SUMMARY');
    }
  }, [activeTab]);

  if (activeTab === SidebarTab.HOME || activeTab === SidebarTab.PROFILE) return null;

  // 模拟更多数据 (为了演示长列表效果，实际开发中这里应该是完整的列表数据)
  const FULL_CREATORS_LIST = [...LEADERBOARD_DATA.creators, ...LEADERBOARD_DATA.creators, ...LEADERBOARD_DATA.creators].map((item, i) => ({...item, rank: i + 1}));
  const FULL_REMIXES_LIST = [...LEADERBOARD_DATA.remixes, ...LEADERBOARD_DATA.remixes, ...LEADERBOARD_DATA.remixes].map((item, i) => ({...item, rank: i + 1}));

  return (
    <div className="absolute left-16 top-0 bottom-0 w-[320px] glass-panel z-40 flex flex-col animate-in slide-in-from-left duration-300 border-r border-white/10">
      
      {/* Search Panel Content (保持不变) */}
      {activeTab === SidebarTab.SEARCH && (
        <>
          <div className="p-5 border-b border-white/10">
             <h2 className="text-xl font-bold mb-4">发现用户</h2>
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="搜索创作者..." 
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
             <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">推荐关注</h3>
             <div className="space-y-1">
                {MOCK_USERS.map(user => (
                   <div key={user.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                         <img src={user.avatar} className="w-10 h-10 rounded-full" />
                         <div>
                            <div className="text-sm font-semibold flex items-center gap-1">
                              {user.name} 
                              {user.isVerified && <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-[8px]">✓</div>}
                            </div>
                            <div className="text-xs text-gray-400">{user.handle}</div>
                         </div>
                      </div>
                      <button className="text-xs bg-white text-black font-semibold px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors">
                        关注
                      </button>
                   </div>
                ))}
             </div>
          </div>
        </>
      )}

      {/* Leaderboard Panel Content */}
      {activeTab === SidebarTab.LEADERBOARD && (
        <>
          {/* 4. 排行榜 - 概览视图 (SUMMARY) */}
          {lbView === 'SUMMARY' && (
            <>
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  排行榜
                </h2>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full"><X size={16} /></button>
              </div>

              <div className="flex-1 overflow-y-auto hide-scrollbar">
                {/* Section 1: Creators */}
                <div className="p-4">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <span className="text-sm font-bold text-purple-400 flex items-center gap-2"><Film size={14}/> 热门创作者</span>
                      {/* 点击切换到创作者列表 */}
                      <span 
                        onClick={() => setLbView('ALL_CREATORS')}
                        className="text-xs text-gray-500 hover:text-white cursor-pointer flex items-center transition-colors"
                      >
                        查看全部 <ChevronRight size={12}/>
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {LEADERBOARD_DATA.creators.map((item, idx) => (
                        <div key={item.user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3">
                              <div className={`w-6 text-center font-bold text-lg ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-orange-400' : 'text-gray-600'}`}>
                                  {item.rank}
                              </div>
                              <img src={item.user.avatar} className="w-10 h-10 rounded-full" />
                              <div className="flex flex-col">
                                  <span className="text-sm font-bold">{item.user.name}</span>
                                  <span className="text-xs text-gray-500">{item.user.handle}</span>
                              </div>
                            </div>
                            <button className="text-xs bg-purple-600/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full hover:bg-purple-600 hover:text-white transition-all">
                              支持
                            </button>
                        </div>
                      ))}
                    </div>
                </div>

                {/* Section 2: Remixes */}
                <div className="p-4 pt-0">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <span className="text-sm font-bold text-blue-400 flex items-center gap-2"><Music size={14}/> 热门二创</span>
                      {/* 点击切换到二创列表 */}
                      <span 
                        onClick={() => setLbView('ALL_REMIXES')}
                        className="text-xs text-gray-500 hover:text-white cursor-pointer flex items-center transition-colors"
                      >
                        查看全部 <ChevronRight size={12}/>
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {LEADERBOARD_DATA.remixes.map((item, idx) => (
                        <div key={item.user.id + 'remix'} className="relative overflow-hidden rounded-lg group cursor-pointer h-16 flex items-center px-4 border border-white/5 hover:border-white/20 transition-all bg-gradient-to-r from-white/5 to-transparent">
                            <img src={item.user.avatar} className="absolute left-0 top-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity" />
                            <div className="relative z-10 flex items-center w-full justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-xs font-bold border border-white/10">{item.rank}</div>
                                  <span className="font-semibold text-sm truncate max-w-[100px]">{item.user.name}</span>
                                </div>
                                <img src={`https://picsum.photos/seed/${item.score}/50/50`} className="w-10 h-10 rounded bg-black/50" />
                            </div>
                        </div>
                      ))}
                    </div>
                </div>
              </div>
            </>
          )}

          {/* 5. 排行榜 - 完整列表视图 (Sub-Pages) */}
          {(lbView === 'ALL_CREATORS' || lbView === 'ALL_REMIXES') && (
             <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
                {/* 详情页头部 */}
                <div className="p-5 border-b border-white/10 flex items-center gap-3">
                   <button 
                     onClick={() => setLbView('SUMMARY')} 
                     className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                   >
                     <ArrowLeft size={18} />
                   </button>
                   <h2 className="text-lg font-bold">
                      {lbView === 'ALL_CREATORS' ? '热门创作者榜单' : '热门二创榜单'}
                   </h2>
                </div>

                {/* 详情页列表内容 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                   {/* 根据类型渲染不同的列表 */}
                   {lbView === 'ALL_CREATORS' && FULL_CREATORS_LIST.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3">
                             <div className={`w-8 text-center font-bold text-lg ${idx < 3 ? 'text-yellow-400' : 'text-gray-500'}`}>
                                #{item.rank}
                             </div>
                             <img src={item.user.avatar} className="w-10 h-10 rounded-full" />
                             <div className="flex flex-col">
                                <span className="text-sm font-bold">{item.user.name}</span>
                                <span className="text-xs text-gray-500">粉丝数: {(1000 - idx * 10).toLocaleString()}</span>
                             </div>
                          </div>
                          {idx < 3 && <Trophy size={16} className="text-yellow-500"/>}
                      </div>
                   ))}

                   {lbView === 'ALL_REMIXES' && FULL_REMIXES_LIST.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-white/10">
                          <div className={`text-lg font-bold w-6 text-center ${idx < 3 ? 'text-blue-400' : 'text-gray-600'}`}>{item.rank}</div>
                          <img src={`https://picsum.photos/seed/${item.score + idx}/60/60`} className="w-12 h-12 rounded-lg bg-gray-800" />
                          <div className="flex-1 min-w-0">
                             <div className="text-sm font-semibold truncate">Remix by {item.user.name}</div>
                             <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                                <span className="flex items-center gap-1"><Music size={10}/> 原声使用</span>
                                <span>•</span>
                                <span>{item.score}k 热度</span>
                             </div>
                          </div>
                      </div>
                   ))}
                </div>
             </div>
          )}
        </>
      )}
    </div>
  );
};

export default SidebarPanel;