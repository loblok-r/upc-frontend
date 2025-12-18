import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface MobileNavBarProps {
  currentView: string;
  onNavigate: (viewId: string) => void;
  onOpenUpgrade: () => void;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({ 
  currentView, 
  onNavigate,
  onOpenUpgrade
}) => {
  const { user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: '工作台', icon: 'fa-table-columns', view: 'landing' },
    { id: 'history', label: '历史', icon: 'fa-clock-rotate-left', view: 'history' },
    { id: 'new', label: '新建', icon: 'fa-plus', view: 'new', isAction: true },
    { id: 'documents', label: '文档', icon: 'fa-folder-open', view: 'document' },
    { id: 'profile', label: '会员', icon: 'fa-crown', view: 'upgrade', isAction: false }, 
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full h-16 bg-[#0f0c29]/95 backdrop-blur-xl border-t border-white/10 z-50 pb-safe">
      <div className="flex justify-around items-center h-full px-2">
        {navItems.map((item) => {
          // 1. 特殊处理：新建按钮（中间的大按钮）
          if (item.id === 'new') {
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.view)}
                className="relative -top-5"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center shadow-lg shadow-orange-500/30 border-4 border-[#0f0c29]">
                  <i className={`fa-solid ${item.icon} text-white text-xl`}></i>
                </div>
              </button>
            );
          }

          if (item.id === 'profile') {
             return (
              <button
                key={item.id}
                onClick={onOpenUpgrade}
                className="flex flex-col items-center justify-center w-14 gap-1"
              >
                <i className={`fa-solid ${item.icon} text-lg ${user?.isMember ? 'text-purple-400' : 'text-gray-400'}`}></i>
                <span className={`text-[10px] ${user?.isMember ? 'text-purple-400' : 'text-gray-500'}`}>
                  {user?.isMember ? '会员' : '升级'}
                </span>
              </button>
             );
          }

          // 普通导航按钮
          const isActive = currentView === (item.view === 'landing' ? 'landing' : item.view);
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.view)}
              className={`flex flex-col items-center justify-center w-14 gap-1 transition-colors ${
                isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <i className={`fa-solid ${item.icon} text-lg ${isActive ? 'text-orange-400' : ''}`}></i>
              <span className={`text-[10px] ${isActive ? 'text-white' : ''}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};