import React, { useState, useRef, useEffect } from 'react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    isLoggedIn,
    user,
    logout,
    checkGenerationPermission,
    refreshResources,
    isLoading
  } = useAuth();


  // LoginForm 登录成功后会执行: navigate(from, { state: { activeTab: returnTab } });
  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setViewState(location.state.activeTab);

      // 如果是为了防止刷新后仍然读取旧状态，可以在这里清除 location.state
      // 但 React Router 默认行为通常是可以接受的
      window.history.replaceState({}, document.title)
    }
  }, [location]);

  // 更新跳转逻辑，传递当前路径和视图状态
  const handleLoginClick = () => {
    if (!isLoggedIn) {
      // 传递当前路径 (from) 和当前视图 (returnTab)
      navigate('/login', {
        state: {
          from: location.pathname, // 例如 "/" 或 "/work"
          returnTab: viewState     // 例如 "chat", "history", "landing"
        }
      });
    } else {
      console.log('用户已登录，显示下拉菜单');
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

  const saveCurrentChatToHistory = () => {
    if (messages.length === 0) return;

    const currentMessages = [...messages];
    const firstUserMsg = currentMessages.find(m => m.sender === Sender.USER);
    const title = firstUserMsg
      ? (firstUserMsg.content.slice(0, 20) + (firstUserMsg.content.length > 20 ? '...' : ''))
      : '新的对话';

    if (currentSessionId) {
      setHistoryList(prevList => {
        const otherItems = prevList.filter(item => item.id !== currentSessionId);
        const updatedItem: HistoryItem = {
          id: currentSessionId,
          title: title,
          timestamp: Date.now().toString(),
          messages: currentMessages,
          type: currentMode === AppMode.AI_DRAWING ? 'IMAGE' : 'TEXT',
        };
        return [updatedItem, ...otherItems];
      });
    } else {
      const newId = Date.now().toString();
      const newItem: HistoryItem = {
        id: newId,
        title: title,
        timestamp: Date.now().toString(),
        messages: currentMessages,
        type: currentMode === AppMode.AI_DRAWING ? 'IMAGE' : 'TEXT',
      };
      setHistoryList(prev => [newItem, ...prev]);
      setCurrentSessionId(newId);
    }
  };

  const handleSendMessage = async (prompt: string, base64?: string) => {

    // 1. 检查权限
    const permission = checkGenerationPermission(currentMode, {
      requireHD: false, // 根据实际需求调整
      estimatedCost: undefined // 可以计算或传值
    });

    if (!permission.allowed) {
      // 显示权限不足的提示
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
        referenceImage: base64
      });
      console.log('AI生成响应:', response);

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
      await refreshResources(); // 刷新算力等状态

    } catch (error: any) {
      // 关键：不再手动回滚算力！
      await refreshResources(); // 直接拉取最新状态，覆盖本地可能的错误乐观更新

      setMessages(prev => prev.filter(msg => msg.id !== loadingId));

      // 可选：根据错误类型提示不同信息
      let errorMsg = "抱歉，生成失败，请重试。";
    
      console.log('错误响应:', error);
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
    } else if (viewId === 'chat') {
      setViewState('chat');
    }
  };

  const handleDeleteHistory = (id: string) => {
    setHistoryList(prev => prev.filter(item => item.id !== id));
    if (currentSessionId === id) {
      setCurrentSessionId(null);
      setMessages([]);
    }
  };

  const handleRestoreHistory = (item: HistoryItem) => {
    setMessages(item.messages);
    setCurrentSessionId(item.id);
    setViewState('chat');

    if (item.type === 'IMAGE') {
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

            {/* 显示用户资源状态 */}
            {/* {isLoggedIn && userResources && (
              <div className="hidden md:flex items-center gap-3 text-sm">
                {/* 算力显示 */}
            {/* <div className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                  <i className="fa-solid fa-bolt text-yellow-400"></i>
                  <span className="text-white font-medium">{userResources.computingPower}</span>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-400">{userResources.maxComputingPower}</span>
                </div> */}

            {/* 当日使用情况 - 根据会员状态显示不同 */}
            {/* <div className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                  <i className="fa-solid fa-message text-blue-400"></i>
                  <span className="text-white font-medium">{userResources.dailyUsage.textChat}</span>
                  {!user?.isMember ? (
                    // 非会员：显示日限
                    <span className="text-gray-400 text-xs">/20</span>
                  ) : (
                    // 会员：显示无限或隐藏限制
                    <span className="text-green-400 text-xs">/~</span>
                  )}
                </div> */}

            {/* AI绘图使用情况 - 根据会员状态显示不同 */}
            {/* <div className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                  <i className="fa-solid fa-image text-green-400"></i>
                  <span className="text-white font-medium">{userResources.dailyUsage.aiDrawing}</span>
                  {!user?.isMember ? (
                    // 非会员：显示日限
                    <span className="text-gray-400 text-xs">/5</span>
                  ) : (
                    // 会员：显示无限或隐藏限制
                    <span className="text-green-400 text-xs">/~</span>
                  )}
                </div>
              </div> */}
            {/* )} */}
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