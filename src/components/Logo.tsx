// src/components/Logo.tsx
import React from 'react';

export const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-3 group cursor-pointer">
      <div className="relative w-10 h-10 overflow-hidden rounded-lg bg-gradient-to-br from-indigo-600 to-purple-800 shadow-lg shadow-purple-500/20 transition-transform duration-300 group-hover:scale-105">
        {/* 使用本地Logo图片 */}
        <img 
          src="/images/logo.png"  // 假设你的Logo在 public/images/logo.png
          alt="UPC Logo" 
          className="w-full h-full object-cover"
        />
        
        {/* 或者用纯CSS实现 */}
        {/* <div className="w-full h-full flex items-center justify-center font-black text-xs text-white tracking-tighter bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
          UPC
        </div> */}
        
        {/* Shine effect */}
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
      
      <div className="flex flex-col">
        <span className="font-bold text-lg leading-tight tracking-tight text-white group-hover:text-blue-200 transition-colors">
          Universal Picture Composer
        </span>
        <span className="text-[10px] text-blue-400 font-medium tracking-widest uppercase opacity-80">
          {/* 移除 "Powered by Gemini 2.5" */}
          AI-Powered Image Generation
        </span>
      </div>
    </div>
  );
};