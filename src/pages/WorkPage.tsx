import React, { useState, useRef, useEffect, useCallback } from 'react';
import Sidebar from '../components/workPage/Sidebar';
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

const PAGE_SIZE = 10; // 每页加载数量

const WorkPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // 视图状态
  const [viewState, setViewState] = useState<'landing' | 'chat' | 'document' | 'history'>('landing');
  
  // 聊天相关状态
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.TEXT_CHAT);

  // 历史记录相关状态 (分页)
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

  // 初始化：处理路由跳转带来的状态
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

  // ==========================================
  // 核心逻辑：分页获取历史记录
  // ==========================================
  const fetchHistory = useCallback(async (isRefresh = false) => {
    if (!isLoggedIn) return;
    // 如果不是刷新且没有更多数据，或者是正在加载中，则不执行
    if (!isRefresh && (!hasMore || isHistoryLoading)) return;

    setIsHistoryLoading(true);
    
    try {
      const currentPage = isRefresh ? 1 : page;
      
      // 调用后端接口，传递分页参数
      const response: any = await api.get('/history/list', {
        params: {
          page: currentPage,
          pageSize: PAGE_SIZE
        }
      });

      // 兼容后端返回结构：可能是数组，也可能是 { list: [], total: 100 }
      const newItems = Array.isArray(response) ? response : (response.list || []);

      if (isRefresh) {
        //如果是刷新，覆盖列表
        setHistoryList(newItems);
        setPage(2); // 下次加载第2页
        setHasMore(newItems.length >= PAGE_SIZE);
      } else {
        // 如果是加载更多，追加列表 (通过Map去重，防止并发重复)
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

  // 监听视图切换，进入 history 时加载第一页
  useEffect(() => {
    if (viewState === 'history' && isLoggedIn && historyList.length === 0) {
      fetchHistory(true);
    }
  }, [viewState, isLoggedIn]);

  const saveCurrentChatToHistory = () => {
    if (messages.length === 0) return;
    // 这里如果后端已经实时保存，则不需要前端手动添加
    // 如果需要前端即时反馈，可以保留原有逻辑，但要注意和分页数据的合并
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
      const response = await api.post('/ai/generate', {
        mode: currentMode,
        prompt,
        referenceImage: base64,
        sessionId: currentSessionId // 传递 sessionId 保持上下文
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
      
      // 更新当前会话ID
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

    if (viewId === 'landing') {
      setMessages([]);
      setCurrentSessionId(null);
      setViewState('landing');
    } else if (viewId === 'document') {
      setViewState('document');
    } else if (viewId === 'history') {
      setViewState('history');
      // 切换回来时，如果列表为空则加载
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
      // 乐观更新 UI
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
    // 数据清洗逻辑升级
    const normalizedMessages: Message[] = (item.messages || []).map((msg: any) => {
      // 先获取后端原始类型的大写形式
      const rawType = msg.type ? msg.type.toUpperCase() : 'TEXT';
      
      // 智能判断前端类型
      // 规则：如果 imageUrl 存在，那就是 'image'；
      //       否则，不管后端说是 IMAGE 还是 TEXT，只要没图，前端就当 'text' 处理（显示 content）
      let frontendType = 'text';
      
      if (msg.imageUrl) {
        frontendType = 'image';
      } else if (rawType === 'IMAGE' && !msg.imageUrl) {
        // 特殊情况：这是绘图模式下的用户提示词，后端标为 IMAGE 但实际是文本
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

    // 恢复当前的模式状态（这部分保持不变）
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
    <div className="flex h-screen w-full bg-[#0f0c29] text-white font-sans overflow-hidden">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        openUpgradeModal={() => setIsModalOpen(true)}
        currentView={viewState}
        onNavigate={handleNavigate}
      />

      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-16 flex items-center justify-between px-6 shrink-0 relative z-30 border-b border-white/10">
          {viewState === 'chat' ? (
            <button
              onClick={handleBackToLanding}
              className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
            >
              <ChevronLeft size={18} />
              <span>返回工作台</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-400">
                <span className="text-orange-400 font-semibold">Loblok Upc Pro</span> 现已上线 UINO，
                <a href="#" className="underline decoration-orange-400 underline-offset-4 hover:text-white transition-colors">免费试用</a>
              </div>
            </div>
          )}

          <div className="flex items-center gap-6 pr-4">
            <button className="hidden md:flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
              <i className="fa-solid fa-globe"></i> 中文
            </button>

            {!isLoggedIn ? (
              <button
                onClick={handleLoginClick}
                className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2 min-w-[80px] justify-center"
              >
                登录
              </button>
            ) : (
              <UserMenu onLogout={handleLogout} user={user!} />
            )}
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
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
                isLoading={isHistoryLoading} // 传递加载状态
                hasMore={hasMore} // 传递是否还有更多
                onLoadMore={() => fetchHistory(false)} // 传递加载下一页的回调
                onSelectHistory={handleRestoreHistory}
                onDeleteHistory={handleDeleteHistory}
              />
            </div>
          )}

          {viewState === 'chat' && (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4">
                <div className="max-w-4xl mx-auto space-y-6">
                  {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              <div className="border-t border-white/10 pt-4 pb-6 px-4">
                <div className="max-w-4xl mx-auto">
                  <PromptInput onSend={handleSendMessage} disabled={isGenerating} placeholder="继续对话或提出新的需求..." compact />
                </div>
              </div>
            </div>
          )}
        </div>
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </main>
    </div>
  );
};

export default WorkPage;