import React from 'react';
import type { NavItemII } from '../../types';
import UpgradeCard from './UpgradeCard';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  openUpgradeModal: () => void; 
  currentView: string;
  onNavigate: (viewId: string) => void;
}

const  navItems:  NavItemII[] = [
  { id: 'new', label: '新建项目', icon: 'fa-plus', view: 'new' },
  { id: 'dashboard', label: '工作台', icon: 'fa-table-columns', view: 'landing' },
  { id: 'history', label: '历史记录', icon: 'fa-clock-rotate-left', view: 'history' },
  { id: 'documents', label: '我的文档', icon: 'fa-folder-open', view: 'document' },
];

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar, openUpgradeModal,currentView, onNavigate
}) => {


  
  const handleNavClick = (view: string) => {
  onNavigate(view);
};
  return (
    <div 
      className={`
        relative flex flex-col h-screen border-r border-white/5 bg-[#0f0c29]/50 backdrop-blur-md transition-all duration-300 ease-in-out z-20
        ${isCollapsed ? 'w-20' : 'w-72'}
      `}
    >
      {/* Header */}
      <div className="flex items-center h-20 px-6 border-b border-white/5">
        {!isCollapsed && (
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 whitespace-nowrap overflow-hidden">
            <span className="text-purple-400 text-2xl"><i className="fa-solid fa-layer-group"></i></span>
            UPC <span className="font-light text-sm mt-1 ml-1 opacity-70">Ai</span>
          </div>
        )}
        {isCollapsed && (
             <div 
               className="w-full flex justify-center text-purple-400 text-2xl cursor-pointer hover:text-purple-300 transition-colors py-2"
               onClick={toggleSidebar}
               title="展开侧边栏"
             >
                 <i className="fa-solid fa-layer-group"></i>
             </div>
        )}
        
        <button 
          onClick={toggleSidebar}
          className={`
            text-gray-400 hover:text-white transition-colors
            ${isCollapsed ? 'hidden' : 'ml-auto'}
          `}
        >
          <i className="fa-solid fa-list-ul"></i>
        </button>
      </div>

      {/* Main Action Button (Create) */}
      <div className="p-4">
        <button className={`
          flex items-center justify-center gap-2 w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:opacity-90 text-white font-medium rounded-xl transition-all shadow-lg shadow-orange-500/20
          ${isCollapsed ? 'p-3 aspect-square' : 'py-3 px-4'}
        `}>
          <i className="fa-solid fa-plus"></i>
          {!isCollapsed && <span>新建项目</span>}
        </button>
      </div>

     {/* Nav Items */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.slice(1).map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.view)}
            className={`
              flex items-center gap-3 px-3 py-3 rounded-xl w-full text-left transition-all group
              ${isCollapsed ? 'justify-center' : ''}
              ${currentView === (item.id === 'dashboard' ? 'landing' : 
                                item.id === 'history' ? 'history' : 
                                item.id === 'documents' ? 'document' : '') 
                ? 'bg-white/10 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'}
            `}
          >
            <i className={`fa-solid ${item.icon} text-lg group-hover:text-purple-400 transition-colors ${
              currentView === (item.id === 'dashboard' ? 'landing' : 
                item.id === 'history' ? 'history' : 
                item.id === 'documents' ? 'document' : '')  
                ? 'text-purple-400' 
                : ''
            }`}></i>
            {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer / Upgrade Area */}
      <div className="p-4 border-t border-white/5 relative group">
        <div className={`
          flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 border border-white/5 hover:border-orange-500/50 transition-all cursor-pointer
          ${isCollapsed ? 'justify-center' : ''}
        `}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xs shrink-0">
            <i className="fa-solid fa-gem"></i>
          </div>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-bold text-white truncate">升级 Pro</div>
              <div className="text-xs text-orange-400 truncate">解锁更多功能</div>
            </div>
          )}
          {!isCollapsed && <i className="fa-solid fa-chevron-right text-xs text-gray-500"></i>}
        </div>

        {/* Upgrade Popover Card - Shows on hover of the container */}
        <UpgradeCard openUpgradeModal={openUpgradeModal} />
      </div>
    </div>
  );
};

export default Sidebar;