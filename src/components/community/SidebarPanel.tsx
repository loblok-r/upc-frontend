import React, { useState, useEffect } from 'react';
import { SidebarTab } from '../../types/community';
import { MOCK_USERS, LEADERBOARD_DATA } from '../../data/constants_community';
import {
   Search, Trophy, X, ChevronRight, TrendingUp, Music, Film,
   ArrowLeft, Loader2, Check, User, LogIn, LogOut,
   Settings, Image as ImageIcon, Heart, Zap, CreditCard, ChevronRight as ArrowRight
} from 'lucide-react';
import MockApiService from '../../services/MockApiService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';


// ==========================================
// 2. Follow Button Component
// ==========================================
interface FollowButtonProps {
   userId: string;
   className?: string;
}

const FollowButton: React.FC<FollowButtonProps> = ({ userId, className }) => {

   const [isFollowed, setIsFollowed] = useState(false);
   const [isLoading, setIsLoading] = useState(false);

   const handleFollowClick = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isLoading) return;
      setIsLoading(true);
      const success = await MockApiService.toggleFollow('my_current_id', userId, isFollowed);
      if (success) {
         setIsFollowed(!isFollowed);
      }
      setIsLoading(false);
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



interface SidebarPanelProps {
   activeTab: SidebarTab;
   onClose: () => void;
}

type LeaderboardView = 'SUMMARY' | 'ALL_CREATORS' | 'ALL_REMIXES';

const SidebarPanel: React.FC<SidebarPanelProps> = ({ activeTab, onClose }) => {
   const navigate = useNavigate();
   const location = useLocation();
   const { isLoggedIn, user, logout } = useAuth(); 
   console.log("sidebar user:", user)
   const [lbView, setLbView] = useState<LeaderboardView>('SUMMARY');

   // --- 搜索功能相关的状态 ---
   const [searchQuery, setSearchQuery] = useState('');

   // ==========================================
   //登录状态管理
   // ==========================================



   const [displayUsers, setDisplayUsers] = useState(MOCK_USERS); // 默认显示推荐用户
   const [isSearching, setIsSearching] = useState(false);

   // 模拟登录动作
   const handleLogin = () => {
      navigate('/login', {
         state: {
            from: location.pathname, // 记录当前路径 (比如 /community)
            returnTab: SidebarTab.PROFILE // 记录希望回来时打开的 Tab
         }
      });
   };

   // 模拟退出登录
   const handleLogout = () => {
      // 可以加个确认弹窗，这里直接退出
      logout();
   };

   // 当 Tab 切换时重置状态
   useEffect(() => {
      if (activeTab !== SidebarTab.LEADERBOARD) setLbView('SUMMARY');
      if (activeTab === SidebarTab.SEARCH) {
         setSearchQuery('');
         setDisplayUsers(MOCK_USERS);
      }
   }, [activeTab]);

   // --- 监听搜索输入 ---
   useEffect(() => {
      // 简单的防抖逻辑：利用 setTimeout 和 clearTimeout
      // 只有当用户停止输入 300ms 后才触发搜索
      const timer = setTimeout(async () => {
         if (activeTab === SidebarTab.SEARCH) {
            if (searchQuery.trim() === '') {
               setDisplayUsers(MOCK_USERS); // 如果清空了，恢复显示推荐列表
               setIsSearching(false);
               return;
            }

            setIsSearching(true);
            const results = await MockApiService.searchUsers(searchQuery);
            setDisplayUsers(results);
            setIsSearching(false);
         }
      }, 300);

      return () => clearTimeout(timer);
   }, [searchQuery, activeTab]);


   if (activeTab === SidebarTab.HOME) return null;

   // 模拟排行榜长列表数据
   const FULL_CREATORS_LIST = [...LEADERBOARD_DATA.creators, ...LEADERBOARD_DATA.creators].map((item, i) => ({ ...item, rank: i + 1 }));
   const FULL_REMIXES_LIST = [...LEADERBOARD_DATA.remixes, ...LEADERBOARD_DATA.remixes].map((item, i) => ({ ...item, rank: i + 1 }));

   return (
      <div className="absolute left-16 top-0 bottom-0 w-[320px] glass-panel z-40 flex flex-col animate-in slide-in-from-left duration-300 border-r border-white/10">

         {/* Search Panel Content */}
         {activeTab === SidebarTab.SEARCH && (
            <>
               <div className="p-5 border-b border-white/10">
                  <h2 className="text-xl font-bold mb-4">发现用户</h2>
                  <div className="relative">
                     {/* 搜索图标：如果是搜索状态，显示 Loading */}
                     <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {isSearching ? <Loader2 size={18} className="animate-spin text-purple-400" /> : <Search size={18} />}
                     </div>

                     <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="搜索创作者..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                     />

                     {/* 清空按钮 (仅当有输入时显示) */}
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

               <div className="flex-1 overflow-y-auto p-2">
                  <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex justify-between items-center">
                     {searchQuery ? '搜索结果' : '推荐关注'}
                     {isSearching && <span className="text-[10px] text-purple-400">搜索中...</span>}
                  </h3>

                  <div className="space-y-1">
                     {/* 如果没有结果 */}
                     {!isSearching && displayUsers.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                           <p>未找到相关用户</p>
                        </div>
                     )}

                     {/* 渲染用户列表 (推荐 或 搜索结果) */}
                     {displayUsers.map(user => (
                        <div key={user.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group animate-in fade-in duration-300">
                           <div className="flex items-center gap-3">
                              <img src={user.avatar} className="w-10 h-10 rounded-full" />
                              <div>
                                 <div className="text-sm font-semibold flex items-center gap-1">
                                    {/* 高亮匹配文字逻辑可选，这里暂不做复杂的高亮 */}
                                    {user.name}
                                    {user.isVerified && <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-[8px]">✓</div>}
                                 </div>
                                 <div className="text-xs text-gray-400">{user.handle}</div>
                              </div>
                           </div>
                           <FollowButton userId={user.id} />
                        </div>
                     ))}
                  </div>
               </div>
            </>
         )}

         {/* Leaderboard Panel Content*/}
         {activeTab === SidebarTab.LEADERBOARD && (
            <>
               {lbView === 'SUMMARY' && (
                  <>
                     <div className="p-5 border-b border-white/10 flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">排行榜</h2>
                        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full"><X size={16} /></button>
                     </div>

                     <div className="flex-1 overflow-y-auto hide-scrollbar">
                        <div className="p-4">
                           <div className="flex items-center justify-between mb-3 px-1">
                              <span className="text-sm font-bold text-purple-400 flex items-center gap-2"><Film size={14} /> 热门创作者</span>
                              <span onClick={() => setLbView('ALL_CREATORS')} className="text-xs text-gray-500 hover:text-white cursor-pointer flex items-center transition-colors">查看全部 <ChevronRight size={12} /></span>
                           </div>
                           <div className="space-y-3">
                              {LEADERBOARD_DATA.creators.map((item, idx) => (
                                 <div key={item.user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                       <div className={`w-6 text-center font-bold text-lg ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-orange-400' : 'text-gray-600'}`}>{item.rank}</div>
                                       <img src={item.user.avatar} className="w-10 h-10 rounded-full" />
                                       <div className="flex flex-col">
                                          <span className="text-sm font-bold">{item.user.name}</span>
                                          <span className="text-xs text-gray-500">{item.user.handle}</span>
                                       </div>
                                    </div>
                                    <FollowButton userId={item.user.id} />
                                 </div>
                              ))}
                           </div>
                        </div>

                        <div className="p-4 pt-0">
                           <div className="flex items-center justify-between mb-3 px-1">
                              <span className="text-sm font-bold text-blue-400 flex items-center gap-2"><Music size={14} /> 热门二创</span>
                              <span onClick={() => setLbView('ALL_REMIXES')} className="text-xs text-gray-500 hover:text-white cursor-pointer flex items-center transition-colors">查看全部 <ChevronRight size={12} /></span>
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

               {(lbView === 'ALL_CREATORS' || lbView === 'ALL_REMIXES') && (
                  <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
                     <div className="p-5 border-b border-white/10 flex items-center gap-3">
                        <button onClick={() => setLbView('SUMMARY')} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"><ArrowLeft size={18} /></button>
                        <h2 className="text-lg font-bold">{lbView === 'ALL_CREATORS' ? '热门创作者榜单' : '热门二创榜单'}</h2>
                     </div>
                     <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {lbView === 'ALL_CREATORS' && FULL_CREATORS_LIST.map((item, idx) => (
                           <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                              <div className="flex items-center gap-3">
                                 <div className={`w-8 text-center font-bold text-lg ${idx < 3 ? 'text-yellow-400' : 'text-gray-500'}`}>#{item.rank}</div>
                                 <img src={item.user.avatar} className="w-10 h-10 rounded-full" />
                                 <div className="flex flex-col">
                                    <span className="text-sm font-bold">{item.user.name}</span>
                                    <span className="text-xs text-gray-500">粉丝数: {(1000 - idx * 10).toLocaleString()}</span>
                                 </div>
                              </div>
                              <FollowButton userId={item.user.id} />
                           </div>
                        ))}
                        {lbView === 'ALL_REMIXES' && FULL_REMIXES_LIST.map((item, idx) => (
                           <div key={idx} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-white/10">
                              <div className={`text-lg font-bold w-6 text-center ${idx < 3 ? 'text-blue-400' : 'text-gray-600'}`}>{item.rank}</div>
                              <img src={`https://picsum.photos/seed/${item.score + idx}/60/60`} className="w-12 h-12 rounded-lg bg-gray-800" />
                              <div className="flex-1 min-w-0">
                                 <div className="text-sm font-semibold truncate">Remix by {item.user.name}</div>
                                 <div className="text-xs text-gray-400 mt-1 flex items-center gap-2"><span className="flex items-center gap-1"><Music size={10} /> 原声使用</span><span>•</span><span>{item.score}k 热度</span></div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}
            </>
         )}

         {/* ========================================================================= */}
         {/* 个人主页面板*/}
         {/* ========================================================================= */}
         {activeTab === SidebarTab.PROFILE && (
            <>
               {/* Header Area */}
               <div className="p-5 border-b border-white/10 flex items-center justify-between">
                  <h2 className="text-xl font-bold">我的主页</h2>
                  <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                     <X size={16} />
                  </button>
               </div>

               {/* 根据登录状态切换 */}
               <div className="flex-1 overflow-y-auto">

                  {/* 未登录 */}
                  {!isLoggedIn ? (
                     <div className="flex flex-col items-center justify-center p-8 text-center h-full animate-in fade-in duration-500">
                        <div className="w-24 h-24 bg-gradient-to-tr from-white/5 to-white/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-white/10 shadow-2xl relative">
                           <User size={48} className="text-gray-400" />
                           {/* 装饰性光点 */}
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
                           {/* { <Loader2 size={18} className="animate-spin"/> } */}
                           <span>立即登录</span>
                        </button>

                        <div className="mt-6 text-xs text-gray-500">
                           继续即代表同意 <span className="underline cursor-pointer">服务条款</span>
                        </div>
                     </div>
                  ) : (
                     // 已登录 
                     <div className="p-5 space-y-6 animate-in slide-in-from-bottom-4 duration-500">

                        {/* 基本信息卡片 */}
                        <div className="flex items-center gap-4 pb-2">
                           <div className="relative">
                              <img src={user?.avatar || 'https://picsum.photos/seed/default/200/200'} className="w-16 h-16 rounded-full border-2 border-white/10" />
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

                        {/* 数据统计栏 */}
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

                       {/* 算力余额 */}
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
                              {/* 进度条 */}
                              <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                                 <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 w-[85%]"></div>
                              </div>
                           </div>
                        </div>

                        {/* 4. 功能菜单列表 */}
                        <div className="space-y-1 pt-2">
                           <MenuItem icon={<ImageIcon size={18} />} label="我的作品" hasArrow />
                           <MenuItem icon={<Heart size={18} />} label="收藏夹" hasArrow />
                           <MenuItem icon={<CreditCard size={18} />} label="订阅管理" />
                           <MenuItem icon={<Settings size={18} />} label="设置" />
                        </div>
                     </div>
                  )}
               </div>

               {/* Footer - 仅在登录时显示退出按钮 */}
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