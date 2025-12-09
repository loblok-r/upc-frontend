import React from 'react';
import type { NavItemII } from '../../types';
import UpgradeCard from './UpgradeCard';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  openUpgradeModal: () => void;
  currentView: string;
  onNavigate: (viewId: string) => void;
}

const navItems: NavItemII[] = [
  { id: 'new', label: '新建项目', icon: 'fa-plus', view: 'new' },
  { id: 'dashboard', label: '工作台', icon: 'fa-table-columns', view: 'landing' },
  { id: 'history', label: '历史记录', icon: 'fa-clock-rotate-left', view: 'history' },
  { id: 'documents', label: '我的文档', icon: 'fa-folder-open', view: 'document' },
];

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar, openUpgradeModal, currentView, onNavigate
}) => {
  const { isLoggedIn, user } = useAuth();
  console.log('sidebar user>>>>>>', user);
  const navigate = useNavigate();


  const handleNavClick = (view: string) => {
    onNavigate(view);
  };

  // 判断当前用户状态
  const isMember = user?.isMember || false;
  const memberStatus = user?.memberStatus || 'none';
  const memberDaysLeft = user?.memberDaysLeft;

  // 计算显示文本和样式
  const getUpgradeButtonInfo = () => {
    // 未登录用户
    if (!isLoggedIn) {
      return {
        title: '登录/升级',
        subtitle: '解锁会员功能',
        iconBg: 'from-orange-400 to-red-500',
        icon: 'fa-solid fa-user-plus',
        showCard: false, // 未登录不显示升级卡片
        showDaysLeft: false,
        badge: null,
      };
    }
    // 已登录的会员用户
    if (isMember) {
      let badge = null;
      let subtitle = 'Pro 会员';

      if (memberStatus === 'permanent') {
        badge = {
          text: '永久',
          bgColor: 'bg-gradient-to-r from-emerald-500 to-green-500',
        };
      } else if (memberStatus === 'active' && memberDaysLeft !== undefined) {
        if (memberDaysLeft <= 7) {
          badge = {
            text: `${memberDaysLeft}天`,
            bgColor: 'bg-gradient-to-r from-orange-500 to-red-500',
          };
          subtitle = `剩余${memberDaysLeft}天`;
        } else {
          badge = {
            text: 'Pro',
            bgColor: 'bg-gradient-to-r from-purple-500 to-indigo-500',
          };
        }
      }

      return {
        title: '会员中心',
        subtitle,
        iconBg: 'from-purple-500 to-indigo-500',
        icon: 'fa-solid fa-crown',
        showCard: true, // 会员也显示卡片，展示会员权益
        showDaysLeft: memberDaysLeft !== undefined,
        badge,
      };
    }

    // 已登录的非会员用户
    return {
      title: '升级 Pro',
      subtitle: '解锁更多功能',
      iconBg: 'from-orange-400 to-red-500',
      icon: 'fa-solid fa-gem',
      showCard: true,
      showDaysLeft: false,
      badge: null,
    };
  };

  const upgradeButtonInfo = getUpgradeButtonInfo();

   // 处理按钮点击
  const handleUpgradeClick = () => {
    if (!isLoggedIn) {
      console.log('未登录，跳转到登录页面');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    
    if (isMember) {
      // 会员用户点击，可以跳转到会员中心或什么都不做
      console.log('已经是会员，跳转到会员中心');
      // onNavigate('member-center'); // 如果添加了会员中心页面
      return;
    }
    
    // 非会员用户点击，打开升级弹窗
    openUpgradeModal();
    };


    return (
      <div
        className={`
        relative flex flex-col h-screen border-r border-white/5 bg-[#0f0c29]/50 backdrop-blur-
        md transition-all duration-300 ease-in-out z-20
        ${isCollapsed ? 'w-20' : 'w-72'}
      `}>
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
              <i className={`fa-solid ${item.icon} text-lg group-hover:text-purple-400 transition-colors ${currentView === (item.id === 'dashboard' ? 'landing' :
                item.id === 'history' ? 'history' :
                  item.id === 'documents' ? 'document' : '')
                ? 'text-purple-400'
                : ''
                }`}></i>
              {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer / Upgrade Area - 修改后 */}
        <div className="p-4 border-t border-white/5 relative group">
        <button 
          onClick={handleUpgradeClick}
          className={`
            flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-all cursor-pointer border
            ${isCollapsed ? 'justify-center' : ''}
            ${!isLoggedIn 
              ? 'bg-white/5 border-white/5 hover:border-blue-500/50 hover:bg-blue-500/10' 
              : isMember
                ? 'bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border-purple-500/30 hover:border-purple-400/50 hover:bg-purple-900/30'
                : 'bg-gradient-to-r from-orange-900/20 to-red-900/20 border-orange-500/30 hover:border-orange-400/50 hover:bg-orange-900/30'
            }
          `}
        >
          {/* 图标 */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs shrink-0 ${upgradeButtonInfo.iconBg}`}>
            <i className={upgradeButtonInfo.icon}></i>
          </div>
          
          {/* 文字内容（展开时显示） */}
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-2">
                <div className="text-sm font-bold text-white truncate">
                  {upgradeButtonInfo.title}
                </div>
                {upgradeButtonInfo.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full text-white ${upgradeButtonInfo.badge.bgColor}`}>
                    {upgradeButtonInfo.badge.text}
                  </span>
                )}
              </div>
              <div className="text-xs truncate mt-0.5">
                {!isLoggedIn ? (
                  <span className="text-blue-400">登录解锁功能</span>
                ) : isMember ? (
                  <span className="text-purple-300">{upgradeButtonInfo.subtitle}</span>
                ) : (
                  <span className="text-orange-400">{upgradeButtonInfo.subtitle}</span>
                )}
              </div>
            </div>
          )}
          
          {/* 箭头（展开时显示） */}
          {!isCollapsed && (
            <i className={`fa-solid fa-chevron-right text-xs ${
              !isLoggedIn ? 'text-blue-500' : 
              isMember ? 'text-purple-500' : 'text-orange-500'
            }`}></i>
          )}
        </button>
        
        {/* 算力显示（可选添加） */}
        {/* {isLoggedIn && !isCollapsed && (
          <div className="mt-3 text-center">
            <div className="flex items-center justify-between text-xs px-1">
              <div className="flex items-center gap-1 text-slate-400">
                <i className="fa-solid fa-bolt text-yellow-400"></i>
                <span>算力</span>
              </div>
              <span className="text-white font-medium">
                {user?.computingPower || 0} 点
              </span>
            </div>
          </div>
        )} */}

        {/* Upgrade Popover Card - 条件显示 */}
        {upgradeButtonInfo.showCard && (
          <UpgradeCard 
            openUpgradeModal={openUpgradeModal}
            userStatus={isMember ? 'member' : 'free'} // 新增参数
            memberDaysLeft={memberDaysLeft}
          />
        )}
      </div>
    </div>
  );
};

export default Sidebar;