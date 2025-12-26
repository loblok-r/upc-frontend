import React, { useState, useEffect, useRef } from 'react';
import { Coins, ChevronRight, Bell, Calendar, ChevronLeft, ShoppingBag, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FILTERS } from '../data/constants';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import type { Product, FlashSaleItem, ProductsResponse,
    ExchangeRequest, ExchangeResponse, GrabFlashRequest, GrabFlashResponse,
     UserPointsResponse } from '../types/mall';



// 日期格式化工具函数
const formatDate = (date: Date): string => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
};

const getCategoryLabel = (category: string): string => {
    switch (category) {
        case 'physical': return '实物商品';
        case 'virtual': return '虚拟权益';
        case 'voucher': return '道具';
        default: return '未知类型';
    }
};

const Mall: React.FC = () => {
    const { user, isLoggedIn, refreshUser } = useAuth();
    const navigate = useNavigate();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    // 秒杀相关状态
    const [activeDate, setActiveDate] = useState<string>(formatDate(new Date()));
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [currentFlashList, setCurrentFlashList] = useState<FlashSaleItem[]>([]);
    const [isSwitchingDate, setIsSwitchingDate] = useState(false);

    // 用户积分状态
    const [userPoints, setUserPoints] = useState<UserPointsResponse | null>(null);
    const [loadingPoints, setLoadingPoints] = useState(false);

    // 登录检查函数
    const requireLogin = (actionName: string = "此操作"): boolean => {
        if (!isLoggedIn) {
            if (window.confirm(`${actionName}需要登录，是否立即登录？`)) {
                navigate('/login', {
                    state: { from: '/mall' }
                });
            }
            return false;
        }
        return true;
    };

  
    // 加载商品列表
    const loadProducts = async () => {
        setLoadingProducts(true);
        try {
            const response = await api.get<ProductsResponse>('/mall/products', {
                params: {
                    page: 1,
                    limit: 20,
                    sort: 'newest'
                }
            }) as unknown as any;

            let productsList = [];
            if (response.list) productsList = response.list;
            else if (response.products) productsList = response.products;
            else if (Array.isArray(response)) productsList = response;
            else if (response.data?.list) productsList = response.data.list;
            else if (response.data?.products) productsList = response.data.products;
            else if (response.data && Array.isArray(response.data)) productsList = response.data;
            
            setProducts(productsList || []);
        } catch (error) {
            console.error('加载商品失败:', error);
            setProducts([]);
        } finally {
            setLoadingProducts(false);
        }
    };

    // 检查秒杀商品状态
    const checkFlashSaleStatus = (item: FlashSaleItem): 'upcoming' | 'active' | 'ended' => {
        const now = new Date();
        const startTime = new Date(item.startTime);
        const endTime = new Date(item.endTime);

        if (now < startTime) return 'upcoming';
        else if (now >= startTime && now <= endTime) return 'active';
        else return 'ended';
    };

    // 加载秒杀活动
    const loadFlashSales = async (date?: string) => {
        setIsSwitchingDate(true);
        try {
            const params: any = {};
            if (date && date.trim()) {
                const match = date.match(/(\d{1,2})月(\d{1,2})日/);
                if (match && match.length >= 3) {
                    const year = new Date().getFullYear();
                    params.date = `${year}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`;
                }
            }

            const response: any = await api.get('/mall/flash/list', { params });
            let flashSalesData: FlashSaleItem[] = [];

            if (response && Array.isArray(response.list)) flashSalesData = response.list;
            else if (response.data && Array.isArray(response.data.list)) flashSalesData = response.data.list;
            else if (Array.isArray(response.data)) flashSalesData = response.data;

            const processedList = flashSalesData.map((item: any) => ({
                ...item,
                status: checkFlashSaleStatus(item)
            }));
            
            setCurrentFlashList(processedList);

            // 初始化日期
            if (availableDates.length === 0) {
                const dates = [];
                for (let i = 0; i < 3; i++) {
                    const d = new Date();
                    d.setDate(d.getDate() + i);
                    dates.push(formatDate(d));
                }
                setAvailableDates(dates);
            }

        } catch (error) {
            console.error('加载秒杀活动失败:', error);
            setCurrentFlashList([]);
        } finally {
            setIsSwitchingDate(false);
        }
    };

    // 加载用户积分
    const loadUserPoints = async () => {
        if (!isLoggedIn) {
            setUserPoints(null);
            return;
        }

        setLoadingPoints(true);
        try {
            const response: any = await api.get<UserPointsResponse>('/points');
            setUserPoints(response as unknown as UserPointsResponse);
            if (user) refreshUser();
        } catch (error) {
            console.error('加载用户积分失败:', error);
        } finally {
            setLoadingPoints(false);
        }
    };

    const getFlashButtonState = (item: FlashSaleItem) => {
        const status = checkFlashSaleStatus(item);

        if (!isLoggedIn) {
            return {
                text: '需登录',
                disabled: true,
                className: 'bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed'
            };
        }

        if (loadingIds[item.id]) {
            return {
                text: '抢购中',
                disabled: true,
                className: 'bg-slate-800/50 border-slate-700 text-slate-500 cursor-wait'
            };
        }

        switch (status) {
            case 'upcoming':
                return {
                    text: '待开始',
                    disabled: true,
                    className: 'border-blue-500/50 text-blue-400 cursor-not-allowed bg-blue-500/5'
                };
            case 'active':
                if (item.remainingStock <= 0) {
                    return {
                        text: '已抢光',
                        disabled: true,
                        className: 'bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed'
                    };
                }
                return {
                    text: '立即抢',
                    disabled: false,
                    className: 'bg-gradient-to-r from-red-500 to-orange-500 border-red-500 text-white hover:from-red-600 hover:to-orange-600'
                };
            case 'ended':
                return {
                    text: '已结束',
                    disabled: true,
                    className: 'border-slate-700 text-slate-600 cursor-not-allowed bg-slate-900/30'
                };
            default:
                return {
                    text: '未知',
                    disabled: true,
                    className: 'bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed'
                };
        }
    };

    // 抢购逻辑
    const onGrabClick = async (item: FlashSaleItem) => {
        if (!requireLogin('参与秒杀')) return;
        const currentStatus = checkFlashSaleStatus(item);
        if (currentStatus !== 'active') {
            alert(`活动${currentStatus === 'upcoming' ? '尚未开始' : '已结束'}`);
            return;
        }
        if (item.remainingStock <= 0) {
            alert('商品已抢光');
            return;
        }
        if (userPoints && userPoints.balance < item.salePrice) {
            alert(`积分不足，需要${item.salePrice}积分，当前只有${userPoints.balance}积分`);
            return;
        }
        if (!confirm(`确定要抢购【${item.productName}】吗？\n需要消耗 ${item.salePrice} 积分`)) return;

        setLoadingIds(prev => ({ ...prev, [item.id]: true }));
        try {
            const response = await api.post<GrabFlashResponse>('/mall/flash/grab', { flashSaleId: item.id });
            const result = response as unknown as GrabFlashResponse;
            if (result.success) {
                alert(`🎉 恭喜！抢购成功！\n${item.productName}: ${result.message}`);
                await Promise.all([loadFlashSales(activeDate), loadUserPoints(), refreshUser()]);
            } else {
                alert(result.message);
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || '抢购失败';
            alert(msg);
        } finally {
            setLoadingIds(prev => ({ ...prev, [item.id]: false }));
        }
    };

    // --- 初始化加载 ---
    useEffect(() => {
        // 即使是私有接口，loadProducts内部的 try-catch 会处理401，并把 loading 置为 false
        loadProducts();
        loadFlashSales(activeDate);

        if (isLoggedIn) {
            loadUserPoints();
        }
    }, [isLoggedIn, activeDate]);

    // 定时刷新秒杀状态
    useEffect(() => {
        if (currentFlashList.length === 0) return;
        const interval = setInterval(() => {
            const updatedList = currentFlashList.map(item => ({
                ...item,
                status: checkFlashSaleStatus(item)
            }));
            if (JSON.stringify(updatedList) !== JSON.stringify(currentFlashList)) {
                setCurrentFlashList(updatedList);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [currentFlashList]);

    const handleDateChange = (date: string) => {
        if (date === activeDate) return;
        setActiveDate(date);
    };

    const handleExchangeClick = async (product: Product) => {
        if (!requireLogin('兑换商品')) return;
        if (loadingIds[product.id]) return;
        if (userPoints && userPoints.balance < product.pointsRequired) {
            alert(`积分不足，需要${product.pointsRequired}积分`);
            return;
        }
        if (product.stock <= 0) {
            alert('商品库存不足');
            return;
        }
        if (!confirm(`确定要兑换【${product.name}】吗？`)) return;

        setLoadingIds(prev => ({ ...prev, [product.id]: true }));
        try {
            const response = await api.post<ExchangeResponse>('/mall/exchange', { productId: product.id, quantity: 1 });
            const data = response as unknown as ExchangeResponse;
            alert(`${product.name}: ${data.message || '兑换成功！'}`);
            await Promise.all([loadProducts(), loadUserPoints(), refreshUser()]);
        } catch (error: any) {
            const msg = error.response?.data?.message || '兑换失败';
            alert(msg);
        } finally {
            setLoadingIds(prev => ({ ...prev, [product.id]: false }));
        }
    };

    const renderFlashSaleItem = (item: FlashSaleItem) => {
        const progress = item.totalStock > 0 ? Math.round((1 - item.remainingStock / item.totalStock) * 100) : 0;
        const buttonState = getFlashButtonState(item);
        const isGrabDisabled = buttonState.disabled || loadingIds[item.id];
        const currentStatus = checkFlashSaleStatus(item);

        return (
            <div key={item.id} className="flex gap-3 group p-3 hover:bg-slate-800/20 rounded-lg transition-colors">
                <div className="w-20 h-20 bg-slate-800 rounded-lg flex-shrink-0 relative overflow-hidden">
                    <img src={item.image} alt={item.productName} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" onError={(e) => e.currentTarget.src = `https://picsum.photos/200/200?random=${item.id}`} />
                    {currentStatus !== 'active' && <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center text-xs text-white">{currentStatus === 'ended' ? '已结束' : '即将开始'}</div>}
                    {currentStatus === 'active' && item.remainingStock <= 0 && <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center text-xs text-white">已抢光</div>}
                </div>
                <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                        <h4 className="text-sm font-medium text-slate-200 line-clamp-1">{item.productName}</h4>
                        {currentStatus === 'active' && item.remainingStock > 0 && (
                            <div className="mt-2">
                                <div className="flex justify-between text-[10px] text-slate-400 mb-1"><span>已抢 {item.totalStock - item.remainingStock}/{item.totalStock}</span><span>{progress}%</span></div>
                                <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden"><div className="bg-gradient-to-r from-red-500 to-orange-500 h-1.5 rounded-full" style={{ width: `${progress}%` }} /></div>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between items-end mt-2">
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-baseline gap-1"><span className="text-red-400 font-bold text-sm truncate">{item.salePrice}积分</span><span className="text-[10px] text-slate-600 line-through flex-shrink-0">{item.originalPrice}积分</span></div>
                        </div>
                        <button onClick={() => onGrabClick(item)} disabled={isGrabDisabled} className={`px-3 py-1 text-xs rounded-full border min-w-[60px] flex justify-center items-center transition-all duration-200 font-medium ${buttonState.className} ${loadingIds[item.id] ? 'opacity-75 cursor-wait' : ''} ${!isGrabDisabled ? 'hover:scale-105 active:scale-95 shadow-lg' : ''}`}>
                            {loadingIds[item.id] ? <Loader2 size={12} className="animate-spin mr-1" /> : buttonState.text}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollAmount = 300;
            container.scrollTo({ left: direction === 'left' ? container.scrollLeft - scrollAmount : container.scrollLeft + scrollAmount, behavior: 'smooth' });
        }
    };

    const displayPoints = () => {
        if (!isLoggedIn) return "登录查看";
        if (loadingPoints) return "加载中...";
        return userPoints ? userPoints.balance : (user?.points || 0);
    };

    return (
        <div className="pt-24 pb-12 min-h-screen px-4 md:px-8 max-w-7xl mx-auto relative z-10">
            {/* Top Status Bar - 移动端适配: flex-col, gap调整 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center mb-8 shadow-xl gap-4">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-amber-500/20 rounded-full">
                            <Coins className="text-amber-400 w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-slate-400 text-sm">我的积分</span>
                            <div className="text-2xl font-bold text-white flex items-baseline gap-1">
                                {displayPoints()}
                                {isLoggedIn ? (
                                    <span onClick={() => navigate('/daily-check-in')} className="text-xs font-normal text-amber-400 cursor-pointer hover:underline flex items-center ml-2">
                                        签到领积分 <ChevronRight size={12} />
                                    </span>
                                ) : (
                                    <span onClick={() => navigate('/login', { state: { from: '/mall' } })} className="text-xs font-normal text-blue-400 cursor-pointer hover:underline flex items-center ml-2">
                                        登录获取积分 <ChevronRight size={12} />
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block w-px h-8 bg-white/10" />
                    <div className="text-xs md:text-sm text-slate-400 bg-slate-900/50 px-3 py-1 rounded-full flex items-center gap-2 border border-white/5 w-full md:w-auto">
                        <Bell size={14} />
                        提醒我领每月18日会员专属福利
                    </div>
                </div>
                <div className="flex gap-4 md:gap-6 text-sm text-slate-300 w-full md:w-auto justify-between md:justify-end border-t md:border-none border-white/10 pt-4 md:pt-0">
                    <button className="hover:text-blue-400 transition-colors">积分规则</button>
                    <button onClick={() => navigate('/exchange-record')} className="hover:text-blue-400 transition-colors">兑换记录</button>
                    <button onClick={() => navigate('/wallet?tab=points')} className="hover:text-blue-400 transition-colors">积分记录</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Column: Redemption Section */}
                <div className="lg:col-span-3 space-y-6 overflow-hidden">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="text-blue-400" />
                        <h2 className="text-2xl font-bold text-white">积分兑换</h2>
                        <div className="flex items-center gap-2 ml-auto md:ml-4 z-10 hidden md:flex">
                            <button onClick={() => scroll('left')} className="p-2 bg-white/5 hover:bg-white/20 border border-white/10 rounded-full"><ChevronLeft size={20} className="text-slate-300" /></button>
                            <button onClick={() => scroll('right')} className="p-2 bg-white/5 hover:bg-white/20 border border-white/10 rounded-full"><ChevronRight size={20} className="text-slate-300" /></button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pb-2">
                        {FILTERS.map((filter, index) => (
                            <button key={index} className={`px-4 py-1.5 rounded-lg text-sm border transition-all ${index === 0 ? 'bg-blue-600/20 border-blue-500/50 text-blue-300' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}>{filter}</button>
                        ))}
                    </div>

                    {/* Carousel - 移动端支持原生触摸滑动 */}
                    {loadingProducts ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="animate-spin text-blue-400" size={32} />
                            <span className="ml-3 text-slate-400">加载商品中...</span>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20 text-slate-500">
                            {isLoggedIn ? '暂无商品' : '请登录后查看更多商品'}
                        </div>
                    ) : (
                        <div ref={scrollContainerRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {products.map((product) => (
                                <div key={product.id} className="flex-shrink-0 w-44 md:w-64 snap-start group bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 flex flex-col">
                                    <div className="aspect-square bg-slate-800 relative overflow-hidden p-4 md:p-6 flex items-center justify-center">
                                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain drop-shadow-xl transition-transform group-hover:scale-110 duration-500" onError={(e) => e.currentTarget.src = `https://picsum.photos/300/300?random=${product.id}`} />
                                        {product.tag && <div className="absolute top-2 left-2 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-600 text-[10px] font-bold text-white rounded">{product.tag}</div>}
                                        {product.stock <= 0 && <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center"><span className="text-white text-sm font-bold">已售罄</span></div>}
                                    </div>
                                    <div className="p-3 md:p-4 flex flex-col flex-grow bg-white/[0.02]">
                                        <h3 className="text-sm font-medium text-slate-200 mb-2 line-clamp-2 h-10">{product.name}</h3>
                                        <div className="mt-auto pt-2 border-t border-white/5">
                                            <div className="flex flex-col mb-2">
                                                <div className="flex items-baseline gap-1 text-blue-300 font-bold text-base md:text-lg">{product.pointsRequired} <span className="text-xs font-normal text-slate-400">积分</span></div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <button
                                                    onClick={() => handleExchangeClick(product)}
                                                    disabled={!isLoggedIn || loadingIds[product.id] || product.stock <= 0}
                                                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors border w-full flex justify-center ${!isLoggedIn
                                                        ? 'bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed'
                                                        : product.stock <= 0
                                                            ? 'bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed'
                                                            : loadingIds[product.id]
                                                                ? 'bg-white/10 border-white/10 text-white cursor-wait'
                                                                : 'bg-white/10 hover:bg-blue-600 border-white/10 hover:border-blue-500 text-white'
                                                        }`}
                                                >
                                                    {!isLoggedIn ? '请先登录' : product.stock <= 0 ? '已售罄' : loadingIds[product.id] ? <Loader2 size={14} className="animate-spin" /> : '立即兑换'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Banner */}
                    <div onClick={() => navigate('/lottery')} className="w-full mt-4 relative rounded-2xl overflow-hidden border border-white/10 group cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-amber-600/20 group-hover:opacity-100 transition-opacity" />
                        <div className="relative p-6 flex flex-col items-center justify-center gap-3 backdrop-blur-sm bg-slate-900/30">
                            <h3 className="text-xl font-bold text-amber-400">幸运大抽奖</h3>
                            <button className="mt-2 px-8 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-full">去抽奖</button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Flash Sale */}
                <div className="lg:col-span-1">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 sticky top-24 min-h-[500px]">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-red-400"><Calendar size={14} /></div>
                                    <h3 className="font-bold text-lg text-white">积分秒杀</h3>
                                </div>
                                <p className="text-xs text-slate-400 ml-7">每日福利限时抢</p>
                            </div>
                        </div>

                        <div className="flex justify-between mb-6 text-sm border-b border-white/10 pb-2">
                            {availableDates.length > 0 ? availableDates.map(date => (
                                <div key={date} onClick={() => handleDateChange(date)} className={`cursor-pointer transition-colors pb-2 -mb-2.5 border-b-2 ${activeDate === date ? 'text-red-400 font-bold border-red-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>{date}</div>
                            )) : <div className="text-slate-500">暂无活动</div>}
                        </div>

                        {isSwitchingDate ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2"><Loader2 className="animate-spin" size={24} /><span className="text-xs">加载中...</span></div>
                        ) : currentFlashList.length === 0 ? (
                            <div className="text-center py-20 text-slate-500 text-xs">{isLoggedIn ? '暂无秒杀活动' : '请登录后查看'}</div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                {currentFlashList.map(renderFlashSaleItem)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Mall;