// src/components/Logo.tsx
import React from 'react';

// 1. 定义 Props 类型，确保 TypeScript 不报错
interface LogoProps {
  isDark?: boolean; // 可选属性，默认为 false
}

export const Logo: React.FC<LogoProps> = ({ isDark = false }) => {
  return (
    <div className="flex items-center gap-3 group cursor-pointer">
      <div className="relative w-10 h-10 overflow-hidden rounded-lg bg-gradient-to-br from-indigo-600 to-purple-800 shadow-lg shadow-purple-500/20 transition-transform duration-300 group-hover:scale-105">
        {/* 使用本地Logo图片 */}
        <img 
          src="/images/logo.png" 
          alt="UPC Logo" 
          className="w-full h-full object-cover"
        />
        
        {/* Shine effect */}
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
      
      <div className="flex flex-col">
        {/* 
            2. 主标题颜色逻辑：
            - 如果 isDark 为 true (白色背景)：文字用深灰 (text-gray-900)，悬停变蓝
            - 如果 isDark 为 false (深色背景)：文字用白 (text-white)，悬停变浅蓝
        */}
        <span className={`font-bold text-lg leading-tight tracking-tight transition-colors ${
          isDark 
            ? 'text-gray-900 group-hover:text-blue-600' 
            : 'text-white group-hover:text-blue-200'
        }`}>
          Universal Picture Composer
        </span>

        {/* 
            3. 副标题颜色逻辑：
            - 白色背景时：用深一点的蓝 (text-blue-600) 增加对比度
            - 深色背景时：保持原来的浅蓝 (text-blue-400)
        */}
        <span className={`text-[10px] font-medium tracking-widest uppercase opacity-80 transition-colors ${
          isDark 
            ? 'text-blue-600' 
            : 'text-blue-400'
        }`}>
          AI-Powered Image Generation
        </span>
      </div>
    </div>
  );
};