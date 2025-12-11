import React, { useState, useEffect, useCallback } from 'react';
import { SidebarTab } from '../../types/community';
import type { User, LeaderboardItem } from '../../types/community';

import {
   Search, Trophy, X, ChevronRight, Music, Film,
   ArrowLeft, Loader2, Check, User as UserIcon, LogOut,
   Settings, Image as ImageIcon, Heart, Zap, CreditCard, ChevronRight as ArrowRight
} from 'lucide-react';
import api from '../../utils/api'; // 1. 导入 API 实例
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

// ==========================================
// 1. Follow Button Component (API 改造版)
// ==========================================
interface FollowButtonProps {
   userId: string;
   initialIsFollowed?: boolean; // 可选：如果后端返回了关注状态
   className?: string;
   onToggle?: (newStatus: boolean) => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({ userId, initialIsFollowed = false, className, onToggle }) => {
   const [isFollowed, setIsFollowed] = useState(initialIsFollowed);
   const [isLoading, setIsLoading] = useState(false);

   useEffect(() => {
      setIsFollowed(initialIsFollowed);
   }, [initialIsFollowed]);

   const handleFollowClick = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isLoading) return;
      setIsLoading(true);

      try {
         // 调用后端关注接口
         // 假设接口路径: POST /community/users/follow
         // Body: { userId: string }
         await api.post('/community/users/follow', { userId });

         const newStatus = !isFollowed;
         setIsFollowed(newStatus); // 更新自己

         // 通知父组件更新数据
         if (onToggle) {
            onToggle(newStatus);
         }
      } catch (error) {
         console.error('Follow action failed:', error);
         // 可以在这里加个 Toast 提示失败
      } finally {
         setIsLoading(false);
      }
   };

   if (isFollowed) {
      return (
         <button
            onClick={handleFollowClick}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all border border-white/10 bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white flex items-center gap-1 ${className}`}
         >
            {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
            {isLoading ? '' : '已关注'}
         </button>
      );
   }

   return (
      <button
         onClick={handleFollowClick}
         disabled={isLoading}
         className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all flex items-center justify-center min-w-[60px]
        ${isLoading
               ? 'bg-gray-200 text-gray-500 cursor-wait'
               : 'bg-white text-black hover:bg-gray-200'
            } ${className}`}
      >
         {isLoading ? <Loader2 size={12} className="animate-spin" /> : '关注'}
      </button>
   );
};

// ==========================================
// 2. Sidebar Panel Component
// ==========================================

interface SidebarPanelProps {
   activeTab: SidebarTab;
   onClose: () => void;
}

type LeaderboardView = 'SUMMARY' | 'ALL_CREATORS' | 'ALL_NEWCREATORS';

const SidebarPanel: React.FC<SidebarPanelProps> = ({ activeTab, onClose }) => {
   const navigate = useNavigate();
   const location = useLocation();
   const { isLoggedIn, user, logout } = useAuth();

   const [lbView, setLbView] = useState<LeaderboardView>('SUMMARY');

   // --- 搜索与推荐状态 ---
   const [searchQuery, setSearchQuery] = useState('');
   const [displayUsers, setDisplayUsers] = useState<User[]>([]); // 展示的用户列表
   const [isSearchLoading, setIsSearchLoading] = useState(false);

   // --- 排行榜状态 ---
   const [creatorsRanking, setCreatorsRanking] = useState<LeaderboardItem[]>([]);
   const [newcreatorsRanking, setNewcreatorsRanking] = useState<LeaderboardItem[]>([]);
   const [isLbLoading, setIsLbLoading] = useState(false);

   // 模拟登录动作
   const handleLogin = () => {
      navigate('/login', {
         state: {
            from: location.pathname,
            returnTab: SidebarTab.PROFILE
         }
      });
   };

   const handleFollowChange = (userId: string, newStatus: boolean) => {
      console.log(`更新用户 ${userId} 关注状态为: ${newStatus}`);

      // 1. 更新 搜索/推荐列表
      setDisplayUsers(prev => prev.map(u =>
         u.id === userId ? { ...u, isFollowed: newStatus } : u
      ));

      // 2. 更新 创作者榜单
      setCreatorsRanking(prev => prev.map(item =>
         item.author.id === userId
            ? { ...item, author: { ...item.author, isFollowed: newStatus } }
            : item
      ));

      // 3. 更新 新锐榜单
      setNewcreatorsRanking(prev => prev.map(item =>
         item.author.id === userId
            ? { ...item, author: { ...item.author, isFollowed: newStatus } }
            : item
      ));
   };

   const handleLogout = () => {
      logout();
   };

   // ==========================================
   // 核心逻辑：获取推荐用户 (当 Search Query 为空时)
   // ==========================================
   const fetchRecommendedUsers = useCallback(async () => {
      setIsSearchLoading(true);
      try {
         // 接口：获取推荐关注列表
         const data = await api.get<any, User[]>('/community/users/recommend');
         setDisplayUsers(data || []);
      } catch (error) {
         console.error("Failed to fetch recommended users", error);
         setDisplayUsers([]);
      } finally {
         setIsSearchLoading(false);
      }
   }, []);

   // ==========================================
   // 核心逻辑：获取排行榜数据
   // ==========================================
   const fetchLeaderboards = useCallback(async (type: 'creators' | 'newcreators' | 'all') => {
      setIsLbLoading(true);
      try {
         if (type === 'creators' || type === 'all') {
            // 接口：创作者榜单
            const data = await api.get<any, LeaderboardItem[]>('/community/leaderboard/creators');
            setCreatorsRanking(data || []);
         }
         if (type === 'newcreators' || type === 'all') {
            // 接口：新锐作者榜单
            const data = await api.get<any, LeaderboardItem[]>('/community/leaderboard/newcreators');
            setNewcreatorsRanking(data || []);
         }
      } catch (error) {
         console.error("Failed to fetch leaderboards", error);
      } finally {
         setIsLbLoading(false);
      }
   }, []);

   // --- Effect: 切换到 SEARCH Tab 时加载推荐 ---
   useEffect(() => {
      if (activeTab === SidebarTab.SEARCH && !searchQuery) {
         fetchRecommendedUsers();
      }
   }, [activeTab, searchQuery, fetchRecommendedUsers]);

   // --- Effect: 切换到 LEADERBOARD Tab 时加载榜单 ---
   useEffect(() => {
      if (activeTab === SidebarTab.LEADERBOARD) {
         setLbView('SUMMARY');
         // 默认加载两个榜单的前几名数据
         fetchLeaderboards('all');
      }
   }, [activeTab, fetchLeaderboards]);

   // --- Effect: 搜索防抖 ---
   useEffect(() => {
      const timer = setTimeout(async () => {
         if (activeTab === SidebarTab.SEARCH) {
            if (searchQuery.trim() === '') {
               // 如果清空，重新获取推荐（或者直接使用缓存的推荐列表）
               if (displayUsers.length === 0) fetchRecommendedUsers();
               return;
            }

            setIsSearchLoading(true);
            try {
               // 接口：搜索用户
               // 路径：/community/users/search?q=xxx
               const results = await api.get<any, User[]>('/community/users/search', {
                  params: { q: searchQuery }
               });
               setDisplayUsers(results || []);
            } catch (error) {
               console.error("Search failed", error);
            } finally {
               setIsSearchLoading(false);
            }
         }
      }, 500); // 500ms 防抖

      return () => clearTimeout(timer);
   }, [searchQuery, activeTab, fetchRecommendedUsers]);


   if (activeTab === SidebarTab.HOME) return null;

   return (
      <div className="absolute left-16 top-0 bottom-0 w-[320px] glass-panel z-40 flex flex-col animate-in slide-in-from-left duration-300 border-r border-white/10 bg-black/80 backdrop-blur-xl">

         {/* ========================================================================= */}
         {/* 1. 搜索面板 */}
         {/* ========================================================================= */}
         {activeTab === SidebarTab.SEARCH && (
            <>
               <div className="p-5 border-b border-white/10">
                  <h2 className="text-xl font-bold mb-4">发现用户</h2>
                  <div className="relative">
                     <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {isSearchLoading ? <Loader2 size={18} className="animate-spin text-purple-400" /> : <Search size={18} />}
                     </div>

                     <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="搜索创作者..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                     />

                     {searchQuery && (
                        <button
                           onClick={() => setSearchQuery('')}
                           className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                        >
                           <X size={14} />
                        </button>
                     )}
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10">
                  <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex justify-between items-center">
                     {searchQuery ? '搜索结果' : '推荐关注'}
                     {isSearchLoading && <span className="text-[10px] text-purple-400">加载中...</span>}
                  </h3>

                  <div className="space-y-1">
                     {!isSearchLoading && displayUsers.length === 0 && (
                        <div className="text-center py-10 text-gray-500 text-sm">
                           {searchQuery ? '未找到相关用户' : '暂无推荐'}
                        </div>
                     )}

                     {displayUsers.map(user => (
                        <div key={user.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group animate-in fade-in duration-300">
                           <div className="flex items-center gap-3">
                              <img src={user.avatar || 'https://github.com/shadcn.png'} className="w-10 h-10 rounded-full object-cover" />
                              <div>
                                 <div className="text-sm font-semibold flex items-center gap-1">
                                    {user.name}
                                    {user.isVerified && <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-[8px] text-white">✓</div>}
                                 </div>
                                 <div className="text-xs text-gray-400 truncate max-w-[120px]">{user.handle}</div>
                              </div>
                           </div>
                           <FollowButton userId={user.id}
                              initialIsFollowed={user.isFollowed} // 
                              onToggle={(val) => handleFollowChange(user.id, val)} //传入回调
                           />
                        </div>
                     ))}
                  </div>
               </div>
            </>
         )}

         {/* ========================================================================= */}
         {/* 2. 排行榜面板 */}
         {/* ========================================================================= */}
         {activeTab === SidebarTab.LEADERBOARD && (
            <>
               {isLbLoading && lbView === 'SUMMARY' && creatorsRanking.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                     <Loader2 size={32} className="animate-spin text-purple-500" />
                  </div>
               ) : (
                  <>
                     {/* Summary View (默认视图) */}
                     {lbView === 'SUMMARY' && (
                        <>
                           <div className="p-5 border-b border-white/10 flex items-center justify-between">
                              <h2 className="text-xl font-bold flex items-center gap-2">排行榜</h2>
                              <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full"><X size={16} /></button>
                           </div>

                           <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">

                              {/* ==================== 1. 热门创作者榜单摘要 (Top 3) ==================== */}
                              <div className="p-4">
                                 <div className="flex items-center justify-between mb-3 px-1">
                                    <span className="text-sm font-bold text-purple-400 flex items-center gap-2">
                                       <Film size={14} /> 热门创作者
                                    </span>
                                    <span onClick={() => setLbView('ALL_CREATORS')} className="text-xs text-gray-500 hover:text-white cursor-pointer flex items-center transition-colors">
                                       查看全部 <ChevronRight size={12} />
                                    </span>
                                 </div>
                                 <div className="space-y-3">
                                    {creatorsRanking.slice(0, 3).map((item, idx) => (
                                       <div key={item.author.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                          <div className="flex items-center gap-3">
                                             {/* 排名数字 */}
                                             <div className={`w-6 text-center font-bold text-lg ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-orange-400' : 'text-gray-600'}`}>
                                                {item.rank || idx + 1}
                                             </div>
                                             {/* 头像 */}
                                             <img src={item.author.avatar || 'https://github.com/shadcn.png'} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                                             {/* 信息文本 */}
                                             <div className="flex flex-col">
                                                <span className="text-sm font-bold truncate max-w-[90px] text-gray-200">{item.author.name}</span>
                                                <span className="text-xs text-gray-500 truncate max-w-[90px]">{item.author.handle}</span>
                                             </div>
                                          </div>
                                          <FollowButton
                                             userId={item.author.id}
                                             initialIsFollowed={item.author?.isFollowed}
                                             onToggle={(val) => handleFollowChange(item.author.id, val)}
                                          />
                                       </div>
                                    ))}
                                    {creatorsRanking.length === 0 && <div className="text-xs text-gray-500 text-center py-4">暂无数据</div>}
                                 </div>
                              </div>

                              {/* ==================== 2. 热门新锐作者榜单摘要 (Top 3) ==================== */}
                              <div className="p-4 pt-0">
                                 <div className="flex items-center justify-between mb-3 px-1">
                                    <span className="text-sm font-bold text-blue-400 flex items-center gap-2">
                                       <Music size={14} /> 热门新锐作者
                                    </span>
                                    <span onClick={() => setLbView('ALL_NEWCREATORS')} className="text-xs text-gray-500 hover:text-white cursor-pointer flex items-center transition-colors">
                                       查看全部 <ChevronRight size={12} />
                                    </span>
                                 </div>
                                 <div className="space-y-3">
                                    {newcreatorsRanking.slice(0, 3).map((item, idx) => (
                                       // 这里使用了完全相同的结构样式
                                       <div key={(item.author.id) + 'new'} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                          <div className="flex items-center gap-3">
                                             {/* 排名数字 - 保持统一的颜色逻辑 */}
                                             <div className={`w-6 text-center font-bold text-lg ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-orange-400' : 'text-gray-600'}`}>
                                                {item.rank || idx + 1}
                                             </div>
                                             {/* 头像 */}
                                             <img src={item.author.avatar || 'https://github.com/shadcn.png'} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                                             {/* 信息文本 */}
                                             <div className="flex flex-col">
                                                <span className="text-sm font-bold truncate max-w-[90px] text-gray-200">{item.author.name}</span>
                                                {/* 区别点：新锐榜单下方显示“热度”而不是handle，以突显数据差异 */}
                                                <span className="text-xs text-gray-500 truncate max-w-[90px] flex items-center gap-1">
                                                   {item.score}k 热度
                                                </span>
                                             </div>
                                          </div>
                                          <FollowButton
                                             userId={item.author.id}
                                             initialIsFollowed={item.author?.isFollowed}
                                             onToggle={(val) => handleFollowChange(item.author.id, val)}
                                          />
                                       </div>
                                    ))}
                                    {newcreatorsRanking.length === 0 && <div className="text-xs text-gray-500 text-center py-4">暂无数据</div>}
                                 </div>
                              </div>
                           </div>
                        </>
                     )}

                     {/* Detail Views (全部榜单) */}
                     {(lbView === 'ALL_CREATORS' || lbView === 'ALL_NEWCREATORS') && (
                        <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
                           <div className="p-5 border-b border-white/10 flex items-center gap-3">
                              <button onClick={() => setLbView('SUMMARY')} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"><ArrowLeft size={18} /></button>
                              <h2 className="text-lg font-bold">{lbView === 'ALL_CREATORS' ? '热门创作者榜单' : '热门新锐作者榜单'}</h2>
                           </div>
                           <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10">

                              {lbView === 'ALL_CREATORS' && creatorsRanking.map((item, idx) => (
                                 <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                       <div className={`w-8 text-center font-bold text-lg ${idx < 3 ? 'text-yellow-400' : 'text-gray-500'}`}>#{item.rank || idx + 1}</div>
                                       <img src={item.author.avatar || 'https://github.com/shadcn.png'} className="w-10 h-10 rounded-full object-cover" />
                                       <div className="flex flex-col">
                                          <span className="text-sm font-bold">{item.author.name}</span>
                                          <span className="text-xs text-gray-500">粉丝数: {item.author.followers?.toLocaleString()}</span>
                                       </div>
                                    </div>
                                    <FollowButton userId={item.author.id}
                                       initialIsFollowed={item.author?.isFollowed} // 从后端获取初始状态
                                       onToggle={(val) => handleFollowChange(item.author?.id, val)} // 传入回调
                                    />
                                 </div>
                              ))}

                              {lbView === 'ALL_NEWCREATORS' && newcreatorsRanking.map((item, idx) => {
                                 const author = item.author;
                                 if (!author) return null;

                                 return (
                                    <div
                                       key={`newcreator-${author.id}`}
                                       className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors"
                                    >
                                       <div className="flex items-center gap-3">
                                          <div className={`w-8 text-center font-bold text-lg ${idx < 3 ? 'text-yellow-400' : 'text-gray-500'}`}>
                                             #{item.rank || idx + 1}
                                          </div>
                                          <img
                                             src={author.avatar || 'https://github.com/shadcn.png'}
                                             className="w-10 h-10 rounded-full object-cover"
                                             alt={author.name}
                                          />
                                          <div className="flex flex-col">
                                             <span className="text-sm font-bold">{author.name}</span>
                                             <span className="text-xs text-gray-500">
                                                {item.score}k 热度
                                             </span>
                                          </div>
                                       </div>
                                       <FollowButton
                                          userId={author.id}
                                          initialIsFollowed={author.isFollowed}
                                          onToggle={(val) => handleFollowChange(author.id, val)}
                                       />
                                    </div>
                                 );
                              })}
                           </div>
                        </div>
                     )}
                  </>
               )}
            </>
         )}

         {/* ========================================================================= */}
         {/* 3. 个人主页面板 (保持原逻辑，无需 API 改造) */}
         {/* ========================================================================= */}
         {activeTab === SidebarTab.PROFILE && (
            <>
               <div className="p-5 border-b border-white/10 flex items-center justify-between">
                  <h2 className="text-xl font-bold">我的主页</h2>
                  <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                     <X size={16} />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto">
                  {!isLoggedIn ? (
                     <div className="flex flex-col items-center justify-center p-8 text-center h-full animate-in fade-in duration-500">
                        <div className="w-24 h-24 bg-gradient-to-tr from-white/5 to-white/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-white/10 shadow-2xl relative">
                           <UserIcon size={48} className="text-gray-400" />
                           <div className="absolute top-0 right-0 w-6 h-6 bg-purple-500 rounded-full blur-lg opacity-50"></div>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-3">开启创作之旅</h3>
                        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                           登录解锁完整功能，<br />管理作品、获取灵感并与社区互动。
                        </p>

                        <button
                           onClick={handleLogin}
                           className="w-full group relative flex items-center justify-center gap-2 py-3.5 bg-white text-black rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-white/10 disabled:opacity-70 disabled:cursor-wait"
                        >
                           <span>立即登录</span>
                        </button>
                     </div>
                  ) : (
                     <div className="p-5 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        {/* 基本信息 */}
                        <div className="flex items-center gap-4 pb-2">
                           <div className="relative">
                              <img src={user?.avatar || 'https://picsum.photos/seed/default/200/200'} className="w-16 h-16 rounded-full border-2 border-white/10 object-cover" />
                              {user?.isMember && (
                                 <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full border border-black">
                                    PRO
                                 </div>
                              )}
                           </div>
                           <div>
                              <div className="text-lg font-bold">{user?.username}</div>
                              <div className="text-sm text-gray-400">{'@' + user?.username}</div>
                           </div>
                        </div>

                        {/* 数据统计 */}
                        <div className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/5">
                           <div className="text-center cursor-pointer hover:opacity-80">
                              <div className="text-lg font-bold">{user?.stats?.works || 0}</div>
                              <div className="text-xs text-gray-500">作品</div>
                           </div>
                           <div className="w-px h-8 bg-white/10"></div>
                           <div className="text-center cursor-pointer hover:opacity-80">
                              <div className="text-lg font-bold">{user?.stats?.followers || 0}</div>
                              <div className="text-xs text-gray-500">粉丝</div>
                           </div>
                           <div className="w-px h-8 bg-white/10"></div>
                           <div className="text-center cursor-pointer hover:opacity-80">
                              <div className="text-lg font-bold">{user?.stats?.likes || 0}</div>
                              <div className="text-xs text-gray-500">获赞</div>
                           </div>
                        </div>

                        {/* 算力卡片 */}
                        <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-xl p-4 border border-purple-500/20 relative overflow-hidden group cursor-pointer">
                           <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                              <Zap size={48} />
                           </div>
                           <div className="relative z-10">
                              <div className="flex items-center gap-2 text-purple-300 text-sm font-medium mb-2">
                                 <Zap size={14} fill="currentColor" /> 剩余算力
                              </div>
                              <div className="text-2xl font-bold mb-2">
                                 {user?.computingPower || 0} <span className="text-sm text-gray-400 font-normal">/ {user?.maxcomputingPower || 1000}</span>
                              </div>
                              <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                                 <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 w-[85%]"></div>
                              </div>
                           </div>
                        </div>

                        {/* 菜单 */}
                        <div className="space-y-1 pt-2">
                           <MenuItem icon={<ImageIcon size={18} />} label="我的作品" hasArrow />
                           <MenuItem icon={<Heart size={18} />} label="收藏夹" hasArrow />
                           <MenuItem icon={<CreditCard size={18} />} label="订阅管理" />
                           <MenuItem icon={<Settings size={18} />} label="设置" />
                        </div>
                     </div>
                  )}
               </div>

               {isLoggedIn && (
                  <div className="p-4 border-t border-white/5">
                     <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full p-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm font-medium"
                     >
                        <LogOut size={18} />
                        退出登录
                     </button>
                  </div>
               )}
            </>
         )}

      </div>
   );
};

// 辅助组件：菜单项
const MenuItem = ({ icon, label, hasArrow }: { icon: React.ReactNode, label: string, hasArrow?: boolean }) => (
   <button className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-colors group">
      <div className="flex items-center gap-3">
         <span className="text-gray-500 group-hover:text-white transition-colors">{icon}</span>
         <span className="text-sm font-medium">{label}</span>
      </div>
      {hasArrow && <ArrowRight size={14} className="text-gray-600 group-hover:text-white transition-colors" />}
   </button>
);

export default SidebarPanel;