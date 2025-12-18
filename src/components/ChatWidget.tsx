import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send,  Minus, Bot } from 'lucide-react';
import type { ChatMessage } from '../types';
import api from '../utils/api'; 

interface ChatResponse {
  reply: string; 
  references?: string[]; 
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: '欢迎回来！我是UPC智能助手。关于会员订阅、积分规则或功能使用，随时问我。',
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // 构建用户消息
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-5).map(m => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.text
      }));

      const response = await api.post<ChatResponse>('/chat/completions', {
        message: userMsg.text,
        history: historyPayload
      });

      const responseText = (response as any).reply || (response as any).text || "抱歉，我没有理解您的意思。";

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "网络连接异常，请稍后再试或联系人工客服。",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg transition-transform duration-300 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <MessageSquare className="w-8 h-8" />
      </button>

      <div 
        className={`fixed bottom-6 right-6 w-[380px] h-[600px] max-w-[calc(100vw-48px)] max-h-[calc(100vh-100px)] bg-[#f5f7f9] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
      >
        <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200">
           <div className="flex items-center space-x-3">
             <div className="w-2 h-2 rounded-full bg-green-500"></div>
             <div className="font-bold text-gray-700">UPC 智能客服</div>
           </div>
           <div className="flex items-center space-x-3">
             <button className="text-gray-400 hover:text-gray-600">
                <Minus className="w-5 h-5" />
             </button>
             <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
             </button>
           </div>
        </div>

        <div className="bg-gray-100 p-4">
             <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex items-start space-x-3">
                <div className="bg-blue-500 p-1.5 rounded-full mt-1 shrink-0">
                    <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div className="text-xs text-gray-600">
                    <p className="mb-1">客服工作时间9:00-18:00。如遇复杂问题，请点击下方链接提交工单。</p>
                    <a href="https://upc.net/submitticket?step=2&deptid=1" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">提交工单/Submit Ticket</a>
                </div>
             </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f5f7f9]">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
               {msg.role === 'model' && (
                 <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2 shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                 </div>
               )}
               <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                 msg.role === 'user' 
                   ? 'bg-white text-gray-800 rounded-tr-sm shadow-sm border border-gray-100' 
                   : 'bg-white text-gray-800 rounded-tl-sm shadow-sm border border-gray-100'
               }`}>
                  {msg.text}
               </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2 shrink-0">
                    <Bot className="w-5 h-5 text-white" />
               </div>
               <div className="bg-white p-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center space-x-1">
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white p-4 border-t border-gray-200">
           <div className="relative flex items-center bg-gray-50 rounded-full px-4 py-2 border border-gray-200 focus-within:border-blue-400 transition-colors">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="询问关于会员、积分或功能的问题..."
                className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
              />
              <div className="flex items-center space-x-2 ml-2">
                <button 
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${input.trim() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400'}`}
                >
                    <Send className="w-4 h-4" />
                </button>
              </div>
           </div>
        </div>
      </div>
    </>
  );
};

export default ChatWidget;