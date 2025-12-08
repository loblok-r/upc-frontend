import React, { useState, useEffect, useRef } from 'react';
import { Coins, ChevronRight, Bell, Calendar, ChevronLeft, ShoppingBag, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 
import { MallPRODUCTS, FLASH_SALES, FILTERS } from '../data/constants';
import { useAuth } from '../contexts/AuthContext';



// --- Type Definitions (如果 constants 里没导出的补充定义) ---
interface FlashSaleItem {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice: number;
    image: string;
    status: 'active' | 'ended' | 'upcoming';
}

// --- 1. 模拟数据扩展 (未来两天的数据) ---
const FLASH_SALE_DATABASE: Record<string, FlashSaleItem[]> = {
    '12月6日': FLASH_SALES, // 使用原有的数据
    '12月7日': [
        {
            id: 'fs-04',
            name: 'Flux 模型专用 LoRA 训练卡',
            description: '每日每场限量50份',
            price: 1500,
            originalPrice: 3000,
            image: 'https://picsum.photos/seed/lora/200/200',
            status: 'upcoming' // 明天的状态通常是 upcoming
        },
        {
            id: 'fs-05',
            name: 'UPC 联名机械键盘键帽',
            description: '每日每场限量10份',
            price: 5000,
            originalPrice: 8800,
            image: 'https://picsum.photos/seed/keycap/200/200',
            status: 'upcoming'
        }
    ],
    '12月8日': [
        {
            id: 'fs-06',
            name: '4K 高清修复次数包 (100次)',
            description: '每日每场限量200份',
            price: 999,
            originalPrice: 2000,
            image: 'https://picsum.photos/seed/4k/200/200',
            status: 'upcoming'
        }
    ]
};

// --- 2. Mock Service (模拟后台接口) ---
const MockMallService = {
    /**
     * 模拟兑换普通商品接口
     */
    exchangeProduct: (productId: string): Promise<{ success: boolean; msg: string }> => {
        return new Promise((resolve) => {
            console.log(`[API] Requesting exchange for product: ${productId}`);
            setTimeout(() => {
                // 模拟 80% 成功率
                const isSuccess = Math.random() > 0.2;
                resolve({
                    success: isSuccess,
                    msg: isSuccess ? '兑换成功！请在“我的卡包”中查看' : '积分不足或库存不足'
                });
            }, 1000); // 1秒延迟
        });
    },

    /**
     * 模拟秒杀抢购接口
     */
    grabFlashItem: (itemId: string): Promise<{ success: boolean; msg: string }> => {
        return new Promise((resolve) => {
            console.log(`[API] Attempting to grab item: ${itemId}`);
            setTimeout(() => {
                const isSuccess = Math.random() > 0.5; // 秒杀更难抢，50% 概率
                resolve({
                    success: isSuccess,
                    msg: isSuccess ? '抢购成功！手速惊人！' : '哎呀，手慢了，已售罄'
                });
            }, 800);
        });
    },

    /**
     * 获取指定日期的秒杀列表
     */
    getFlashSalesByDate: (date: string): Promise<FlashSaleItem[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(FLASH_SALE_DATABASE[date] || []);
            }, 300); // 切换日期稍微快一点
        });
    }
};

const Mall: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // --- State Management ---
    // 1. 记录正在加载的按钮 ID (用于显示 Loading 动画)
    const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
    
    // 2. 秒杀日期控制
    const [activeDate, setActiveDate] = useState('12月6日');
    const [currentFlashList, setCurrentFlashList] = useState<FlashSaleItem[]>(FLASH_SALES);
    const [isSwitchingDate, setIsSwitchingDate] = useState(false);

    // --- Actions ---

    // 切换日期逻辑
    const handleDateChange = async (date: string) => {
        if (date === activeDate) return;
        setActiveDate(date);
        setIsSwitchingDate(true); // 列表显示简单的加载态
        try {
            const data = await MockMallService.getFlashSalesByDate(date);
            setCurrentFlashList(data);
        } finally {
            setIsSwitchingDate(false);
        }
    };

    // 普通商品兑换逻辑
    const handleExchangeClick = async (productId: string, productName: string) => {
        if (loadingIds[productId]) return;

        // 设置该按钮为 Loading
        setLoadingIds(prev => ({ ...prev, [productId]: true }));

        try {
            const res = await MockMallService.exchangeProduct(productId);
            alert(`${productName}: ${res.msg}`); // 实际项目中建议使用 Toast 组件
        } catch (error) {
            alert('网络异常，请重试');
        } finally {
            // 移除 Loading
            setLoadingIds(prev => ({ ...prev, [productId]: false }));
        }
    };

    // 秒杀抢购逻辑
    const handleGrabClick = async (itemId: string, itemName: string) => {
        if (loadingIds[itemId]) return;

        setLoadingIds(prev => ({ ...prev, [itemId]: true }));

        try {
            const res = await MockMallService.grabFlashItem(itemId);
            alert(`${itemName}: ${res.msg}`);
        } catch (error) {
            alert('抢购失败，请重试');
        } finally {
            setLoadingIds(prev => ({ ...prev, [itemId]: false }));
        }
    };

    const handleLotteryClick = () => navigate('/lottery');
    const handleWalletClick = () =>  navigate('/wallet?tab=points');
    
    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollAmount = 300;
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
                        {user?.points || 0}
                        <span 
                        onClick={() => navigate('/daily-check-in')}
                        className="text-xs font-normal text-amber-400 cursor-pointer hover:underline flex items-center">
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
        
        {/* Left Column: Redemption Section */}
        <div className="lg:col-span-3 space-y-6 overflow-hidden">
            
            {/* Header Title & Controls */}
            <div className="flex items-center gap-3">
                <ShoppingBag className="text-blue-400" />
                <h2 className="text-2xl font-bold text-white">积分兑换</h2>
                <div className="flex items-center gap-2 ml-auto md:ml-4 z-10">
                    <button onClick={() => scroll('left')} className="p-2 bg-white/5 hover:bg-white/20 border border-white/10 rounded-full transition-colors active:scale-95">
                        <ChevronLeft size={20} className="text-slate-300" />
                    </button>
                    <button onClick={() => scroll('right')} className="p-2 bg-white/5 hover:bg-white/20 border border-white/10 rounded-full transition-colors active:scale-95">
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

            {/* Carousel */}
            <div 
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {MallPRODUCTS.map((product) => (
                    <div 
                        key={product.id} 
                        className="flex-shrink-0 w-64 snap-start group bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] flex flex-col"
                    >
                        {/* Image Area */}
                        <div className="aspect-square bg-slate-800 relative overflow-hidden p-6 flex items-center justify-center">
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
                                    
                                    {/* 🔴 修改点 1: 绑定点击事件，处理 Loading 状态 */}
                                    <button 
                                        onClick={() => handleExchangeClick(product.id, product.name)}
                                        disabled={loadingIds[product.id]}
                                        className="px-3 py-1.5 bg-white/10 hover:bg-blue-600 text-xs text-white rounded-lg transition-colors border border-white/10 hover:border-blue-500 disabled:opacity-50 disabled:cursor-wait min-w-[72px] flex justify-center"
                                    >
                                        {loadingIds[product.id] ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            '立即兑换'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Banner (保持不变) */}
            <div className="w-full mt-4 relative rounded-2xl overflow-hidden border border-white/10 group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-amber-600/20 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-6 flex flex-col items-center justify-center gap-3 backdrop-blur-sm bg-slate-900/30">
                     <div className="bg-amber-500 text-slate-900 text-xs font-bold px-2 py-0.5 rounded absolute top-0 right-0 rounded-bl-lg rounded-tr-lg">
                        50积分/次
                     </div>
                     <h3 className="text-xl font-bold text-amber-400">限时大抽奖</h3>
                     <p className="text-sm text-slate-400">赢取年度会员大奖</p>
                     <button onClick={handleLotteryClick} className="mt-2 px-8 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-full hover:shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-shadow">
                        去抽奖
                     </button>
                </div>
            </div>
        </div>

        {/* Right Column: Flash Sale */}
        <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 sticky top-24 min-h-[500px]">
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

                {/* 🔴 修改点 2: 动态日期 Tabs */}
                <div className="flex justify-between mb-6 text-sm border-b border-white/10 pb-2">
                    {['12月6日', '12月7日', '12月8日'].map(date => (
                        <div 
                            key={date}
                            onClick={() => handleDateChange(date)}
                            className={`cursor-pointer transition-colors pb-2 -mb-2.5 border-b-2 ${
                                activeDate === date 
                                    ? 'text-red-400 font-bold border-red-500' 
                                    : 'text-slate-500 border-transparent hover:text-slate-300'
                            }`}
                        >
                            {date}
                        </div>
                    ))}
                </div>

                {/* List Content */}
                {isSwitchingDate ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
                        <Loader2 className="animate-spin" size={24} />
                        <span className="text-xs">加载中...</span>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        {currentFlashList.length > 0 ? currentFlashList.map((item) => (
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
                                        
                                        {/* 🔴 修改点 3: 绑定秒杀点击事件，处理 Loading 和状态 */}
                                        <button 
                                            onClick={() => handleGrabClick(item.id, item.name)}
                                            disabled={item.status === 'ended' || item.status === 'upcoming' || loadingIds[item.id]}
                                            className={`px-3 py-1 text-xs rounded-full border min-w-[60px] flex justify-center ${
                                                item.status === 'active' 
                                                    ? 'bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white transition-all' 
                                                    : item.status === 'ended'
                                                    ? 'border-slate-700 text-slate-600 cursor-not-allowed bg-transparent'
                                                    : 'border-blue-500/50 text-blue-400 cursor-not-allowed bg-blue-500/5'
                                            }`}
                                        >
                                            {loadingIds[item.id] ? (
                                                <Loader2 size={12} className="animate-spin" />
                                            ) : (
                                                item.status === 'active' ? '立即抢' : item.status === 'ended' ? '已结束' : '待开始'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-slate-500 text-xs">暂无活动</div>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Mall;