import React, { useState, useEffect } from 'react';
import type { Post } from '../types/community';
import { SidebarTab } from '../types/community';
import { ViewState } from '../types/community';
// 移除 MOCK_POSTS 引用，改为从 api 获取
// import { MOCK_POSTS } from '../data/constants_community'; 
// 移除 MockPostService
// import MockPostService from '../services/MockPostService';
import SidebarPanel from '../components/community/SidebarPanel';
import DetailView from '../components/community/DetailView';
import ImageView from '../components/community/ImageView';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Trophy, User, MessageSquare, Heart, Share2, Play, Sparkles, Loader2 } from 'lucide-react';
import api from '../utils/api'; // 引入真实的 api 实例

// 定义 Feed Tab 类型
type FeedTabType = 'RECOMMEND' | 'FOLLOWING' | 'LATEST';

const CommunityPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleCreateClick = () => {
    navigate('/work');
  };
  
  const shouldOpenAppDirectly = location.state?.activeTab !== undefined;

  const [viewState, setViewState] = useState<ViewState>(
    shouldOpenAppDirectly ? ViewState.APP : ViewState.LANDING
  );

  const [activeTab, setActiveTab] = useState<SidebarTab>(
    location.state?.activeTab || SidebarTab.HOME
  );
  
  // Feed流状态管理
  const [activeFeedTab, setActiveFeedTab] = useState<FeedTabType>('RECOMMEND'); 
  // 初始状态设为空数组，不再使用 Mock 数据
  const [displayPosts, setDisplayPosts] = useState<Post[]>([]); 
  const [isFeedLoading, setIsFeedLoading] = useState(false); 

  // 监听 Tab 切换，请求真实后端接口
  useEffect(() => {
    if (viewState === ViewState.APP) {
      const fetchPosts = async () => {
        setIsFeedLoading(true);
        try {
          // 映射 Tab 到后端 API 路径参数或查询参数
          let endpoint = '/community/posts/recommend';
          if (activeFeedTab === 'FOLLOWING') endpoint = '/community/posts/following';
          if (activeFeedTab === 'LATEST') endpoint = '/community/posts/latest';

          // api.ts 拦截器已经解包，这里返回的直接是 Post[] (T)
          const data = await api.get<Post[]>(endpoint);
          
          // 确保数据是数组，防止后端异常返回 null
          setDisplayPosts(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Failed to fetch posts", error);
          // 错误处理已由 api.ts 拦截器统一处理（alert），这里只需停止 loading
        } finally {
          setIsFeedLoading(false);
        }
      };

      fetchPosts();
    }
  }, [activeFeedTab, viewState]); 

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [viewingImage, setViewingImage] = useState<Post | null>(null);

  // Landing Page Component
  const LandingPage = () => (
    <div className="min-h-screen bg-[#05050a] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      
      <div className="z-10 text-center space-y-8 p-6 max-w-2xl">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">
          UPC Nexus
        </h1>
        <p className="text-gray-400 text-lg md:text-xl font-light">
          每张AI图片都有一个故事，分享你的。<br/>通过AI艺术重新发现社交互动。
        </p>
        
        <button 
          onClick={() => {
            setViewState(ViewState.APP);
            setActiveFeedTab('RECOMMEND'); 
          }}
          className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-semibold transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)]"
        >
          <span>进入社区</span>
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white group-hover:rotate-90 transition-transform">
             <Play size={14} fill="white" />
          </div>
        </button>
      </div>
    </div>
  );

  // Main App Component
  const MainApp = () => (
    <div className="flex h-screen w-full bg-[#05050a] text-white overflow-hidden relative">
      
      {/* Navigation */}
      <nav className="w-16 md:w-20 bg-black/40 border-r border-white/5 flex flex-col items-center py-8 z-50 backdrop-blur-xl shrink-0">
        <div className="mb-10 text-2xl font-bold tracking-tighter">U.</div>
        <div className="flex flex-col gap-8 w-full">
          <SidebarBtn icon={<Home size={24} />} isActive={activeTab === SidebarTab.HOME} onClick={() => setActiveTab(SidebarTab.HOME)} label="首页"/>
          <SidebarBtn icon={<Search size={24} />} isActive={activeTab === SidebarTab.SEARCH} onClick={() => setActiveTab(activeTab === SidebarTab.SEARCH ? SidebarTab.HOME : SidebarTab.SEARCH)} label="搜索"/>
          <SidebarBtn icon={<Trophy size={24} />} isActive={activeTab === SidebarTab.LEADERBOARD} onClick={() => setActiveTab(activeTab === SidebarTab.LEADERBOARD ? SidebarTab.HOME : SidebarTab.LEADERBOARD)} label="榜单"/>
        </div>
        <div className="mt-auto">
          <SidebarBtn icon={<User size={24} />} isActive={activeTab === SidebarTab.PROFILE} onClick={() => setActiveTab(SidebarTab.PROFILE)} label="我的"/>
        </div>
      </nav>

      {/* Panels */}
      <SidebarPanel activeTab={activeTab} onClose={() => setActiveTab(SidebarTab.HOME)} />

      {/* Main Feed Content Area */}
      <main className="flex-1 relative overflow-y-auto scroll-smooth">
        
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#05050a]/80 backdrop-blur-md border-b border-white/5">
           <div className="flex gap-2">
             <TabButton 
                label="推荐" 
                isActive={activeFeedTab === 'RECOMMEND'} 
                onClick={() => setActiveFeedTab('RECOMMEND')} 
             />
             <TabButton 
                label="关注" 
                isActive={activeFeedTab === 'FOLLOWING'} 
                onClick={() => setActiveFeedTab('FOLLOWING')} 
             />
             <TabButton 
                label="最新" 
                isActive={activeFeedTab === 'LATEST'} 
                onClick={() => setActiveFeedTab('LATEST')} 
             />
           </div>
           
           <div className="hidden md:flex items-center gap-4">
              {isFeedLoading && (
                <div className="flex items-center gap-2 text-xs text-purple-400 animate-in fade-in">
                  <Loader2 size={14} className="animate-spin"/>
                  <span>更新内容中...</span>
                </div>
              )}
              <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">v2.5 模型已激活</span>
           </div>
        </div>

        {/* Masonry Grid Feed */}
        <div className="p-4 md:p-6 lg:p-8 pb-32">
          
          {isFeedLoading && displayPosts.length === 0 ? (
             <div className="flex items-center justify-center h-64 w-full">
                <Loader2 size={40} className="text-purple-500 animate-spin" />
             </div>
          ) : (
             <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {displayPosts.map((post) => (
                  <div 
                    key={post.id} 
                    onClick={() => setViewingImage(post)}
                    className="break-inside-avoid relative group rounded-2xl overflow-hidden bg-[#1a1a1a] cursor-pointer border border-transparent hover:border-white/20 transition-all"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden">
                       <img 
                        src={post.thumbnailUrl} 
                        alt={post.caption}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <div className="flex items-center gap-2 mb-3">
                         <img src={post.author.avatar} className="w-6 h-6 rounded-full border border-white/50" />
                         <span className="text-xs font-semibold drop-shadow-md">{post.author.handle}</span>
                      </div>
                      <p className="text-sm text-gray-200 line-clamp-2 mb-4 drop-shadow-sm">{post.caption}</p>
                      <div className="flex items-center justify-between text-white/80">
                         <div className="flex gap-4">
                            <button className="flex items-center gap-1 hover:text-red-400 transition-colors">
                               <Heart size={18} />
                               <span className="text-xs">{post.likes}</span>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setSelectedPost(post); }} className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                               <MessageSquare size={18} />
                               <span className="text-xs">{post.commentsCount}</span>
                            </button>
                         </div>
                         <button className="hover:text-green-400 transition-colors"><Share2 size={18}/></button>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          )}
          
          {!isFeedLoading && displayPosts.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                 暂无内容
              </div>
          )}
        </div>

        {/* Floating Create Button */}
        <div className="fixed bottom-10 left-[calc(50%+2rem)] md:left-[calc(50%+2.5rem)] -translate-x-1/2 z-40">
           <button onClick={handleCreateClick} className="group relative flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white font-semibold shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60 hover:scale-105 active:scale-95 transition-all duration-300 ring-1 ring-white/20">
              <div className="absolute inset-0 rounded-full bg-white/20 blur-md opacity-0 group-hover:opacity-50 transition-opacity" />
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="tracking-wide">去创作</span>
           </button>
        </div>
      </main>

      {/* Modals */}
      {selectedPost && (<DetailView post={selectedPost} onClose={() => setSelectedPost(null)} />)}
      {viewingImage && (<ImageView post={viewingImage} onClose={() => setViewingImage(null)} />)}
    </div>
  );

  return viewState === ViewState.LANDING ? <LandingPage /> : <MainApp />;
};

// 辅助组件：Tab 按钮
const TabButton = ({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
      isActive 
        ? 'bg-white text-black shadow-[0_0_15px_-3px_rgba(255,255,255,0.3)] scale-105' 
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`}
  >
    {label}
  </button>
);

// 辅助组件：侧边栏按钮
const SidebarBtn = ({ icon, isActive, onClick, label }: { icon: React.ReactNode, isActive: boolean, onClick: () => void, label: string }) => (
  <button onClick={onClick} className="relative group flex flex-col items-center gap-1">
    <div className={`p-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>
      {icon}
    </div>
    {isActive && (<div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />)}
  </button>
);

export default CommunityPage;