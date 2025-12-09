import React, { useState, useEffect } from 'react';
import { ChevronRight, FileText, Truck, PackageOpen, LogIn, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ExchangeRecordPage: React.FC = () => {
  const navigate = useNavigate(); 
  const { isLoggedIn, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // 登录按钮点击处理
  const handleLoginClick = async () => {
    if (isLoggedIn) return;
    
    setIsLoading(true);
    try {
      navigate('/login', {
        state: { 
          from: '/exchange-record',
          message: '查看兑换记录需要登录'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 如果已登录，显示正常内容
  if (isLoggedIn) {
    return (
      <div className="min-h-screen w-full bg-[#0B0F19] text-slate-200 p-4 md:p-8 font-sans flex flex-col">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-2">
          
          <div className="flex items-center gap-2 text-sm">
            <span 
              onClick={() => navigate('/mall')}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              积分商城
            </span>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <span className="text-white font-medium">兑换记录</span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                // 开发票逻辑
                console.log("开发票");
              }}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 hover:text-orange-300 hover:border-orange-500/40 transition-all text-sm font-medium group"
            >
              <FileText className="w-4 h-4" />
              <span>前往开发票</span>
            </button>
            
            <button 
              onClick={() => {
                // 查看物流逻辑
                console.log("查看物流");
              }}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 hover:text-orange-300 hover:border-orange-500/40 transition-all text-sm font-medium group"
            >
              <Truck className="w-4 h-4" />
              <span>查看物流</span>
            </button>
          </div>
        </header>

        
        <main className="flex-1 bg-[#111827] rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden flex flex-col">
          
          {/* 背景网格 */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ 
              backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', 
              backgroundSize: '40px 40px' 
            }} 
          />

          {/* 主要内容 */}
          <div className="flex-1 flex flex-col items-center justify-center p-12 z-10 animate-fade-in">
            
            {/* 图标 */}
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-inner">
              <PackageOpen className="w-10 h-10 text-slate-600" strokeWidth={1.5} />
            </div>
            
            {/* 标题和描述 */}
            <h3 className="text-slate-400 text-lg font-medium tracking-wide">暂无兑换记录</h3>
            <p className="text-slate-600 text-sm mt-2">您还没有使用积分兑换过任何商品</p>
            
            {/* 操作按钮 */}
            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => navigate('/mall')}
                className="px-8 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-cyan-900/20 transition-all hover:scale-105"
              >
                去商城逛逛
              </button>
              
              {/* 显示用户积分信息（可选） */}
              {user && (
                <div className="px-6 py-2.5 bg-gradient-to-r from-emerald-900/30 to-green-900/30 border border-emerald-500/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <span className="text-yellow-400 text-xs">💰</span>
                    </div>
                    <span className="text-sm text-emerald-300">
                      可用积分: <span className="font-bold">{user.points || 0}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </main>
      </div>
    );
  }

  // 未登录状态 - 仿照 WalletPage 的设计
  return (
    <div className="min-h-screen w-full bg-[#0B0F19] overflow-hidden flex flex-col">
      
      {/* 顶部导航栏（与登录状态一致） */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 p-4 md:p-8 px-2">
        
        <div className="flex items-center gap-2 text-sm">
          <span 
            onClick={() => navigate('/mall')}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            积分商城
          </span>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <span className="text-white font-medium">兑换记录</span>
        </div>

        <div className="flex items-center gap-3">
          {/* 登录按钮 */}
          <button
            onClick={handleLoginClick}
            disabled={isLoading}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-orange-900/20 transform transition-all hover:scale-105 active:scale-95 flex items-center gap-2 border border-white/10 disabled:opacity-70 disabled:cursor-wait"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>跳转中...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>立即登录</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* 主要内容区域 - 仿照 WalletPage 的未登录状态设计 */}
      <main className="flex-1 bg-[#111827] md:rounded-t-3xl border-t border-white/5 relative flex flex-col h-full overflow-hidden">
        
        {/* 背景网格 */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none" 
          style={{ 
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', 
            backgroundSize: '30px 30px' 
          }} 
        />

        <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {/* 未登录状态内容 */}
          <div className="h-full flex flex-col items-center justify-center animate-fade-in min-h-[400px]">
            
            {/* 卡包图标（仿照 WalletPage 设计） */}
            <div className="w-32 h-32 bg-gradient-to-br from-gray-800 to-gray-900 border border-white/5 rounded-2xl mb-8 flex items-center justify-center shadow-lg shadow-black/20">
              <div className="w-16 h-10 border-2 border-amber-500/50 rounded-lg relative flex justify-center">
                <div className="w-8 h-8 bg-amber-500 rounded-full border-2 border-[#111827] -mt-4 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                <div className="absolute bottom-3 w-10 h-1 bg-amber-500/20 rounded-full"></div>
              </div>
            </div>

            <h3 className="text-slate-200 font-medium mb-4 text-xl tracking-wide">兑换记录</h3>
            <p className="text-slate-400 mb-8 text-center max-w-md">
              查看您的商品兑换记录、发货状态和物流信息
              <br />
              <span className="text-slate-500 text-sm">登录后即可查看所有记录</span>
            </p>

            {/* 登录按钮 */}
            <button
              onClick={handleLoginClick}
              disabled={isLoading}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold py-3 px-12 rounded-xl shadow-lg shadow-orange-900/20 transform transition-all hover:scale-105 active:scale-95 flex items-center gap-2 border border-white/10 disabled:opacity-70 disabled:cursor-wait"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>跳转中...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>立即登录查看</span>
                </>
              )}
            </button>

            {/* 额外信息 */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
              <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/20 rounded-xl p-4">
                <div className="text-blue-400 text-sm font-medium mb-1">商品兑换</div>
                <div className="text-slate-400 text-xs">查看已兑换的商品信息</div>
              </div>
              
              <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/20 rounded-xl p-4">
                <div className="text-green-400 text-sm font-medium mb-1">发货状态</div>
                <div className="text-slate-400 text-xs">跟踪商品的发货进度</div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-xl p-4">
                <div className="text-purple-400 text-sm font-medium mb-1">物流信息</div>
                <div className="text-slate-400 text-xs">查看实时的物流轨迹</div>
              </div>
            </div>

            {/* 返回商城链接 */}
            <div className="mt-12 pt-6 border-t border-white/5 w-full max-w-md text-center">
              <button
                onClick={() => navigate('/mall')}
                className="text-slate-500 hover:text-slate-300 text-sm transition-colors flex items-center justify-center gap-1 mx-auto"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                <span>返回积分商城</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExchangeRecordPage;