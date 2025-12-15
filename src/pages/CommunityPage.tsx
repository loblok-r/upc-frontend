// src/pages/CommunityPage.tsx
import React, { useState, useEffect } from 'react';
import type { Post, SidebarTab, ViewState } from '../types/community';
import api from '../utils/api'; 
import SidebarPanel from '../components/community/SidebarPanel';
import DetailView from '../components/community/DetailView';
import ImageView from '../components/community/ImageView';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Search, Trophy, User, MessageSquare, Heart, 
  Play, Sparkles, Loader2, Image as ImageIcon 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type FeedTabType = 'RECOMMEND' | 'FOLLOWING' | 'LATEST';

const formatNumber = (num: number) => {
  if (!num) return '0';
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

const CommunityPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user } = useAuth();

  const handleCreateClick = () => {
    navigate('/work');
  };
  
  const shouldOpenAppDirectly = location.state?.activeTab !== undefined;

  const [viewState, setViewState] = useState<ViewState>(
    shouldOpenAppDirectly ? 'APP' : 'LANDING'
  );

  const [activeTab, setActiveTab] = useState<SidebarTab>(
    location.state?.activeTab || 'HOME'
  );

  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [activeFeedTab, setActiveFeedTab] = useState<FeedTabType>('RECOMMEND'); 
  const [displayPosts, setDisplayPosts] = useState<Post[]>([]); 
  const [isFeedLoading, setIsFeedLoading] = useState(false); 

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [viewingImage, setViewingImage] = useState<Post | null>(null);

  // ==========================================
  // 核心修复逻辑开始：历史记录管理
  // ==========================================

  // 1. 打开帖子详情：推入历史记录
  const openPostDetail = (post: Post) => {
      setSelectedPost(post);
      // 推入一个无实际跳转的 state，让浏览器觉得进入了新页面
      window.history.pushState({ modal: 'postDetail' }, '', '');
  };

  // 2. 打开大图预览：推入历史记录
  const openImageView = (post: Post) => {
      setViewingImage(post);
      window.history.pushState({ modal: 'imageView' }, '', '');
  };

  // 3. 关闭模态框：执行浏览器后退
  // 这样既能关闭模态框，又能清除掉上面推入的历史记录，保证逻辑闭环
  const handleCloseModal = () => {
      navigate(-1);
  };

  // ==========================================
  // 新增：处理帖子状态更新的回调函数
  // ==========================================
  const handlePostUpdate = (updatedPost: Post) => {
    // 1. 更新 Feed 流列表中的数据
    setDisplayPosts((prevPosts) => 
      prevPosts.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );

    // 2. 如果当前选中的是这个帖子，也同步更新选中状态（防止状态回跳）
    if (selectedPost && selectedPost.id === updatedPost.id) {
      setSelectedPost(updatedPost);
    }
    if (viewingImage && viewingImage.id === updatedPost.id) {
      setViewingImage(updatedPost);
    }
  };

  // 4. 监听浏览器后退事件 (popstate)
  useEffect(() => {
      const handlePopState = () => {
          // 当用户点击浏览器后退按钮时，强行关闭所有模态框
          setSelectedPost(null);
          setViewingImage(null);
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // ==========================================
  // 核心修复逻辑结束
  // ==========================================

  const handleUserClick = (userId: string) => {
      // 点击头像时，如果当前有模态框，需要先清理掉模态框的历史记录
      // 但为了逻辑简单，我们直接关闭模态框显示，并让用户处于当前历史节点
      // (更完美的做法是 replaceState，但这里直接关闭视觉效果即可满足需求)
      
      setSelectedPost(null);
      setViewingImage(null);

      if (isLoggedIn && user?.id === userId) {
          setActiveTab('PROFILE');
          setTargetUserId(null);
      } else {
          setActiveTab('USER_PROFILE');
          setTargetUserId(userId);
      }
  };

  useEffect(() => {
    if (viewState === 'APP') {
      const fetchPosts = async () => {
        setIsFeedLoading(true);
        try {
          let endpoint = '';
          switch (activeFeedTab) {
            case 'RECOMMEND': endpoint = '/community/posts/recommend'; break;
            case 'LATEST': endpoint = '/community/posts/latest'; break;
            case 'FOLLOWING': endpoint = '/community/posts/following'; break;
            default: endpoint = '/community/posts/recommend';
          }
          const data = await api.get<any, Post[]>(endpoint);
          if (Array.isArray(data)) {
            setDisplayPosts(data);
          } else {
            setDisplayPosts([]);
          }
        } catch (error) {
          console.error("Failed to fetch posts:", error);
        } finally {
          setIsFeedLoading(false);
        }
      };
      fetchPosts();
    }
  }, [activeFeedTab, viewState]); 

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
            setViewState('APP');
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

  const MainApp = () => (
    <div className="flex h-screen w-full bg-[#05050a] text-white overflow-hidden relative">
      
      {/* Navigation */}
      <nav className="w-16 md:w-20 bg-black/40 border-r border-white/5 flex flex-col items-center py-8 z-50 backdrop-blur-xl shrink-0">
        <div className="mb-10 text-2xl font-bold tracking-tighter">U.</div>
        <div className="flex flex-col gap-8 w-full">
          <SidebarBtn icon={<Home size={24} />} isActive={activeTab === 'HOME'} onClick={() => setActiveTab('HOME')} label="首页"/>
          <SidebarBtn icon={<Search size={24} />} isActive={activeTab === 'SEARCH'} onClick={() => setActiveTab(activeTab === 'SEARCH' ? 'HOME' : 'SEARCH')} label="搜索"/>
          <SidebarBtn icon={<Trophy size={24} />} isActive={activeTab === 'LEADERBOARD'} onClick={() => setActiveTab(activeTab === 'LEADERBOARD' ? 'HOME' : 'LEADERBOARD')} label="榜单"/>
        </div>
        <div className="mt-auto">
          <SidebarBtn 
            icon={<User size={24} />} 
            isActive={activeTab === 'PROFILE'} 
            onClick={() => {
                setActiveTab('PROFILE');
                setTargetUserId(null); 
            }} 
            label="我的"
          />
        </div>
      </nav>

      {/* Panels */}
      <SidebarPanel 
        activeTab={activeTab} 
        onClose={() => setActiveTab('HOME')}
        onSelectPost={(post) => openPostDetail(post)} // 侧边栏点击也使用带历史记录的方法
        targetUserId={targetUserId} 
      />

      {/* Main Feed Content Area */}
      <main className="flex-1 relative overflow-y-auto scroll-smooth">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#05050a]/80 backdrop-blur-md border-b border-white/5">
           <div className="flex gap-2">
             <TabButton label="推荐" isActive={activeFeedTab === 'RECOMMEND'} onClick={() => setActiveFeedTab('RECOMMEND')} />
             <TabButton label="关注" isActive={activeFeedTab === 'FOLLOWING'} onClick={() => setActiveFeedTab('FOLLOWING')} />
             <TabButton label="最新" isActive={activeFeedTab === 'LATEST'} onClick={() => setActiveFeedTab('LATEST')} />
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

        {/* Feed Grid */}
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
                    // 这里改为调用 openImageView
                    onClick={() => openImageView(post)}
                    className="break-inside-avoid relative group rounded-xl overflow-hidden bg-[#1a1a1a] cursor-pointer border border-white/5 hover:border-white/20 transition-all shadow-lg hover:shadow-purple-900/20"
                  >
                    {/* Image Area */}
                    <div className="relative w-full">
                       <img 
                        src={post.imageUrl} 
                        alt={post.title || '用户作品'}
                        className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-85 transition-opacity duration-300" />
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      {post.title && (
                        <h3 className="text-base font-bold text-white mb-1 leading-snug drop-shadow-md line-clamp-1">{post.title}</h3>
                      )}
                      {post.content && (
                        <p className={`text-sm text-gray-300 mb-3 drop-shadow-sm line-clamp-2 ${!post.title ? 'text-white font-medium' : ''}`}>{post.content}</p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-2">
                         <div 
                           className="flex items-center gap-2 cursor-pointer"
                           onClick={(e) => {
                               e.stopPropagation();
                               handleUserClick(post.author.id);
                           }}
                         >
                           <div className="w-6 h-6 rounded-full overflow-hidden border border-white/30 shrink-0">
                              <img src={post.author?.avatar || 'https://github.com/shadcn.png'} alt={post.author?.name} className="w-full h-full object-cover" />
                           </div>
                           <span className="text-xs text-gray-300 font-medium truncate max-w-[80px] hover:text-white">
                             {post.author?.name || 'Unknown'}
                           </span>
                         </div>

                         <div className="flex items-center gap-3 text-gray-300">
                            <button className="flex items-center gap-1 hover:text-red-400 transition-colors group/btn">
                               <Heart size={16} className={`group-hover/btn:scale-110 transition-transform ${post.isLiked ? 'fill-red-400 text-red-400' : ''}`}/>
                               <span className="text-xs font-medium">{formatNumber(post.likesCount)}</span>
                            </button>
                            {/* 这里改为调用 openPostDetail */}
                            <button 
                              onClick={(e) => { e.stopPropagation(); openPostDetail(post); }} 
                              className="flex items-center gap-1 hover:text-blue-400 transition-colors group/btn"
                            >
                               <MessageSquare size={16} className="group-hover/btn:scale-110 transition-transform"/>
                               <span className="text-xs font-medium">{formatNumber(post.commentsCount)}</span>
                            </button>
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          )}
          
          {!isFeedLoading && displayPosts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-4">
                 <ImageIcon size={48} className="opacity-20" />
                 <p>暂无内容</p>
              </div>
          )}
        </div>

        <div className="fixed bottom-10 left-[calc(50%+2rem)] md:left-[calc(50%+2.5rem)] -translate-x-1/2 z-40">
           <button onClick={handleCreateClick} className="group relative flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white font-semibold shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60 hover:scale-105 active:scale-95 transition-all duration-300 ring-1 ring-white/20">
              <div className="absolute inset-0 rounded-full bg-white/20 blur-md opacity-0 group-hover:opacity-50 transition-opacity" />
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="tracking-wide">去创作</span>
           </button>
        </div>
      </main>

      {/* Modals - 关闭时调用 handleCloseModal */}
      {selectedPost && (
        <DetailView 
            post={selectedPost} 
            onClose={handleCloseModal} 
            onUserClick={handleUserClick} 
            onPostUpdate={handlePostUpdate} 
        />
      )}
      {viewingImage && (
        <ImageView 
            post={viewingImage} 
            onClose={handleCloseModal} 
            onUserClick={handleUserClick} 
            onPostUpdate={handlePostUpdate} 
        />
      )}
    </div>
  );

  return viewState === 'LANDING' ? <LandingPage /> : <MainApp />;
};

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

const SidebarBtn = ({ icon, isActive, onClick, label }: { icon: React.ReactNode, isActive: boolean, onClick: () => void, label: string }) => (
  <button onClick={onClick} className="relative group flex flex-col items-center gap-1">
    <div className={`p-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>
      {icon}
    </div>
    {isActive && (<div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />)}
  </button>
);

export default CommunityPage;