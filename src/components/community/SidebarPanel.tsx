// src/components/community/SidebarPanel.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { SidebarTab } from '../../types/community';
import type { Post, User, LeaderboardItem } from '../../types/community';

import {
   Search, X, ChevronRight, Music, Film,
   ArrowLeft, Loader2, Check, User as UserIcon, LogOut,
   Settings, Image as ImageIcon, Heart, Zap, CreditCard, ChevronRight as ArrowRight, Trash2
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

// ==========================================
// 1. Follow Button Component (API Integration)
// ==========================================
interface FollowButtonProps {
   userId: string;
   initialIsFollowed?: boolean;
   className?: string;
   onToggle?: (newStatus: boolean) => void;
}

interface SwitchProps {
  checked?: boolean;
  onChange?: () => void;
  size?: 'sm' | 'md';
}
const Switch: React.FC<SwitchProps> = ({ checked = false, onChange, size = 'md' }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/30 ${
        checked ? 'bg-purple-500' : 'bg-gray-700'
      } ${size === 'sm' ? 'h-5 w-9' : 'h-6 w-11'}`}
    >
      <span
        className={`inline-block bg-white rounded-full transition-transform ${
          checked ? (size === 'sm' ? 'translate-x-4' : 'translate-x-5') : 'translate-x-0.5'
        } ${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'}`}
      />
    </button>
  );
};

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
         // 调用后端接口
         await api.post('/community/users/follow', { userId });

         const newStatus = !isFollowed;
         setIsFollowed(newStatus);

         // 通知父组件更新数据
         if (onToggle) {
            onToggle(newStatus);
         }
      } catch (error) {
         console.error('Follow action failed:', error);
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
   onSelectPost?: (post: Post) => void;
}

type ProfileView = 'MENU' | 'MY_WORKS' | 'COLLECTIONS' | 'SETTINGS';

type LeaderboardView = 'SUMMARY' | 'ALL_CREATORS' | 'ALL_NEWCREATORS';

const SidebarPanel: React.FC<SidebarPanelProps> = ({ activeTab, onClose, onSelectPost }) => {
   const navigate = useNavigate();
   const location = useLocation();
   const { isLoggedIn, user, logout } = useAuth();

   // 控制个人中心内部视图切换
   const [profileView, setProfileView] = useState<ProfileView>('MENU');

   // --- My Works State (我的作品状态) ---
   const [myWorks, setMyWorks] = useState<Post[]>([]);
   const [isWorksLoading, setIsWorksLoading] = useState(false);
   const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null); // 用于二次确认删除


   const [lbView, setLbView] = useState<LeaderboardView>('SUMMARY');
   // --- Search & Recommend State ---
   const [searchQuery, setSearchQuery] = useState('');
   const [displayUsers, setDisplayUsers] = useState<User[]>([]);
   const [isSearchLoading, setIsSearchLoading] = useState(false);
   // --- Leaderboard State ---
   const [creatorsRanking, setCreatorsRanking] = useState<LeaderboardItem[]>([]);
   const [newcreatorsRanking, setNewcreatorsRanking] = useState<LeaderboardItem[]>([]);
   const [isLbLoading, setIsLbLoading] = useState(false);

   const handleLogin = () => {
      navigate('/login', {
         state: {
            from: location.pathname,
            returnTab: SidebarTab.PROFILE
         }
      });
   };

   //获取我的作品
   const fetchMyWorks = useCallback(async () => {
      if (!isLoggedIn) return;
      setIsWorksLoading(true);
      try {
         // 假设后端接口路径
         const data = await api.get<any, Post[]>('/community/posts/mine');
         setMyWorks(data || []);
      } catch (error) {
         console.error("Failed to fetch my works", error);
      } finally {
         setIsWorksLoading(false);
      }
   }, [isLoggedIn]);


   const handleDeleteWork = async (postId: string) => {
      try {
         await api.delete(`/community/posts/${postId}`);
         // 从本地列表中移除
         setMyWorks(prev => prev.filter(p => p.id !== postId));
         setDeleteConfirmId(null);
      } catch (error) {
         console.error("Failed to delete work", error);
         // 这里可以加一个 Toast 提示失败
      }
   };

   // 监听视图切换，进入 MY_WORKS 时加载数据
   useEffect(() => {
      if (activeTab === SidebarTab.PROFILE && profileView === 'MY_WORKS') {
         fetchMyWorks();
      }
   }, [activeTab, profileView, fetchMyWorks]);

   // 重置视图：当关闭侧边栏或切换大 Tab 时，重置回菜单
   useEffect(() => {
      if (activeTab !== SidebarTab.PROFILE) {
         setProfileView('MENU');
      }
   }, [activeTab])

   // 本地更新关注状态，避免重新拉取列表导致的闪烁
   const handleFollowChange = (userId: string, newStatus: boolean) => {
      // 1. Update Search/Recommend List
      setDisplayUsers(prev => prev.map(u =>
         u.id === userId ? { ...u, isFollowed: newStatus } : u
      ));

      // 2. Update Creator Leaderboard
      setCreatorsRanking(prev => prev.map(item =>
         item.author.id === userId
            ? { ...item, author: { ...item.author, isFollowed: newStatus } }
            : item
      ));

      // 3. Update New Creator Leaderboard
      setNewcreatorsRanking(prev => prev.map(item =>
         item.author.id === userId
            ? { ...item, author: { ...item.author, isFollowed: newStatus } }
            : item
      ));
   };

   const handleLogout = () => {
      logout();
   };

   // 获取推荐用户
   const fetchRecommendedUsers = useCallback(async () => {
      setIsSearchLoading(true);
      try {
         const data = await api.get<any, User[]>('/community/users/recommend');
         setDisplayUsers(data || []);
      } catch (error) {
         console.error("Failed to fetch recommended users", error);
         setDisplayUsers([]);
      } finally {
         setIsSearchLoading(false);
      }
   }, []);

   // 获取排行榜数据
   const fetchLeaderboards = useCallback(async (type: 'creators' | 'newcreators' | 'all') => {
      setIsLbLoading(true);
      try {
         if (type === 'creators' || type === 'all') {
            const data = await api.get<any, LeaderboardItem[]>('/community/leaderboard/creators');
            setCreatorsRanking(data || []);
         }
         if (type === 'newcreators' || type === 'all') {
            const data = await api.get<any, LeaderboardItem[]>('/community/leaderboard/newcreators');
            setNewcreatorsRanking(data || []);
         }
      } catch (error) {
         console.error("Failed to fetch leaderboards", error);
      } finally {
         setIsLbLoading(false);
      }
   }, []);

   // Effect: Initial Data Load for Search Tab
   useEffect(() => {
      if (activeTab === SidebarTab.SEARCH && !searchQuery) {
         fetchRecommendedUsers();
      }
   }, [activeTab, searchQuery, fetchRecommendedUsers]);

   // Effect: Initial Data Load for Leaderboard Tab
   useEffect(() => {
      if (activeTab === SidebarTab.LEADERBOARD) {
         setLbView('SUMMARY');
         fetchLeaderboards('all');
      }
   }, [activeTab, fetchLeaderboards]);

   // Effect: Debounced Search
   useEffect(() => {
      const timer = setTimeout(async () => {
         if (activeTab === SidebarTab.SEARCH) {
            if (searchQuery.trim() === '') {
               if (displayUsers.length === 0) fetchRecommendedUsers();
               return;
            }

            setIsSearchLoading(true);
            try {
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
      }, 500);

      return () => clearTimeout(timer);
   }, [searchQuery, activeTab, fetchRecommendedUsers]);


   if (activeTab === SidebarTab.HOME) return null;

   return (
      <div className="absolute left-16 top-0 bottom-0 w-[320px] glass-panel z-40 flex flex-col animate-in slide-in-from-left duration-300 border-r border-white/10 bg-black/80 backdrop-blur-xl">

         {/* 1. 搜索面板 */}
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
                              <img src={user.avatar || 'https://github.com/shadcn.png'} className="w-10 h-10 rounded-full object-cover" alt={user.name} />
                              <div>
                                 <div className="text-sm font-semibold flex items-center gap-1">
                                    {user.name}
                                    {user.isVerified && <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-[8px] text-white">✓</div>}
                                 </div>
                                 <div className="text-xs text-gray-400 truncate max-w-[120px]">{user.handle}</div>
                              </div>
                           </div>
                           <FollowButton userId={user.id}
                              initialIsFollowed={user.isFollowed}
                              onToggle={(val) => handleFollowChange(user.id, val)}
                           />
                        </div>
                     ))}
                  </div>
               </div>
            </>
         )}

         {/* 2. 排行榜面板 */}
         {activeTab === SidebarTab.LEADERBOARD && (
            <>
               {isLbLoading && lbView === 'SUMMARY' && creatorsRanking.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                     <Loader2 size={32} className="animate-spin text-purple-500" />
                  </div>
               ) : (
                  <>
                     {/* Summary View */}
                     {lbView === 'SUMMARY' && (
                        <>
                           <div className="p-5 border-b border-white/10 flex items-center justify-between">
                              <h2 className="text-xl font-bold flex items-center gap-2">排行榜</h2>
                              <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full"><X size={16} /></button>
                           </div>

                           <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">

                              {/* 1. 热门创作者榜单摘要 */}
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
                                             <div className={`w-6 text-center font-bold text-lg ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-orange-400' : 'text-gray-600'}`}>
                                                {item.rank || idx + 1}
                                             </div>
                                             <img src={item.author.avatar || 'https://github.com/shadcn.png'} className="w-10 h-10 rounded-full object-cover border border-white/10" alt={item.author.name} />
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

                              {/* 2. 热门新锐作者榜单摘要 */}
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
                                       <div key={(item.author.id) + 'new'} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                          <div className="flex items-center gap-3">
                                             <div className={`w-6 text-center font-bold text-lg ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-orange-400' : 'text-gray-600'}`}>
                                                {item.rank || idx + 1}
                                             </div>
                                             <img src={item.author.avatar || 'https://github.com/shadcn.png'} className="w-10 h-10 rounded-full object-cover border border-white/10" alt={item.author.name} />
                                             <div className="flex flex-col">
                                                <span className="text-sm font-bold truncate max-w-[90px] text-gray-200">{item.author.name}</span>
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

                     {/* Detail Views */}
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
                                       <img src={item.author.avatar || 'https://github.com/shadcn.png'} className="w-10 h-10 rounded-full object-cover" alt={item.author.name} />
                                       <div className="flex flex-col">
                                          <span className="text-sm font-bold">{item.author.name}</span>
                                          <span className="text-xs text-gray-500">粉丝数: {item.author.followers?.toLocaleString()}</span>
                                       </div>
                                    </div>
                                    <FollowButton userId={item.author.id}
                                       initialIsFollowed={item.author?.isFollowed}
                                       onToggle={(val) => handleFollowChange(item.author?.id, val)}
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

         {/* 3. 个人主页面板 */}
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
                     <>
                        {/* ==================== 主菜单视图 ==================== */}
                        {profileView === 'MENU' && (
                           <div className="p-5 space-y-6 animate-in slide-in-from-left duration-300">
                              {/* 用户基本信息 (保持不变) */}
                              <div className="flex items-center gap-4 pb-2">
                                 <div className="relative">
                                    <img src={user?.avatar || 'https://picsum.photos/seed/default/200/200'} className="w-16 h-16 rounded-full border-2 border-white/10 object-cover" />
                                    {user?.isMember && (
                                       <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full border border-black">PRO</div>
                                    )}
                                 </div>
                                 <div>
                                    <div className="text-lg font-bold">{user?.username}</div>
                                    <div className="text-sm text-gray-400">{'@' + user?.username}</div>
                                 </div>
                              </div>

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

                              {/* 菜单列表 */}
                              <div className="space-y-1 pt-2">
                                 <MenuItem
                                    icon={<ImageIcon size={18} />}
                                    label="我的作品"
                                    hasArrow
                                    onClick={() => setProfileView('MY_WORKS')} // <--- 点击切换视图
                                 />
                                 <MenuItem icon={<Heart size={18} />} label="收藏夹" hasArrow onClick={() => setProfileView('COLLECTIONS')} />
                                 <MenuItem icon={<CreditCard size={18} />} label="订阅管理" />
                                 <MenuItem icon={<Settings size={18} />} hasArrow onClick={() => setProfileView('SETTINGS')} label="设置" />
                              </div>
                           </div>
                        )}

                        {/* ==================== 我的作品列表视图 ==================== */}
                        {profileView === 'MY_WORKS' && (
                           <div className="h-full flex flex-col animate-in slide-in-from-right duration-300">
                              {isWorksLoading ? (
                                 <div className="flex items-center justify-center h-40">
                                    <Loader2 size={24} className="animate-spin text-purple-500" />
                                 </div>
                              ) : myWorks.length === 0 ? (
                                 <div className="flex flex-col items-center justify-center py-10 text-gray-500 gap-3">
                                    <ImageIcon size={32} className="opacity-20" />
                                    <p className="text-sm">还没有发布任何作品</p>
                                    <button className="text-xs text-purple-400 hover:text-purple-300 underline">去创作</button>
                                 </div>
                              ) : (
                                 <div className="p-2 space-y-2">
                                    {myWorks.map((post) => (
                                       <div
                                          key={post.id}
                                          className="group relative flex gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                                       >
                                          {/* 缩略图 - 点击查看详情 */}
                                          <div
                                             className="w-20 h-20 rounded-lg overflow-hidden shrink-0 cursor-pointer bg-gray-900"
                                             onClick={() => onSelectPost?.(post)}
                                          >
                                             <img src={post.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                                          </div>

                                          {/* 信息区域 */}
                                          <div className="flex-1 flex flex-col min-w-0 py-1">
                                             <div
                                                className="font-medium text-sm truncate text-gray-200 cursor-pointer hover:text-white"
                                                onClick={() => onSelectPost?.(post)}
                                             >
                                                {post.title || '无标题作品'}
                                             </div>
                                             <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                {post.content || '暂无描述'}
                                             </div>

                                             <div className="mt-auto flex items-center gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                   <Heart size={12} /> {post.likesCount}
                                                </span>
                                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                             </div>
                                          </div>

                                          {/* 操作按钮区 */}
                                          <div className="flex flex-col items-end gap-2">
                                             {/* 删除逻辑 */}
                                             {deleteConfirmId === post.id ? (
                                                <div className="flex items-center gap-1 animate-in fade-in bg-red-500/10 p-1 rounded-lg border border-red-500/20">
                                                   <button
                                                      onClick={() => handleDeleteWork(post.id)}
                                                      className="p-1.5 bg-red-600 text-white rounded hover:bg-red-500 transition-colors"
                                                      title="确认删除"
                                                   >
                                                      <Check size={14} />
                                                   </button>
                                                   <button
                                                      onClick={() => setDeleteConfirmId(null)}
                                                      className="p-1.5 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                                                      title="取消"
                                                   >
                                                      <X size={14} />
                                                   </button>
                                                </div>
                                             ) : (
                                                <button
                                                   onClick={(e) => {
                                                      e.stopPropagation();
                                                      setDeleteConfirmId(post.id);
                                                   }}
                                                   className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                   title="删除作品"
                                                >
                                                   <Trash2 size={16} />
                                                </button>
                                             )}
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              )}
                           </div>
                        )}

                        {/* 占位：收藏夹视图 */}
                        {profileView === 'COLLECTIONS' && (
                           <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                              <Heart size={32} className="opacity-20 mb-2" />
                              <p className="text-sm">收藏功能开发中</p>
                           </div>
                        )}
                        
                        {profileView === 'SETTINGS' && (
                           <div className="flex flex-col h-full">
                              <div className="p-5 border-b border-white/10 flex items-center gap-3">
                                 <button onClick={() => setProfileView('MENU')} className="p-2 -ml-2 hover:bg-white/10 rounded-full">
                                    <ArrowLeft size={18} />
                                 </button>
                                 <h2 className="text-lg font-bold">设置</h2>
                              </div>

                              <div className="flex-1 p-4 space-y-4">
                                 <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg">
                                    <span className="text-sm">浅色模式</span>
                                    <Switch />
                                 </div>

                                 <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg">
                                    <span className="text-sm">消息通知</span>
                                    <Switch checked={false} onChange={() => {}} />
                                 </div>

                                 <button className="w-full p-3 text-left hover:bg-white/5 rounded-lg text-sm text-gray-400 hover:text-white">
                                    隐私设置
                                 </button>

                                 <button className="w-full p-3 text-left hover:bg-white/5 rounded-lg text-sm text-gray-400 hover:text-white">
                                    帮助中心
                                 </button>

                                 <button 
                                  onClick={useAuth().logout}
                                 className="w-full p-3 text-left hover:bg-white/5 rounded-lg text-sm text-red-400 hover:text-red-300 mt-8">
                                    退出登录
                                 </button>
                              </div>
                           </div>
                        )}
                     </>
                  )}
               </div>

               {/* 底部退出按钮：仅在菜单页显示 */}
               {/* {isLoggedIn && profileView === 'MENU' && (
                  <div className="p-4 border-t border-white/5">
                     <button
                        onClick={useAuth().logout}
                        className="flex items-center gap-3 w-full p-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm font-medium"
                     >
                        <LogOut size={18} />
                        退出登录
                     </button>
                  </div>
               )} */}
            </>
         )}

      </div>
   );
};

// 辅助组件：添加 onClick 属性
const MenuItem = ({ icon, label, hasArrow, onClick }: { icon: React.ReactNode, label: string, hasArrow?: boolean, onClick?: () => void }) => (
   <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-colors group"
   >
      <div className="flex items-center gap-3">
         <span className="text-gray-500 group-hover:text-white transition-colors">{icon}</span>
         <span className="text-sm font-medium">{label}</span>
      </div>
      {hasArrow && <ArrowRight size={14} className="text-gray-600 group-hover:text-white transition-colors" />}
   </button>
);

export default SidebarPanel;