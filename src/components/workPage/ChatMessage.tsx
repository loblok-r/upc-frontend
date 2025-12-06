import React from 'react';
import type { Message, Sender } from '../../types';
import { 
  Bot, 
  User, 
  RotateCw, 
  Download, 
  ThumbsUp, 
  ThumbsDown, 
  Copy,
  Loader2,
  Sparkles
} from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAi = message.sender === 'AI';

  return (
    <div className={`flex w-full py-8 ${isAi ? '' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className="max-w-4xl mx-auto w-full flex gap-4 md:gap-6 px-4">
        
        {/* Avatar */}
        <div className="shrink-0 mt-1">
          {isAi ? (
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/50">
              <Sparkles size={20} />
            </div>
          ) : (
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
              <User size={20} />
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200 text-sm md:text-base">
              {isAi ? 'AI Generating' : 'You'}
            </span>
            {isAi && message.type === 'image' && (
              <span className="text-xs text-purple-400 font-normal">
                 • 图像生成完毕
              </span>
            )}
          </div>

          {/* Text Content */}
          {message.content && message.type !== 'image' && (
             <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
               {message.content}
             </div>
          )}

          {/* Loading State */}
          {message.type === 'loading' && (
            <div className="flex items-center gap-3 text-purple-400 py-2">
               <Loader2 size={20} className="animate-spin" />
               <span className="text-sm font-medium">正在生成您的创意...</span>
            </div>
          )}

          {/* Image Content */}
          {message.type === 'image' && message.imageUrl && (
            <div className="mt-2 space-y-4">
              <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-black/20 shadow-2xl max-w-2xl">
                <img 
                  src={message.imageUrl} 
                  alt="AI Generated" 
                  className="w-full h-auto object-cover max-h-[500px]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <p className="text-white text-sm font-medium">Nano Banana Pro</p>
                </div>
              </div>
              
              {/* Action Toolbar */}
              <div className="flex items-center gap-2 text-slate-500">
                <ActionButton icon={<RotateCw size={16} />} label="重试" />
                <ActionButton icon={<Download size={16} />} label="下载" />
                <div className="w-px h-4 bg-white/10 mx-1" />
                <ActionButton icon={<ThumbsUp size={16} />} />
                <ActionButton icon={<ThumbsDown size={16} />} />
                <div className="flex-1" />
                <ActionButton icon={<Copy size={16} />} label="复制提示词" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ActionButton: React.FC<{ icon: React.ReactNode; label?: string }> = ({ icon, label }) => (
  <button className="flex items-center gap-1.5 p-2 rounded-md hover:bg-white/5 hover:text-slate-200 transition-colors text-xs font-medium">
    {icon}
    {label && <span>{label}</span>}
  </button>
);