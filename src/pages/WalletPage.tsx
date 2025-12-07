import React, { useState, useEffect } from 'react';
import { SIDEBAR_ITEMS } from '../data/constants';
import { WalletTabId } from '../types';
import { LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation ,useSearchParams} from 'react-router-dom';
import { WalletContent } from '../components/WalletContent';
import { MockWalletService } from '../services/mockWalletService';

export const WalletPage: React.FC = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user, logout } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();

  // 从 URL 参数获取 tab，如果没有则使用第一个 tab
  const getInitialTab = (): WalletTabId => {
    const tabParam = searchParams.get('tab');
    
    // 如果传入 'points' 参数，才显示积分页
    if (tabParam === 'points') {
      return WalletTabId.POINTS;
    }
     // 否则默认显示第一个栏目
    return SIDEBAR_ITEMS[0].id;
  };

  /// 状态管理
  const [activeTab, setActiveTab] = useState<WalletTabId>(() => getInitialTab());
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // 监听 URL 参数变化
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      // 验证 tab 参数是否有效
      const validTab = Object.values(WalletTabId).find(tab => tab === tabParam);
      if (validTab) {
        setActiveTab(validTab);
      }
    }
  }, [searchParams]);


  // 点击 tab 时更新 URL 参数
  const handleTabClick = (tabId: WalletTabId) => {
    setActiveTab(tabId);
    // 更新 URL 参数但不触发页面刷新
    setSearchParams({ tab: tabId });
  };
  // 模拟登录流程
  const handleLoginClick = async () => {
    if (isLoggedIn) {
      // 已登录，显示下拉菜单
      console.log('用户已登录，显示下拉菜单');
    } else {
      // 未登录，导航到登录页
      navigate('/login', {
        state: {
          from: location.pathname
        }
      });
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#0B0F19] overflow-hidden">

      {/* Sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0 flex flex-col gap-1 md:pt-12 pl-2 overflow-y-auto">
        <h2 className="text-xl font-bold text-white px-4 mb-4 font-sans tracking-wide">我的卡包</h2>

        <div className="flex flex-col gap-1 px-2">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg relative overflow-hidden group
                  ${isActive
                    ? 'text-cyan-400 bg-cyan-950/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                  }
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 rounded-r-full shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                )}
                <item.icon className={`w-4 h-4 ${isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Right Content Area */}
      <section className="flex-1 bg-[#111827] md:rounded-tl-3xl border-l border-t border-white/5 relative flex flex-col h-full overflow-hidden shadow-[-10px_-10px_30px_rgba(0,0,0,0.2)]">

        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}
        />

        <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {!isLoggedIn ? (
            // Unlogged State
            <div className="h-full flex flex-col items-center justify-center animate-fade-in min-h-[400px]">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 border border-white/5 rounded-2xl mb-6 flex items-center justify-center shadow-lg shadow-black/20">
                <div className="w-12 h-8 border-2 border-amber-500/50 rounded-lg relative flex justify-center">
                  <div className="w-6 h-6 bg-amber-500 rounded-full border-2 border-[#111827] -mt-3 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                  <div className="absolute bottom-2 w-8 h-1 bg-amber-500/20 rounded-full"></div>
                </div>
              </div>

              <h3 className="text-slate-200 font-medium mb-6 text-lg tracking-wide">请登录后尝试访问</h3>

              <button
                onClick={handleLoginClick}
                disabled={isLoggingIn}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold py-3 px-10 rounded-xl shadow-lg shadow-orange-900/20 transform transition-all hover:scale-105 active:scale-95 flex items-center gap-2 border border-white/10 disabled:opacity-70 disabled:cursor-wait"
              >
                立即登录
              </button>
            </div>
          ) : (
            // Logged In Content (Passing activeTab)
            <WalletContent activeTab={activeTab} />
          )}
        </div>
      </section>
    </div>
  );
};
export default WalletPage;
