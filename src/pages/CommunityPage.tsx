import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Post, SidebarTab, ViewState } from '../types/community';
import api from '../utils/api'; 
import SidebarPanel from '../components/community/SidebarPanel';
import DetailView from '../components/community/DetailView';
import ImageView from '../components/community/ImageView';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Search, Trophy, User, MessageSquare, Heart, 
  Play, Sparkles, Loader2, Image as ImageIcon ,LogIn, Lock 
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

const PAGE_SIZE = 12; // 每页加载的数量

const CommunityPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user } = useAuth();

  const [showLoginGuide, setShowLoginGuide] = useState(false);
  // ... (保留 handleCreateClick 等基础逻辑)
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
  
  // ==========================================
  // 分页状态管理
  // ==========================================
  const [activeFeedTab, setActiveFeedTab] = useState<FeedTabType>('RECOMMEND'); 
  const [displayPosts, setDisplayPosts] = useState<Post[]>([]); 
  
  // 分页相关状态
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); // 是否还有更多数据
  const [isInitialLoading, setIsInitialLoading] = useState(false); // 首次加载/切换Tab加载
  const [isLoadingMore, setIsLoadingMore] = useState(false); // 滚动加载更多
  
  // 滚动容器和观察者 Ref
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostElementRef = useCallback((node: HTMLDivElement) => {
    if (isInitialLoading || isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isInitialLoading, isLoadingMore, hasMore]);

  // ==========================================
  // 历史记录与模态框逻辑 (保留之前的修复)
  // ==========================================
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [viewingImage, setViewingImage] = useState<Post | null>(null);

  const openPostDetail = (post: Post) => {
      setSelectedPost(post);
      window.history.pushState({ modal: 'postDetail' }, '', '');
  };

  const openImageView = (post: Post) => {
      setViewingImage(post);
      window.history.pushState({ modal: 'imageView' }, '', '');
  };

  const handleCloseModal = () => {
      navigate(-1);
  };

  useEffect(() => {
      const handlePopState = () => {
          setSelectedPost(null);
          setViewingImage(null);
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handlePostUpdate = (updatedPost: Post) => {
    setDisplayPosts((prevPosts) => 
      prevPosts.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );
    if (selectedPost && selectedPost.id === updatedPost.id) setSelectedPost(updatedPost);
    if (viewingImage && viewingImage.id === updatedPost.id) setViewingImage(updatedPost);
  };

  const handleUserClick = (userId: string) => {
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

  // ==========================================
  // 核心数据获取逻辑 (分页版)
  // ==========================================
  
  // 1. 切换 Tab 时重置状态
  useEffect(() => {
    if (viewState === 'APP') {
      setDisplayPosts([]);
      setPage(1);
      setHasMore(true);
      setIsInitialLoading(true); // 标记为初始加载
      
      // 立即触发第一页加载
      fetchPosts(1, activeFeedTab);
    }
  }, [activeFeedTab, viewState]);

  // 2. 页码变化时加载更多 (page > 1)
  useEffect(() => {
    if (page > 1 && viewState === 'APP') {
      setIsLoadingMore(true);
      fetchPosts(page, activeFeedTab);
    }
  }, [page]);

  const fetchPosts = async (pageNum: number, tabType: FeedTabType) => {
    try {
      if (pageNum === 1) setShowLoginGuide(false);
      let endpoint = '';
      switch (tabType) {
        case 'RECOMMEND': endpoint = '/community/posts/recommend'; break;
        case 'LATEST': endpoint = '/community/posts/latest'; break;
        case 'FOLLOWING': endpoint = '/community/posts/following'; break;
        default: endpoint = '/community/posts/recommend';
      }

      // API请求：传递分页参数
      const data = await api.get<any, Post[]>(endpoint, {
        params: {
          page: pageNum,
          pageSize: PAGE_SIZE
        }
      });
      
      if (Array.isArray(data)) {
        if (pageNum === 1) {
          setDisplayPosts(data);
        } else {
          // 追加数据，注意去重（防止React strict mode下的重复请求）
          setDisplayPosts(prev => {
            const newPosts = data.filter(newItem => !prev.some(prevItem => prevItem.id === newItem.id));
            return [...prev, ...newPosts];
          });
        }
        
        // 判断是否还有更多数据
        // 如果返回的数据少于页大小，说明是最后一页
        setHasMore(data.length === PAGE_SIZE);
      } else {
        setHasMore(false);
      }

    } catch (error: any) {
      console.error("Failed to fetch posts:", error);
      if (error.response && error.response.status === 401) {
        setShowLoginGuide(true); // 显示登录引导
        setHasMore(false);       // 停止加载更多
      }
      // 错误时停止无限加载
      setHasMore(false);
    } finally {
      setIsInitialLoading(false);
      setIsLoadingMore(false);
    }
  };

  // ... (保留 LandingPage)
  const LandingPage = () => (
    <div className="min-h-screen bg-[#05050a] flex flex-col items-center justify-center relative overflow-hidden">
      {/* ... (LandingPage 内容保持不变) */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      
      <div className="z-10 text-center space-y-8 p-6 max-w-2xl">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">UPC Nexus</h1>
        <p className="text-gray-400 text-lg md:text-xl font-light">每张AI图片都有一个故事，分享你的。<br/>通过AI艺术重新发现社交互动。</p>
        <button 
          onClick={() => { setViewState('APP'); setActiveFeedTab('RECOMMEND'); }}
          className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-semibold transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)]"
        >
          <span>进入社区</span>
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white group-hover:rotate-90 transition-transform"><Play size={14} fill="white" /></div>
        </button>
      </div>
    </div>
  );

  const MainApp = () => (
    <div className="flex h-screen w-full bg-[#05050a] text-white overflow-hidden relative">
      
      {/* ... (Navigation 和 SidebarPanel 保持不变) */}
      <nav className="w-16 md:w-20 bg-black/40 border-r border-white/5 flex flex-col items-center py-8 z-50 backdrop-blur-xl shrink-0">
        <div className="mb-10 text-2xl font-bold tracking-tighter">U.</div>
        <div className="flex flex-col gap-8 w-full">
          <SidebarBtn icon={<Home size={24} />} isActive={activeTab === 'HOME'} onClick={() => setActiveTab('HOME')} label="首页"/>
          <SidebarBtn icon={<Search size={24} />} isActive={activeTab === 'SEARCH'} onClick={() => setActiveTab(activeTab === 'SEARCH' ? 'HOME' : 'SEARCH')} label="搜索"/>
          <SidebarBtn icon={<Trophy size={24} />} isActive={activeTab === 'LEADERBOARD'} onClick={() => setActiveTab(activeTab === 'LEADERBOARD' ? 'HOME' : 'LEADERBOARD')} label="榜单"/>
        </div>
        <div className="mt-auto">
          <SidebarBtn icon={<User size={24} />} isActive={activeTab === 'PROFILE'} onClick={() => { setActiveTab('PROFILE'); setTargetUserId(null); }} label="我的"/>
        </div>
      </nav>

      <SidebarPanel activeTab={activeTab} onClose={() => setActiveTab('HOME')} onSelectPost={(post) => openPostDetail(post)} targetUserId={targetUserId} />

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
              <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">v2.5 模型已激活</span>
           </div>
        </div>

        {/* Feed Grid */}
        <div className="p-4 md:p-6 lg:p-8 pb-32">
          {showLoginGuide ? (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-2xl border border-white/5">
                <Lock className="w-10 h-10 text-purple-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">登录探索更多精彩</h2>
              <p className="text-slate-400 text-center max-w-md mb-8">
                加入 UPC 社区，查看更多 AI 创意作品，关注你喜欢的创作者，并分享你的灵感。
              </p>
              <button
                onClick={() => navigate('/login', { state: { from: location.pathname } })}
                className="group relative flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-full transition-all shadow-lg hover:shadow-purple-500/25"
              >
                <LogIn size={18} />
                <span>立即登录</span>
              </button>
            </div>
          ) : (
             /* 这里放原来的正常的列表渲染逻辑 */
             <>
               {isInitialLoading && displayPosts.length === 0 ? (
                  // Loading...
                  <div className="flex items-center justify-center h-64 w-full">
                      <Loader2 size={40} className="text-purple-500 animate-spin" />
                  </div>
               ) : (
                  // List...
                  <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {displayPosts.map((post, index) => {
                      // 如果是最后一个元素，添加 ref 以进行滚动监听
                      const isLastElement = index === displayPosts.length - 1;
                      return (
                        <div 
                            key={post.id} 
                            // 将 ref 赋给最后一个元素
                            ref={isLastElement ? lastPostElementRef : null}
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
                              {post.title && <h3 className="text-base font-bold text-white mb-1 leading-snug drop-shadow-md line-clamp-1">{post.title}</h3>}
                              {post.content && <p className={`text-sm text-gray-300 mb-3 drop-shadow-sm line-clamp-2 ${!post.title ? 'text-white font-medium' : ''}`}>{post.content}</p>}

                              <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-2">
                                <div className="flex items-center gap-2 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleUserClick(post.author.id); }}>
                                  <div className="w-6 h-6 rounded-full overflow-hidden border border-white/30 shrink-0">
                                      <img src={post.author?.avatar || 'https://github.com/shadcn.png'} alt={post.author?.name} className="w-full h-full object-cover" />
                                  </div>
                                  <span className="text-xs text-gray-300 font-medium truncate max-w-[80px] hover:text-white">{post.author?.name || 'Unknown'}</span>
                                </div>

                                <div className="flex items-center gap-3 text-gray-300">
                                    <button className="flex items-center gap-1 hover:text-red-400 transition-colors group/btn">
                                      <Heart size={16} className={`group-hover/btn:scale-110 transition-transform ${post.isLiked ? 'fill-red-400 text-red-400' : ''}`}/>
                                      <span className="text-xs font-medium">{formatNumber(post.likesCount)}</span>
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); openPostDetail(post); }} className="flex items-center gap-1 hover:text-blue-400 transition-colors group/btn">
                                      <MessageSquare size={16} className="group-hover/btn:scale-110 transition-transform"/>
                                      <span className="text-xs font-medium">{formatNumber(post.commentsCount)}</span>
                                    </button>
                                </div>
                              </div>
                            </div>
                        </div>
                      );
                    })}
                </div>
               )}
             </>
          )}
        
          
          {/* Loading More Indicator */}
          {isLoadingMore && (
              <div className="flex items-center justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-purple-500" />
              </div>
          )}

          {/* End of Feed Indicator */}
          {!hasMore && displayPosts.length > 0 && (
              <div className="text-center py-8 text-gray-600 text-xs">
                  - 已经到底啦 -
              </div>
          )}
          
          {/* Empty State */}
          {!isInitialLoading && !isLoadingMore && displayPosts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-4">
                 <ImageIcon size={48} className="opacity-20" />
                 <p>
                   {activeFeedTab === 'FOLLOWING' 
                     ? '你还没有关注任何人，去“推荐”看看吧' 
                     : '暂无内容，去发布第一条作品吧'}
                 </p>
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

      {/* Modals */}
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

// ... (TabButton, SidebarBtn 保持不变)
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