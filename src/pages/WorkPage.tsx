import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/workPage/Sidebar';
import MainView from '../components/workPage/MainView';
import { Modal } from '../components/pay/Modal';
import { PromptInput } from '../components/workPage/PromptInput';
import { ChatMessage } from '../components/workPage/ChatMessage';
import { mockAiService } from '../services/mockAiService';
import type { Message } from '../types';
import { Sender, AppMode } from '../types';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HistoryView from '../components/workPage/HistoryView'; // 确保导入路径正确
import { DocumentView } from '../components/workPage/DocumentView';
import type { HistoryItem } from '../types';


const WorkPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ 新增：用于追踪当前会话ID，实现“更新旧记录”而非“总是新增”
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  const [viewState, setViewState] = useState<'landing' | 'chat' | 'document' | 'history'>('landing');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.TEXT_CHAT);

  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleLoginClick = () => {
    navigate('/login');
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
  // ✅ 修改：保存当前会话逻辑 (支持更新现有记录)
  const saveCurrentChatToHistory = () => {
    if (messages.length === 0) return;

    const currentMessages = [...messages];
    const firstUserMsg = currentMessages.find(m => m.sender === Sender.USER);
    const title = firstUserMsg 
      ? (firstUserMsg.content.slice(0, 20) + (firstUserMsg.content.length > 20 ? '...' : ''))
      : '新的对话';

    if (currentSessionId) {
      // 如果是旧会话，更新它并移到最前
      setHistoryList(prevList => {
        const otherItems = prevList.filter(item => item.id !== currentSessionId);
        const updatedItem: HistoryItem = {
          id: currentSessionId,
          title: title,
          timestamp: Date.now(),
          messages: currentMessages,
          type: currentMode === AppMode.AI_DRAWING ? 'IMAGE' : 'TEXT',
        };
        return [updatedItem, ...otherItems];
      });
    } else {
      // 如果是新会话，创建新的
      const newId = Date.now().toString();
      const newItem: HistoryItem = {
        id: newId,
        title: title,
        timestamp: Date.now(),
        messages: currentMessages,
        type: currentMode === AppMode.AI_DRAWING ? 'IMAGE' : 'TEXT',
      };
      setHistoryList(prev => [newItem, ...prev]);
      setCurrentSessionId(newId); // 标记当前会话ID
    }
  };

  const handleSendMessage = async (prompt: string, base64?: string) => {
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
      const response = await mockAiService.processRequest(currentMode, prompt);
      setMessages(prev => prev.filter(msg => msg.id !== loadingId));

      if (response.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: Sender.AI,
          content: response.data.description || response.data.text || "内容已生成。",
          timestamp: Date.now(),
          type: currentMode === AppMode.AI_DRAWING ? 'image' : 'text',
          imageUrl: response.data.imageUrl
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error("生成内容时出错", error);
      setMessages(prev => prev.filter(msg => msg.id !== loadingId));
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: Sender.AI,
        content: "抱歉，生成内容时出现错误，请重试。",
        timestamp: Date.now(),
        type: 'text'
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBackToLanding = () => {
    saveCurrentChatToHistory();
    setMessages([]);
    setCurrentSessionId(null); // 重置会话ID
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

  // ✅ 新增：删除历史记录逻辑
  const handleDeleteHistory = (id: string) => {
    setHistoryList(prev => prev.filter(item => item.id !== id));
    if (currentSessionId === id) {
      setCurrentSessionId(null);
      setMessages([]);
    }
  };

  // ✅ 修改：恢复历史记录逻辑
  const handleRestoreHistory = (item: HistoryItem) => {
    setMessages(item.messages); // 恢复消息
    setCurrentSessionId(item.id); // 恢复 Session ID
    setViewState('chat'); // 跳转回 Chat 视图
    
    // 如果是图片类型的历史，可能需要同步更新 currentMode，这里可视需求添加
    if (item.type === 'IMAGE') {
       setCurrentMode(AppMode.AI_DRAWING);
    } else {
       setCurrentMode(AppMode.TEXT_CHAT); 
    }
  };


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
            <>
              <div className="flex items-center gap-2">
               <div className="text-sm text-gray-400">
                  <span className="text-orange-400 font-semibold">Loblok UPC Pro</span> 现已上线 UINO，
                  <a href="#" className="underline decoration-orange-400 underline-offset-4 hover:text-white transition-colors">免费试用</a>
                </div>
              </div>
              <div className="flex items-center gap-8 pr-8">
                <div className="flex items-center gap-4 text-gray-400 text-sm">
                  <button className="hover:text-white"><i className="fa-solid fa-globe"></i> 中文</button>
                  <button onClick={handleLoginClick} className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-lg transition-all">登录</button>
                </div>
              </div>
            </>
          )}
        </header>

        <div className="flex-1 overflow-hidden relative">
          {viewState === 'landing' && (
            <div className="h-full overflow-y-auto">
              <MainView onSendMessage={handleMainViewSend} onModeChange={handleModeChange} currentMode={currentMode} />
            </div>
          )}
           {viewState === 'document' && (
            <div className="h-full overflow-y-auto">
              <DocumentView/>
            </div>
          )}
          
          {/* ✅ 传递 handleRestoreHistory 和 handleDeleteHistory */}
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