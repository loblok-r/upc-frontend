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

const WorkPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 双视图状态管理
  const [viewState, setViewState] = useState<'landing' | 'chat'>('landing');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.TEXT_CHAT);

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
    setMessages([]);
    setViewState('landing');
  };

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

  return (
    <div className="flex h-screen w-full bg-[#0f0c29] text-white font-sans overflow-hidden">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        openUpgradeModal={() => setIsModalOpen(true)}
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
                <h1 className="text-lg font-semibold text-white">AI 创作工作台</h1>
                {/* <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-slate-300">
                  {Object.keys(AppMode).find(key => AppMode[key as keyof typeof AppMode] === currentMode)?.replace('_', ' ') || 'AI 绘图'}
                </span> */}
              </div>

              {/* 右侧：工具栏 */}
              <div className="flex items-center gap-8 pr-8"> {/* 添加 pr-8 */}
                <div className="text-sm text-gray-400">
                  <span className="text-orange-400 font-semibold">Loblok UPC Pro</span> 现已上线 UINO，
                  <a href="#" className="underline decoration-orange-400 underline-offset-4 hover:text-white transition-colors">免费试用</a>
                </div>
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