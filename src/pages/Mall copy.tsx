import React, { useRef } from 'react';
import { Coins, ChevronRight, Bell, Calendar, ChevronLeft, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 
import { MallPRODUCTS, FLASH_SALES, FILTERS } from '../data/constants';

const Mall: React.FC = () => {
    const navigate = useNavigate();
    // 1. 创建 ref 用于控制滚动容器
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleLotteryClick = () => {
        navigate('/lottery'); 
    };

    const handleWalletClick = () => {
        navigate('/wallet'); 
    };

    // 2. 左右滚动处理函数
    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollAmount = 300; // 每次滚动的距离
            const currentScroll = container.scrollLeft;
            
            container.scrollTo({
                left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
                behavior: 'smooth'
            });
        }
    };

  return (
    <div className="pt-24 pb-12 min-h-screen px-4 md:px-8 max-w-7xl mx-auto relative z-10">
      
      {/* Top Status Bar (保持不变) */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center mb-8 shadow-xl">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/20 rounded-full">
                    <Coins className="text-amber-400 w-6 h-6" />
                </div>
                <div>
                    <span className="text-slate-400 text-sm">我的积分</span>
                    <div className="text-2xl font-bold text-white flex items-baseline gap-1">
                        0 
                        <span className="text-xs font-normal text-amber-400 cursor-pointer hover:underline flex items-center">
                            签到领积分 <ChevronRight size={12} />
                        </span>
                    </div>
                </div>
            </div>
            <div className="hidden md:block w-px h-8 bg-white/10 mx-4" />
            <div className="text-sm text-slate-400 bg-slate-900/50 px-3 py-1 rounded-full flex items-center gap-2 border border-white/5">
                <Bell size={14} />
                提醒我领每月18日会员专属福利
            </div>
        </div>
        <div className="flex gap-6 text-sm text-slate-300">
            <button className="hover:text-blue-400 transition-colors">积分规则</button>
            <button onClick={() => navigate('/exchange-record')} className="hover:text-blue-400 transition-colors">兑换记录</button>
            <button onClick={handleWalletClick} className="hover:text-blue-400 transition-colors">积分记录</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Redemption Section (3 cols wide) */}
        <div className="lg:col-span-3 space-y-6 overflow-hidden"> {/* overflow-hidden 防止容器撑开页面 */}
            
            {/* Header Title & Controls */}
            <div className="flex items-center gap-3">
                <ShoppingBag className="text-blue-400" />
                <h2 className="text-2xl font-bold text-white">积分兑换</h2>
                
                {/* 3. 修改后的左右切换按钮，绑定点击事件 */}
                <div className="flex items-center gap-2 ml-auto md:ml-4 z-10">
                    <button 
                        onClick={() => scroll('left')}
                        className="p-2 bg-white/5 hover:bg-white/20 border border-white/10 rounded-full transition-colors active:scale-95"
                    >
                        <ChevronLeft size={20} className="text-slate-300" />
                    </button>
                    <button 
                        onClick={() => scroll('right')}
                        className="p-2 bg-white/5 hover:bg-white/20 border border-white/10 rounded-full transition-colors active:scale-95"
                    >
                        <ChevronRight size={20} className="text-slate-300" />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 pb-2">
                {FILTERS.map((filter, index) => (
                    <button 
                        key={index}
                        className={`px-4 py-1.5 rounded-lg text-sm border transition-all ${
                            index === 0 
                                ? 'bg-blue-600/20 border-blue-500/50 text-blue-300' 
                                : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* 4. 修改为横向滚动容器 (Carousel) */}
            <div 
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // 隐藏滚动条
            >
                {MallPRODUCTS.map((product) => (
                    <div 
                        key={product.id} 
                        // 设置固定宽度 (w-64) 和 min-width，防止压缩
                        className="flex-shrink-0 w-64 snap-start group bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] flex flex-col"
                    >
                        {/* Image Area - 调整高度比例 */}
                        {/* <div className="aspect-square bg-slate-800 relative overflow-hidden p-6 flex items-center justify-center"> */}
                        <div className="h-48 bg-slate-800 relative overflow-hidden p-4 flex items-center justify-center">
                            <img src={product.image} alt={product.name} className="w-full h-full object-contain drop-shadow-xl transition-transform group-hover:scale-110 duration-500" />
                            {product.tag && (
                                <div className="absolute top-2 left-2 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-600 text-[10px] font-bold text-white rounded">
                                    {product.tag}
                                </div>
                            )}
                        </div>
                        
                        {/* Content Area */}
                        <div className="p-4 flex flex-col flex-grow bg-white/[0.02]">
                            <h3 className="text-sm font-medium text-slate-200 mb-2 line-clamp-2 h-10">{product.name}</h3>
                            <div className="mt-auto pt-2 border-t border-white/5">
                                <div className="flex flex-col mb-2">
                                    <div className="flex items-baseline gap-1 text-blue-300 font-bold text-lg">
                                        {product.points} <span className="text-xs font-normal text-slate-400">积分</span>
                                    </div>
                                    {product.cash && <span className="text-xs font-medium text-slate-400">+ {product.cash}元</span>}
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-600 line-through">¥{product.originalPoints}</span>
                                    <button className="px-3 py-1.5 bg-white/10 hover:bg-blue-600 text-xs text-white rounded-lg transition-colors border border-white/10 hover:border-blue-500">
                                        立即兑换
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lucky Draw Banner (保持不变) */}
            <div className="w-full mt-4 relative rounded-2xl overflow-hidden border border-white/10 group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-amber-600/20 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-6 flex flex-col items-center justify-center gap-3 backdrop-blur-sm bg-slate-900/30">
                     <div className="bg-amber-500 text-slate-900 text-xs font-bold px-2 py-0.5 rounded absolute top-0 right-0 rounded-bl-lg rounded-tr-lg">
                        50积分/次
                     </div>
                     <h3 className="text-xl font-bold text-amber-400">限时大抽奖</h3>
                     <p className="text-sm text-slate-400">赢取年度会员大奖</p>
                     <button 
                        onClick={handleLotteryClick}
                     className="mt-2 px-8 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-full hover:shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-shadow">
                        去抽奖
                     </button>
                </div>
            </div>
        </div>

        {/* Right Column: Flash Sale (保持不变) */}
        <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 sticky top-24">
                {/* ... Flash Sale 内容保持不变 ... */}
                 {/* Header */}
                 <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                                <Calendar size={14} />
                            </div>
                            <h3 className="font-bold text-lg text-white">积分秒杀</h3>
                        </div>
                        <p className="text-xs text-slate-400 ml-7">每日福利限时抢</p>
                    </div>
                    <button className="text-xs text-slate-500 hover:text-white flex items-center gap-1">
                         提醒我 <Bell size={10} />
                    </button>
                </div>

                {/* Date Tabs */}
                <div className="flex justify-between mb-6 text-sm border-b border-white/10 pb-2">
                    <div className="text-red-400 font-bold border-b-2 border-red-500 pb-2 -mb-2.5">12月6日</div>
                    <div className="text-slate-500">12月7日</div>
                    <div className="text-slate-500">12月8日</div>
                </div>

                {/* List */}
                <div className="space-y-6">
                    {FLASH_SALES.map((item) => (
                        <div key={item.id} className="flex gap-3 group">
                            {/* Thumb */}
                            <div className="w-20 h-20 bg-slate-800 rounded-lg flex-shrink-0 relative overflow-hidden">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                {item.status === 'ended' && (
                                    <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center text-xs text-white">已结束</div>
                                )}
                            </div>
                            
                            {/* Info */}
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <h4 className="text-sm font-medium text-slate-200 line-clamp-1">{item.name}</h4>
                                    <p className="text-[10px] text-slate-500 mt-0.5">{item.description}</p>
                                </div>
                                
                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-red-400 font-bold text-sm">{item.price}积分</span>
                                        <span className="text-[10px] text-slate-600 line-through">{item.originalPrice}积分</span>
                                    </div>
                                    <button 
                                        disabled={item.status === 'ended'}
                                        className={`px-3 py-1 text-xs rounded-full border ${
                                            item.status === 'active' 
                                                ? 'bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white' 
                                                : item.status === 'ended'
                                                ? 'border-slate-700 text-slate-600 cursor-not-allowed'
                                                : 'border-blue-500/50 text-blue-400'
                                        }`}
                                    >
                                        {item.status === 'active' ? '立即抢' : item.status === 'ended' ? '已结束' : '待开始'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Mall;