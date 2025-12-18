import React, { useState, useRef, useEffect, useCallback } from 'react';
import Sidebar from '../components/workPage/Sidebar';
import { MobileNavBar } from '../components/workPage/MobileNavBar'; // 导入新组件
import MainView from '../components/workPage/MainView';
import { Modal } from '../components/pay/Modal';
import { PromptInput } from '../components/workPage/PromptInput';
import { ChatMessage } from '../components/workPage/ChatMessage';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import HistoryView from '../components/workPage/HistoryView';
import { DocumentView } from '../components/workPage/DocumentView';
import { UserMenu } from '../components/workPage/UserMenu';
import { Sender, AppMode } from '../types';
import type { HistoryItem, Message } from '../types';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const PAGE_SIZE = 10;

const WorkPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const [viewState, setViewState] = useState<'landing' | 'chat' | 'document' | 'history'>('landing');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.TEXT_CHAT);

  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    isLoggedIn,
    user,
    logout,
    checkGenerationPermission,
    refreshResources,
    isLoading
  } = useAuth();

  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setViewState(location.state.activeTab);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleLoginClick = () => {
    if (!isLoggedIn) {
      navigate('/login', {
        state: {
          from: location.pathname,
          returnTab: viewState
        }
      });
    }
  };

  const handleLogout = () => {
    logout();
    setIsSidebarCollapsed(false);
    setIsModalOpen(false);
    setCurrentSessionId(null);
    setViewState('landing');
    setMessages([]);
    setIsGenerating(false);
    setCurrentMode(AppMode.TEXT_CHAT);
    setHistoryList([]);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const fetchHistory = useCallback(async (isRefresh = false) => {
    if (!isLoggedIn) return;
    if (!isRefresh && (!hasMore || isHistoryLoading)) return;

    setIsHistoryLoading(true);
    
    try {
      const currentPage = isRefresh ? 1 : page;
      
      const response: any = await api.get('/history/list', {
        params: {
          page: currentPage,
          pageSize: PAGE_SIZE
        }
      });

      const newItems = Array.isArray(response) ? response : (response.list || []);

      if (isRefresh) {
        setHistoryList(newItems);
        setPage(2);
        setHasMore(newItems.length >= PAGE_SIZE);
      } else {
        setHistoryList(prev => {
          const combined = [...prev, ...newItems];
          const uniqueMap = new Map(combined.map(item => [item.id, item]));
          return Array.from(uniqueMap.values());
        });
        setPage(prev => prev + 1);
        setHasMore(newItems.length >= PAGE_SIZE);
      }

    } catch (error) {
      console.error('获取历史记录失败:', error);
    } finally {
      setIsHistoryLoading(false);
    }
  }, [isLoggedIn, page, hasMore, isHistoryLoading]);

  useEffect(() => {
    if (viewState === 'history' && isLoggedIn && historyList.length === 0) {
      fetchHistory(true);
    }
  }, [viewState, isLoggedIn]);

  const saveCurrentChatToHistory = () => {
    if (messages.length === 0) return;
  };

  const handleSendMessage = async (prompt: string, base64?: string) => {
    const permission = checkGenerationPermission(currentMode, {
      requireHD: false,
      estimatedCost: undefined
    });

    if (!permission.allowed) {
      alert(permission.reason || "您没有权限进行此操作");
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: Sender.USER,
      content: prompt,
      timestamp: Date.now(),
      type: 'text'
    };
    setMessages(prev => [...prev, newMessage]);

    if (base64) {
      const imageMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: Sender.USER,
        content: '',
        timestamp: Date.now(),
        type: 'image',
        imageUrl: base64
      };
      setMessages(prev => [...prev, imageMessage]);
    }

    setViewState('chat');
    setIsGenerating(true);

    const loadingId = 'loading-' + Date.now();
    setMessages(prev => [...prev, {
      id: loadingId,
      sender: Sender.AI,
      content: '',
      timestamp: Date.now(),
      type: 'loading'
    }]);

    try {
      const response: any = await api.post('/ai/generate', {
        mode: currentMode,
        prompt,
        referenceImage: base64,
        sessionId: currentSessionId
      });

      setMessages(prev => prev.filter(msg => msg.id !== loadingId));

      const aiMessage: Message = {
        id: Date.now().toString(),
        sender: Sender.AI,
        content: response?.content || "内容已生成。",
        timestamp: Date.now(),
        type: currentMode === AppMode.AI_DRAWING ? 'image' : 'text',
        imageUrl: response?.imageUrl
      };

      setMessages(prev => [...prev, aiMessage]);
      
      if (response?.sessionId) {
        setCurrentSessionId(response.sessionId);
      }
      
      await refreshResources();

    } catch (error: any) {
      await refreshResources();
      setMessages(prev => prev.filter(msg => msg.id !== loadingId));

      let errorMsg = "抱歉，生成失败，请重试。";
      if (error.response?.data?.code === 1008) {
        errorMsg = "算力不足，请获取后重试。";
      } else if (error.response?.data?.code === 1009) {
        errorMsg = "今日使用次数已达上限。";
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: Sender.AI,
        content: errorMsg,
        timestamp: Date.now(),
        type: 'text'
      }]);
    } finally {
      setIsGenerating(false);
    }
  }

  const handleBackToLanding = () => {
    saveCurrentChatToHistory();
    setMessages([]);
    setCurrentSessionId(null);
    setViewState('landing');
  };

  const handleModeChange = (mode: AppMode) => {
    setCurrentMode(mode);
  };

  const handleMainViewSend = (prompt: string, base64?: string, mode?: AppMode) => {
    if (mode) setCurrentMode(mode);
    handleSendMessage(prompt, base64);
  };

  const handleNavigate = (viewId: string) => {
    if (viewState === 'chat' && messages.length > 0) {
      saveCurrentChatToHistory();
    }

    if (viewId === 'upgrade') {
        setIsModalOpen(true);
        return;
    }

    if (viewId === 'landing') {
      setMessages([]);
      setCurrentSessionId(null);
      setViewState('landing');
    } else if (viewId === 'document') {
      setViewState('document');
    } else if (viewId === 'history') {
      setViewState('history');
      if (isLoggedIn && historyList.length === 0) {
        fetchHistory(true);
      }
    } else if (viewId === 'chat') {
      setViewState('chat');
    } else if (viewId === 'new') {
        setMessages([]);
        setCurrentSessionId(null);
        setViewState('landing');
    }
  };

  const handleDeleteHistory = async (id: string) => {
    if (!confirm('确定删除此记录吗？')) return;
    
    try {
      await api.delete(`/history/${id}`);
      setHistoryList(prev => prev.filter(item => item.id !== id));
      if (currentSessionId === id) {
        setCurrentSessionId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('删除失败', error);
      alert('删除失败，请重试');
    }
  };

 const handleRestoreHistory = (item: HistoryItem) => {
    const normalizedMessages: Message[] = (item.messages || []).map((msg: any) => {
      const rawType = msg.type ? msg.type.toUpperCase() : 'TEXT';
      let frontendType = 'text';
      
      if (msg.imageUrl) {
        frontendType = 'image';
      } else if (rawType === 'IMAGE' && !msg.imageUrl) {
        frontendType = 'text';
      } else {
        frontendType = rawType.toLowerCase();
      }

      return {
        ...msg,
        type: frontendType, 
        imageUrl: msg.imageUrl || undefined
      };
    });

    setMessages(normalizedMessages);
    setCurrentSessionId(item.id);
    setViewState('chat');

    if (item.type && item.type.toUpperCase() === 'IMAGE') {
      setCurrentMode(AppMode.AI_DRAWING);
    } else {
      setCurrentMode(AppMode.TEXT_CHAT);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f0c29] text-white">
        <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
      </div>
    );
  }

  return (
    // 修改点 1: flex-col md:flex-row (手机上下，电脑左右)
    <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-[#0f0c29] text-white font-sans overflow-hidden">
      
      {/* 桌面端侧边栏 - 在 mobile 隐藏 */}
      <div className="hidden md:flex">
        <Sidebar
            isCollapsed={isSidebarCollapsed}
            toggleSidebar={toggleSidebar}
            openUpgradeModal={() => setIsModalOpen(true)}
            currentView={viewState}
            onNavigate={handleNavigate}
        />
      </div>

      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* 顶部 Header - 手机端保留用于显示用户信息和登录 */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 shrink-0 relative z-30 border-b border-white/10 bg-[#0f0c29]">
          {viewState === 'chat' ? (
            <button
              onClick={handleBackToLanding}
              className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors px-2 py-2 rounded-lg hover:bg-white/5"
            >
              <ChevronLeft size={18} />
              <span>返回</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-400 truncate max-w-[200px]">
                <span className="text-orange-400 font-semibold">UPC Pro</span>
                <span className="hidden sm:inline"> 现已上线，<a href="#" className="underline">免费试用</a></span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 md:gap-6 pr-0 md:pr-4">
            <button className="hidden md:flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
              <i className="fa-solid fa-globe"></i> 中文
            </button>

            {!isLoggedIn ? (
              <button
                onClick={handleLoginClick}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 md:px-5 md:py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2"
              >
                登录
              </button>
            ) : (
              <UserMenu onLogout={handleLogout} user={user!} />
            )}
          </div>
        </header>

        {/* 主内容区域 - 底部留出空间给 MobileNavbar (pb-20) */}
        <div className="flex-1 overflow-hidden relative pb-20 md:pb-0">
          {viewState === 'landing' && (
            <div className="h-full overflow-y-auto">
              <MainView onSendMessage={handleMainViewSend} onModeChange={handleModeChange} currentMode={currentMode} />
            </div>
          )}
          {viewState === 'document' && (
            <div className="h-full overflow-y-auto">
              <DocumentView />
            </div>
          )}

          {viewState === 'history' && (
            <div className="h-full overflow-y-auto">
              <HistoryView
                historyItems={historyList}
                isLoading={isHistoryLoading} 
                hasMore={hasMore} 
                onLoadMore={() => fetchHistory(false)} 
                onSelectHistory={handleRestoreHistory}
                onDeleteHistory={handleDeleteHistory}
              />
            </div>
          )}

          {viewState === 'chat' && (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto px-2 md:px-8 py-4">
                <div className="max-w-4xl mx-auto space-y-6">
                  {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              <div className="border-t border-white/10 pt-4 pb-6 px-4">
                <div className="max-w-4xl mx-auto">
                  <PromptInput onSend={handleSendMessage} disabled={isGenerating} placeholder="继续对话..." compact />
                </div>
              </div>
            </div>
          )}
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        
        {/* 移动端底部导航栏 - 仅在 mobile 显示 */}
        <div className="md:hidden">
            <MobileNavBar 
                currentView={viewState} 
                onNavigate={handleNavigate}
                onOpenUpgrade={() => setIsModalOpen(true)}
            />
        </div>
      </main>
    </div>
  );
};

export default WorkPage;