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
import HistoryView from '../components/workPage/HistoryView';
import { DocumentView } from '../components/workPage/DocumentView';
import type { HistoryItem } from '../types'; 

const WorkPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  // 视图状态管理
  const [viewState, setViewState] = useState<'landing' | 'chat' | 'document' | 'history'>('landing');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.TEXT_CHAT);

   const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  // 自动滚动引用
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

//  新增：保存当前会话到历史记录的函数
  const saveCurrentChatToHistory = () => {
    // 如果没有消息，不保存
    if (messages.length === 0) return;

    // 自动生成标题（取第一条用户消息的前20个字，或者默认标题）
    const firstUserMsg = messages.find(m => m.sender === Sender.USER);
    const title = firstUserMsg 
      ? (firstUserMsg.content.slice(0, 20) + (firstUserMsg.content.length > 20 ? '...' : ''))
      : '新的对话';

    const newHistoryItem: HistoryItem = {
      id: Date.now().toString(),
      title :title,
      // prompt: title,
      type: currentMode === AppMode.AI_DRAWING ? 'IMAGE' : 'TEXT',
      timestamp: Date.now().toString(),
      messages: [...messages] // 关键：克隆当前的消息数组
    };

    setHistoryList(prev => [newHistoryItem, ...prev]); // 添加到列表头部
  };

  // 处理发送消息 - 核心交互逻辑
  const handleSendMessage = async (prompt: string, base64?: string) => {
    // 创建用户文本消息
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: Sender.USER,
      content: prompt,
      timestamp: Date.now(),
      type: 'text'
    };

    // 乐观更新：立即显示用户消息
    setMessages(prev => [...prev, newMessage]);

    // 如果有base64图片数据，则额外创建图片消息
    if (base64) {
      const imageMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: Sender.USER,
        content: '',
        timestamp: Date.now(),
        type: 'image',
        imageUrl: base64
      };

      // 添加图片消息
      setMessages(prev => [...prev, imageMessage]);
    }

    setViewState('chat');
    setIsGenerating(true);

    // 添加AI加载消息
    const loadingId = 'loading-' + Date.now();
    setMessages(prev => [...prev, {
      id: loadingId,
      sender: Sender.AI,
      content: '',
      timestamp: Date.now(),
      type: 'loading'
    }]);

    try {
      // 调用模拟AI服务
      const response = await mockAiService.processRequest(currentMode, prompt);

      // 移除加载消息
      setMessages(prev => prev.filter(msg => msg.id !== loadingId));

      if (response.success) {
        // 创建AI回复消息
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
      // 可以在这里添加错误处理消息
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

  // 返回工作台/启动页
   const handleBackToLanding = () => {
    saveCurrentChatToHistory(); // 离开前保存
    setMessages([]); // 清空当前画布
    setViewState('landing');
  };
// 切换到文档视图

  // 处理MainView中的模式选择
  const handleModeChange = (mode: AppMode) => {
    setCurrentMode(mode);
  };

  // 处理MainView中的直接发送
  const handleMainViewSend = (prompt: string, base64?: string, mode?: AppMode) => {
    if (mode) {
      setCurrentMode(mode);
    }
    handleSendMessage(prompt, base64);
  };

  // 处理侧边栏导航
  const handleNavigate = (viewId: string) => {
    // 如果当前正在聊天视图，且要切换到其他视图，先保存
    if (viewState === 'chat' && messages.length > 0) {
      saveCurrentChatToHistory();
    }

    if (viewId === 'landing') {
      setMessages([]); 
      setViewState('landing');
    } else if (viewId === 'document') {
      setViewState('document');
    } else if (viewId === 'history') {
      setViewState('history');
    } else if (viewId === 'chat') {
       // 如果直接点击侧边栏的 chat，通常意味着新对话或保持当前
       setViewState('chat');
    }
  };

  // 处理删除历史记录
  const handleDeleteHistory = (id: string) => {
    setHistoryList(prev => prev.filter(item => item.id !== id));
    
    // 可选：如果删除的是当前正在进行的会话，重置当前视图
    if (currentSessionId === id) {
      setCurrentSessionId(null);
      setMessages([]);
    }
  };

    // 从历史记录恢复对话
  // 这个函数需要传递给 HistoryView，当用户点击某条历史记录时调用
  const handleRestoreHistory = (item: HistoryItem) => {
    setMessages(item.messages); // 恢复消息
    // setViewState('chat'); // 切换回聊天视图
  };

  return (
    <div className="flex h-screen w-full bg-[#0f0c29] text-white font-sans overflow-hidden">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        openUpgradeModal={() => setIsModalOpen(true)}
        currentView={viewState}  // 传递当前视图状态
        onNavigate={handleNavigate}  // 传递导航处理函数
      />

      <main className="flex-1 flex flex-col min-w-0 relative">

        {/* Header - 根据视图状态变化 */}
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
              {/* 左侧：标题 */}
              <div className="flex items-center gap-2">
               <div className="text-sm text-gray-400">
                  <span className="text-orange-400 font-semibold">Loblok UPC Pro</span> 现已上线 UINO，
                  <a href="#" className="underline decoration-orange-400 underline-offset-4 hover:text-white transition-colors">免费试用</a>
                </div>
                {/* <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-slate-300">
                  {Object.keys(AppMode).find(key => AppMode[key as keyof typeof AppMode] === currentMode)?.replace('_', ' ') || 'AI 绘图'}
                </span> */}
              </div>

              {/* 右侧：工具栏 */}
              <div className="flex items-center gap-8 pr-8"> {/* 添加 pr-8 */}
                <div className="flex items-center gap-4 text-gray-400 text-sm">
                  <button className="hover:text-white"><i className="fa-solid fa-globe"></i> 中文</button>
                  <button
                    onClick={handleLoginClick}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-lg transition-all">
                    登录
                  </button>
                </div>
              </div>
            </>
          )}
        </header>


        {/* 内容区域 - 双视图切换 */}
        <div className="flex-1 overflow-hidden relative">

          {/* 视图一：工作台/Landing View (使用MainView组件) */}
          {viewState === 'landing' && (
            <div className="h-full overflow-y-auto">
              <MainView
                onSendMessage={handleMainViewSend}
                onModeChange={handleModeChange}
                currentMode={currentMode}
              />
            </div>
          )}
           {viewState === 'document' && (
            <div className="h-full overflow-y-auto">
              <DocumentView/>
            </div>
          )}
         {viewState === 'history' && (
            <div className="h-full overflow-y-auto">
              <HistoryView 
                historyItems={historyList} 
                onSelectHistory={handleRestoreHistory} // 假设 HistoryView 支持点击恢复
                onDeleteHistory={handleDeleteHistory}
              />
            </div>
          )}

          {/* 视图二：对话/Chat View */}
          {viewState === 'chat' && (
            <div className="h-full flex flex-col">
              {/* 消息列表区域 */}
              <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4">
                <div className="max-w-4xl mx-auto space-y-6">
                  {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* 底部输入区域 */}
              <div className="border-t border-white/10 pt-4 pb-6 px-4">
                <div className="max-w-4xl mx-auto">
                  <PromptInput
                    onSend={handleSendMessage}
                    disabled={isGenerating}
                    placeholder="继续对话或提出新的需求..."
                    compact
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 升级弹窗 */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </main>
    </div>
  );
};

export default WorkPage;