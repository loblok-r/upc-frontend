// src/components/community/SidebarPanel.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { SidebarTab } from '../../types/community';
import type { Post, User, LeaderboardItem } from '../../types/community';

import {
   Search, X, ChevronRight, Music, Film,
   ArrowLeft, Loader2, Check, User as UserIcon,
   Image as ImageIcon, Heart, Zap, Trash2, LogOut, Users
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

const FollowButton: React.FC<FollowButtonProps> = ({ userId, initialIsFollowed = false, className, onToggle }) => {
   const [isFollowed, setIsFollowed] = useState(initialIsFollowed);
   const [isLoading, setIsLoading] = useState(false);
   const { isLoggedIn } = useAuth();

   useEffect(() => {
      setIsFollowed(initialIsFollowed);
   }, [initialIsFollowed]);

   const handleFollowClick = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isLoggedIn) return;
      if (isLoading) return;
      setIsLoading(true);

      try {
         await api.post('/community/users/follow', { userId });
         const newStatus = !isFollowed;
         setIsFollowed(newStatus);
         if (onToggle) onToggle(newStatus);
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
   targetUserId?: string | null;
}
// 修改：增加了 FOLLOWERS 和 FOLLOWING 状态
type ProfileView = 'MENU' | 'MY_WORKS' | 'FOLLOWERS' | 'FOLLOWING' | 'SETTINGS';

type LeaderboardView = 'SUMMARY' | 'ALL_CREATORS' | 'ALL_NEWCREATORS';

const SidebarPanel: React.FC<SidebarPanelProps> = ({ activeTab, onClose, onSelectPost, targetUserId }) => {
   const navigate = useNavigate();
   const location = useLocation();
   const { isLoggedIn, user: currentUser, logout } = useAuth();

   // 控制个人中心内部视图切换
   const [profileView, setProfileView] = useState<ProfileView>('MENU');

   // --- Works State ---
   const [works, setWorks] = useState<Post[]>([]);
   const [isWorksLoading, setIsWorksLoading] = useState(false);
   const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

   // --- User Profile State (For targetUser) ---
   const [userProfile, setUserProfile] = useState<User | null>(null);
   const [isProfileLoading, setIsProfileLoading] = useState(false);

   // --- Users List State (Followers/Following) ---
   const [userList, setUserList] = useState<User[]>([]);
   const [isUserListLoading, setIsUserListLoading] = useState(false);

   // --- Leaderboard & Search State ---
   const [lbView, setLbView] = useState<LeaderboardView>('SUMMARY');
   const [searchQuery, setSearchQuery] = useState('');
   const [displayUsers, setDisplayUsers] = useState<User[]>([]);
   const [isSearchLoading, setIsSearchLoading] = useState(false);
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

   // 获取作品 (统一逻辑)
   const fetchWorks = useCallback(async () => {
      const userId = targetUserId || (isLoggedIn ? currentUser?.id : null);
      if (!userId) return;

      setIsWorksLoading(true);
      try {
         const endpoint = targetUserId
            ? `/community/users/${targetUserId}/works`
            : '/community/posts/mine';

         const data = await api.get<any, Post[]>(endpoint);
         setWorks(data || []);
      } catch (error) {
         console.error("Failed to fetch works", error);
      } finally {
         setIsWorksLoading(false);
      }
   }, [isLoggedIn, currentUser?.id, targetUserId]);

   // 新增：获取关注/粉丝列表
   const fetchUserList = useCallback(async (type: 'followers' | 'following') => {
      const userId = targetUserId || (isLoggedIn ? currentUser?.id : null);
      if (!userId) return;

      setIsUserListLoading(true);
      try {
         // 接口预留：
         // GET /community/users/{id}/followers
         // GET /community/users/{id}/following
         const endpoint = `/community/users/${userId}/${type}`;

         const data = await api.get<any, User[]>(endpoint);
         setUserList(data || []);
      } catch (error) {
         console.error(`Failed to fetch ${type}`, error);
         setUserList([]);
      } finally {
         setIsUserListLoading(false);
      }
   }, [targetUserId, isLoggedIn, currentUser?.id]);

   // 监听视图切换，加载对应列表
   useEffect(() => {
      if (profileView === 'FOLLOWERS') {
         fetchUserList('followers');
      } else if (profileView === 'FOLLOWING') {
         fetchUserList('following');
      }
   }, [profileView, fetchUserList]);

   // 初始化 Profile
   useEffect(() => {
      const initProfile = async () => {
         if (activeTab === SidebarTab.USER_PROFILE && targetUserId) {
            setIsProfileLoading(true);
            // 重置视图回主菜单，防止查看别人时停留在上一个人的粉丝页
            setProfileView('MENU');
            try {
               const data = await api.get<any, User>(`/community/users/${targetUserId}/profile`);
               setUserProfile(data);
            } catch (error) {
               console.error("Failed to fetch user profile", error);
            } finally {
               setIsProfileLoading(false);
            }
         } else if (activeTab === SidebarTab.PROFILE) {
            setProfileView('MENU');
         }

         if (activeTab === SidebarTab.PROFILE || activeTab === SidebarTab.USER_PROFILE) {
            fetchWorks();
         }
      };
      initProfile();
   }, [activeTab, targetUserId, fetchWorks]);

   const handleDeleteWork = async (postId: string) => {
      try {
         await api.delete(`/community/posts/${postId}`);
         setWorks(prev => prev.filter(p => p.id !== postId));
         setDeleteConfirmId(null);
      } catch (error) {
         console.error("Failed to delete work", error);
      }
   };

   // 本地更新关注状态
   const handleFollowChange = (userId: string, newStatus: boolean) => {
      setDisplayUsers(prev => prev.map(u => u.id === userId ? { ...u, isFollowed: newStatus } : u));
      setCreatorsRanking(prev => prev.map(item => item.author.id === userId ? { ...item, author: { ...item.author, isFollowed: newStatus } } : item));
      setNewcreatorsRanking(prev => prev.map(item => item.author.id === userId ? { ...item, author: { ...item.author, isFollowed: newStatus } } : item));

      if (userProfile && userProfile.id === userId) {
         setUserProfile({ ...userProfile, isFollowed: newStatus });
      }
   };

   // --- 搜索和榜单逻辑保持不变 (省略部分代码以聚焦核心变更) ---
   const fetchRecommendedUsers = useCallback(async () => {
      setIsSearchLoading(true);
      try {
         const data = await api.get<any, User[]>('/community/users/recommend');
         setDisplayUsers(data || []);
      } catch (error) {
         setDisplayUsers([]);
      } finally {
         setIsSearchLoading(false);
      }
   }, []);

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

   useEffect(() => {
      if (activeTab === SidebarTab.SEARCH && !searchQuery) fetchRecommendedUsers();
      if (activeTab === SidebarTab.LEADERBOARD) {
         setLbView('SUMMARY');
         fetchLeaderboards('all');
      }
   }, [activeTab, searchQuery, fetchRecommendedUsers, fetchLeaderboards]);

   useEffect(() => {
      const timer = setTimeout(async () => {
         if (activeTab === SidebarTab.SEARCH && searchQuery.trim() !== '') {
            setIsSearchLoading(true);
            try {
               const results = await api.get<any, User[]>('/community/users/search', { params: { q: searchQuery } });
               setDisplayUsers(results || []);
            } catch (error) {
               console.error("Search failed", error);
            } finally {
               setIsSearchLoading(false);
            }
         }
      }, 500);
      return () => clearTimeout(timer);
   }, [searchQuery, activeTab]);

   if (activeTab === SidebarTab.HOME) return null;

   // 判断是否是查看他人
   const isViewingOther = activeTab === SidebarTab.USER_PROFILE && targetUserId;
   // 确定当前展示的用户数据
   const displayedUser = isViewingOther ? userProfile : currentUser;

   return (
      <div className="absolute left-16 top-0 bottom-0 w-[320px] glass-panel z-40 flex flex-col animate-in slide-in-from-left duration-300 border-r border-white/10 bg-black/80 backdrop-blur-xl">

         {/* 1. 搜索面板 (保持不变) */}
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
                     {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"><X size={14} /></button>}
                  </div>
               </div>
               <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10">
                  <div className="space-y-1">
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
                           <FollowButton userId={user.id} initialIsFollowed={user.isFollowed} onToggle={(val) => handleFollowChange(user.id, val)} />
                        </div>
                     ))}
                  </div>
               </div>
            </>
         )}

         {/* 2. 排行榜面板 (保持不变) */}
         {activeTab === SidebarTab.LEADERBOARD && (
            <>
               {isLbLoading && lbView === 'SUMMARY' && creatorsRanking.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                     <Loader2 size={32} className="animate-spin text-purple-500" />
                  </div>
               ) : (
                  <>
                     {lbView === 'SUMMARY' && (
                        <>
                           <div className="p-5 border-b border-white/10 flex items-center justify-between">
                              <h2 className="text-xl font-bold flex items-center gap-2">排行榜</h2>
                              <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full"><X size={16} /></button>
                           </div>
                           <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
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
                                 </div>
                              </div>
                           </div>
                        </>
                     )}
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
                           </div>
                        </div>
                     )}
                  </>
               )}
            </>
         )}

         {/* 3. 个人/他人主页面板 */}
         {(activeTab === SidebarTab.PROFILE || activeTab === SidebarTab.USER_PROFILE) && (
            <>
               <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#05050a]/50 backdrop-blur-sm z-10">
                  <div className="flex items-center gap-2">
                     {isViewingOther && (
                        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full mr-1">
                           <ArrowLeft size={16} />
                        </button>
                     )}
                     <h2 className="text-xl font-bold">{isViewingOther ? '用户主页' : '我的主页'}</h2>
                  </div>
                  <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                     <X size={16} />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 relative">

                  {/* 未登录且查看自己的时候显示登录提示 */}
                  {!isViewingOther && !isLoggedIn ? (
                     <div className="flex flex-col items-center justify-center p-8 text-center h-full animate-in fade-in duration-500">
                        <div className="w-24 h-24 bg-gradient-to-tr from-white/5 to-white/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-white/10 shadow-2xl relative">
                           <UserIcon size={48} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">开启创作之旅</h3>
                        <p className="text-sm text-gray-400 mb-8 leading-relaxed">登录解锁完整功能。</p>
                        <button onClick={handleLogin} className="w-full bg-white text-black py-3 rounded-xl font-bold">立即登录</button>
                     </div>
                  ) : isViewingOther && isProfileLoading ? (
                     <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin text-purple-500" /></div>
                  ) : (
                     <>
                        {/* ==================== 视图 A: 主菜单 (个人信息 + 作品) ==================== */}
                        {profileView === 'MENU' && (
                           <div className="pb-10 animate-in slide-in-from-right duration-300">
                              {/* 用户信息区域 */}
                              <div className="p-5 space-y-6">
                                 {/* 头像与名字 */}
                                 <div className="flex flex-col gap-4 pb-2">
                                    <div className="flex items-center gap-4">
                                       <div className="relative">
                                          <img src={displayedUser?.avatar || 'https://picsum.photos/seed/default/200/200'} className="w-16 h-16 rounded-full border-2 border-white/10 object-cover" />
                                          {displayedUser?.isMember && (
                                             <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full border border-black">PRO</div>
                                          )}
                                       </div>
                                       <div className="flex-1">
                                          <div className="text-lg font-bold">{displayedUser?.name || displayedUser?.username}</div>
                                          <div className="text-sm text-gray-400">{displayedUser?.handle || `@${displayedUser?.username}`}</div>
                                          {isViewingOther && displayedUser && (
                                             <div className="mt-2">
                                                <FollowButton
                                                   userId={displayedUser.id}
                                                   initialIsFollowed={displayedUser.isFollowed}
                                                   onToggle={(val) => handleFollowChange(displayedUser.id, val)}
                                                />
                                             </div>
                                          )}
                                       </div>
                                    </div>
                                 </div>

                                 {/* 统计数据 (点击可跳转) */}
                                 <div className="grid grid-cols-4 gap-2 bg-white/5 rounded-xl p-3 border border-white/5">

                                    {/* 1. 作品 */}
                                    <div className="text-center">
                                       <div className="text-lg font-bold">{displayedUser?.stats?.works || 0}</div>
                                       <div className="text-xs text-gray-500">作品</div>
                                    </div>

                                    {/* 2. 关注 (新增) - 可点击 */}
                                    <button
                                       onClick={() => setProfileView('FOLLOWING')}
                                       className="text-center hover:bg-white/5 rounded-lg transition-colors py-1 -my-1"
                                    >
                                       {/* 这里的 stats?.following 需要后端返回，如果没有暂显示 0 */}
                                       <div className="text-lg font-bold">{displayedUser?.stats?.following || 0}</div>
                                       <div className="text-xs text-gray-500">关注</div>
                                    </button>

                                    {/* 3. 粉丝 - 可点击 */}
                                    <button
                                       onClick={() => setProfileView('FOLLOWERS')}
                                       className="text-center hover:bg-white/5 rounded-lg transition-colors py-1 -my-1"
                                    >
                                       <div className="text-lg font-bold">{displayedUser?.stats?.followers || 0}</div>
                                       <div className="text-xs text-gray-500">粉丝</div>
                                    </button>

                                    {/* 4. 获赞 */}
                                    <div className="text-center">
                                       <div className="text-lg font-bold">{displayedUser?.stats?.likes || 0}</div>
                                       <div className="text-xs text-gray-500">获赞</div>
                                    </div>
                                 </div>

                                 {/* 算力卡片 (仅自己可见) */}
                                 {!isViewingOther && (
                                    <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-xl p-4 border border-purple-500/20 relative overflow-hidden group">
                                       <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                                          <Zap size={48} />
                                       </div>
                                       <div className="relative z-10">
                                          <div className="flex items-center gap-2 text-purple-300 text-sm font-medium mb-2">
                                             <Zap size={14} fill="currentColor" /> 剩余算力
                                          </div>
                                          <div className="text-2xl font-bold mb-2">
                                             {displayedUser?.computingPower || 0} <span className="text-sm text-gray-400 font-normal">/ {displayedUser?.maxcomputingPower || 1000}</span>
                                          </div>
                                          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                                             <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 w-[85%]"></div>
                                          </div>
                                       </div>
                                    </div>
                                 )}
                              </div>

                              {/* 作品列表 */}
                              <div className="border-t border-white/10 mt-2">
                                 <div className="px-5 py-4">
                                    <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                       <ImageIcon size={16} />
                                       {isViewingOther ? 'TA的作品' : '我的作品'}
                                    </h3>
                                 </div>

                                 {isWorksLoading ? (
                                    <div className="flex items-center justify-center h-40">
                                       <Loader2 size={24} className="animate-spin text-purple-500" />
                                    </div>
                                 ) : works.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-gray-500 gap-3">
                                       <ImageIcon size={32} className="opacity-20" />
                                       <p className="text-sm">暂无发布作品</p>
                                    </div>
                                 ) : (
                                    <div className="px-2 space-y-2">
                                       {works.map((post) => (
                                          <div
                                             key={post.id}
                                             className="group relative flex gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                                          >
                                             <div
                                                className="w-20 h-20 rounded-lg overflow-hidden shrink-0 cursor-pointer bg-gray-900"
                                                onClick={() => onSelectPost?.(post)}
                                             >
                                                <img src={post.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                                             </div>
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
                                             {!isViewingOther && (
                                                <div className="flex flex-col items-end gap-2">
                                                   {deleteConfirmId === post.id ? (
                                                      <div className="flex items-center gap-1 animate-in fade-in bg-red-500/10 p-1 rounded-lg border border-red-500/20">
                                                         <button onClick={() => handleDeleteWork(post.id)} className="p-1.5 bg-red-600 text-white rounded hover:bg-red-500"><Check size={14} /></button>
                                                         <button onClick={() => setDeleteConfirmId(null)} className="p-1.5 bg-gray-700 text-white rounded hover:bg-gray-600"><X size={14} /></button>
                                                      </div>
                                                   ) : (
                                                      <button
                                                         onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(post.id); }}
                                                         className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                      >
                                                         <Trash2 size={16} />
                                                      </button>
                                                   )}
                                                </div>
                                             )}
                                          </div>
                                       ))}
                                    </div>
                                 )}
                              </div>

                              {!isViewingOther && (
                                 <div className="p-5 mt-4 border-t border-white/5">
                                    <button
                                       onClick={logout}
                                       className="w-full flex items-center justify-center gap-2 p-3 text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                    >
                                       <LogOut size={16} />
                                       退出登录
                                    </button>
                                 </div>
                              )}
                           </div>
                        )}

                        {/* ==================== 视图 B: 粉丝列表 / 关注列表 ==================== */}
                        {(profileView === 'FOLLOWERS' || profileView === 'FOLLOWING') && (
                           <div className="h-full flex flex-col animate-in slide-in-from-right duration-300 absolute inset-0 bg-[#0c0c0c]">
                              {/* 头部：返回按钮 */}
                              <div className="p-5 border-b border-white/10 flex items-center gap-3 shrink-0">
                                 <button
                                    onClick={() => setProfileView('MENU')}
                                    className="p-2 -ml-2 hover:bg-white/10 rounded-full text-white transition-colors"
                                 >
                                    <ArrowLeft size={18} />
                                 </button>
                                 <h2 className="text-lg font-bold">
                                    {profileView === 'FOLLOWERS' ? '粉丝' : '关注'}
                                 </h2>
                              </div>

                              {/* 列表内容 */}
                              <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10">
                                 {isUserListLoading ? (
                                    <div className="flex justify-center py-10">
                                       <Loader2 size={24} className="animate-spin text-purple-500" />
                                    </div>
                                 ) : userList.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-3">
                                       <Users size={40} className="opacity-20" />
                                       <p className="text-sm">暂无{profileView === 'FOLLOWERS' ? '粉丝' : '关注'}</p>
                                    </div>
                                 ) : (
                                    <div className="space-y-1">
                                       {userList.map(user => (
                                          <div key={user.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group">
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
                                             {/* 复用 FollowButton，不传 initialIsFollowed，让其从 user 对象读取 */}
                                             <FollowButton
                                                userId={user.id}
                                                initialIsFollowed={user.isFollowed}
                                                onToggle={(val) => handleFollowChange(user.id, val)}
                                             />
                                          </div>
                                       ))}
                                    </div>
                                 )}
                              </div>
                           </div>
                        )}
                     </>
                  )}
               </div>
            </>
         )}

      </div>
   );
};

export default SidebarPanel;