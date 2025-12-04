import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { MessageSquare, X, Send, User, Bot, Minus, Smile, Paperclip } from 'lucide-react';
import type { ChatMessage } from '../../types';
import { AI_SYSTEM_INSTRUCTION } from '../../data/constants';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: '欢迎回来，如果您有任何问题，请告诉我们。',
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<Chat | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Initialize Gemini Chat
  useEffect(() => {
    if (!process.env.API_KEY) {
        console.warn("API_KEY not found in environment variables.");
        return;
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    chatRef.current = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: AI_SYSTEM_INSTRUCTION,
      }
    });
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

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
      if (!chatRef.current) {
         // Fallback if no API key or init failed
         setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'model',
                text: 'System: API Key missing or Chat not initialized. Please check configuration.',
                timestamp: new Date()
            }]);
            setIsLoading(false);
         }, 500);
         return;
      }

      const result = await chatRef.current.sendMessage({ message: userMsg.text });
      const responseText = result.text;

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText || "Sorry, I couldn't generate a response.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "抱歉，我现在遇到了一些连接问题。请稍后再试。",
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
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg transition-transform duration-300 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <MessageSquare className="w-8 h-8" />
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 w-[380px] h-[600px] max-w-[calc(100vw-48px)] max-h-[calc(100vh-100px)] bg-[#f5f7f9] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200">
           <div className="flex items-center space-x-3">
             <button className="text-gray-500 hover:text-gray-700">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
             </button>
             <div className="font-bold text-gray-700">...</div>
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

        {/* System Alert/Notice */}
        <div className="bg-gray-100 p-4">
             <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex items-start space-x-3">
                <div className="bg-blue-500 p-1.5 rounded-full mt-1 shrink-0">
                    <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div className="text-xs text-gray-600">
                    <p className="mb-1">客服暂不在线，工作时间9:00-18:00,您当前可以附带问题截图，点击此链接说明您的问题</p>
                    <a href="#" className="text-blue-600 hover:underline break-all">https://mitce.net/submitticket?step=2&deptid=1</a>
                </div>
             </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f5f7f9]">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
               {msg.role === 'model' && (
                 <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2 shrink-0">
                    <User className="w-4 h-4 text-white" />
                 </div>
               )}
               <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                 msg.role === 'user' 
                   ? 'bg-white text-gray-800 rounded-tr-sm shadow-sm' 
                   : 'bg-white text-gray-800 rounded-tl-sm shadow-sm'
               }`}>
                  {msg.role === 'user' && (
                      <div className="text-xs text-gray-400 mb-1">
                          <div>名字: wr</div>
                          <div>邮箱: abc2865790228@gmail.com</div>
                      </div>
                  )}
                  {msg.text}
               </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2 shrink-0">
                    <User className="w-4 h-4 text-white" />
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

        {/* Input Area */}
        <div className="bg-white p-4 border-t border-gray-200">
           <div className="relative flex items-center bg-gray-50 rounded-full px-4 py-2 border border-gray-200 focus-within:border-blue-400 transition-colors">
              <button className="mr-2 text-gray-400 hover:text-gray-600">
                 <div className="text-xl leading-none">+</div>
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="输入一条消息......"
                className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
              />
              <div className="flex items-center space-x-2 ml-2">
                <button className="text-gray-400 hover:text-gray-600">
                    <Smile className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${input.trim() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400'}`}
                >
                    <Send className="w-4 h-4" />
                </button>
              </div>
           </div>
           <div className="text-center mt-2">
              <a href="https://www.livechat.com" target="_blank" rel="noopener noreferrer" className="text-[10px] text-gray-400 hover:text-gray-500 flex items-center justify-center">
                 Powered by <span className="font-bold text-orange-500 mx-1">LiveChat</span>
              </a>
           </div>
        </div>
      </div>
    </>
  );
};

export default ChatWidget;