import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, ArrowUp, Loader2 } from 'lucide-react';

interface PromptInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  compact?: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({ 
  onSend, 
  disabled, 
  placeholder = "描述你想要生成的画面...",
  compact = false
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`relative w-full transition-all group ${
        compact 
          ? 'bg-[#1a1a2e]/90 border border-white/10 rounded-xl backdrop-blur-md' 
          : 'bg-[#0f0f20]/60 border border-purple-500/20 rounded-2xl shadow-[0_0_20px_rgba(100,50,255,0.05)] backdrop-blur-sm'
      }`}>
      
      {!compact && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
      )}

      <div className="relative p-4">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={`w-full resize-none outline-none text-slate-200 placeholder-slate-500 bg-transparent ${compact ? 'text-base py-1' : 'text-lg py-2 min-h-[80px]'}`}
          style={{ maxHeight: '200px' }}
        />
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <button className="text-slate-500 hover:text-slate-300 transition-colors p-1">
              <Paperclip size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-600 font-mono select-none hidden sm:block">{text.length} / 5000</span>
            
            <button 
              onClick={handleSend}
              disabled={!text.trim() || disabled}
              className={`p-2 rounded-full transition-all flex items-center justify-center ${
                text.trim() && !disabled
                  ? 'bg-slate-700 text-white hover:bg-slate-600 shadow-lg' 
                  : 'bg-white/5 text-slate-600 cursor-not-allowed'
              }`}
            >
              {disabled ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};