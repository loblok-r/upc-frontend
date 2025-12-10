import React, { useState, useEffect, useRef } from 'react';
import { Coins, ChevronRight, Bell, Calendar, ChevronLeft, ShoppingBag, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FILTERS } from '../data/constants';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

// --- Type Definitions ---
interface Product {
    id: string;
    name: string;
    description?: string;
    category: string; // virtual/physical/service
    pointsRequired: number;
    originalPrice?: number;
    stock: number;
    limitPerUser?: number;
    tag?: string;
    imageUrl: string;
    status: string; // active/inactive/sold_out
    isVirtual: boolean;
    sortOrder: number;
    createdAt: string;
}

interface FlashSaleItem {
    id: string;
    productId: string;
    productName: string;
    description: string;
    salePrice: number;
    originalPrice: number;
    totalStock: number;
    remainingStock: number;
    startTime: string;
    endTime: string;
    dailyLimit: number;
    image: string;
    status: 'upcoming' | 'active' | 'ended';
}

interface ProductsResponse {
    products: Product[];
    total: number;
    page: number;
    limit: number;
}

interface ExchangeRequest {
    productId: string;
    quantity?: number;
    shippingInfo?: {
        name: string;
        phone: string;
        address: string;
    };
}

interface ExchangeResponse {
    orderId: string;
    success: boolean;
    message: string;
    virtualContent?: string;
}

interface GrabFlashRequest {
    flashSaleId: string;
    quantity?: number;
}

interface GrabFlashResponse {
    orderId: string;
    success: boolean;
    message: string;
    reserveExpiresAt?: string;
    virtualContent?: string;
}

// 错误类型
interface GrabErrorResponse {
    code: number;
    message: string;
    remainingStock?: number; // 剩余库存
    waitTime?: number; // 等待时间（秒）
}

interface UserPointsResponse {
    balance: number;
    totalEarned: number;
    totalSpent: number;
}

// 日期格式化工具函数
const formatDate = (date: Date): string => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
};

const Mall: React.FC = () => {
    const { user, isLoggedIn, refreshUser } = useAuth();
    const navigate = useNavigate();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // --- State Management ---
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

    // --- 数据加载函数 ---
    // 加载商品列表
    const loadProducts = async () => {
        if (!isLoggedIn) return;

        setLoadingProducts(true);
        try {
            // 直接获取data部分
            const response = await api.get<ProductsResponse>('/mall/products', {
                params: {
                    page: 1,
                    limit: 20,
                    sort: 'newest'
                }
            }) as unknown as any;

            // console.log("API Response structure:", response);
            // console.log("Response keys:", Object.keys(response));
            // 根据实际结构提取数据
            let productsList = [];

            // 尝试不同的可能结构
            if (response.list) {
                productsList = response.list;
            } else if (response.products) {
                productsList = response.products;
            } else if (Array.isArray(response)) {
                productsList = response;
            } else if (response.data?.list) {
                productsList = response.data.list;
            } else if (response.data?.products) {
                productsList = response.data.products;
            } else if (response.data && Array.isArray(response.data)) {
                productsList = response.data;
            }
            setProducts(productsList || []);
        } catch (error) {
            // 拦截器已经alert了错误，这里只需要处理业务逻辑
            console.error('加载商品失败:', error);
            setProducts([]); // 设置空数组
        } finally {
            setLoadingProducts(false);
        }
    };

    // 检查秒杀商品状态的函数
    const checkFlashSaleStatus = (item: FlashSaleItem): 'upcoming' | 'active' | 'ended' => {
        const now = new Date();
        const startTime = new Date(item.startTime);
        const endTime = new Date(item.endTime);

        if (now < startTime) {
            return 'upcoming';
        } else if (now >= startTime && now <= endTime) {
            return 'active';
        } else {
            return 'ended';
        }
    };

    // 检查库存状态的函数
    const checkStockStatus = (item: FlashSaleItem): 'in_stock' | 'sold_out' => {
        return item.remainingStock > 0 ? 'in_stock' : 'sold_out';
    };
    // 加载秒杀活动
    const loadFlashSales = async (date?: string) => {
        if (!isLoggedIn) return;

        setIsSwitchingDate(true);
        try {
            const params: any = {};

            if (date && date.trim()) {
                const match = date.match(/(\d{1,2})月(\d{1,2})日/);
                if (match && match.length >= 3) {
                    const month = match[1];
                    const day = match[2];
                    const year = new Date().getFullYear();
                    const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    params.date = formattedDate;
                }
            }

            const response = await api.get('/mall/flash-sales', { params });

            console.log("flash-sales Response structure:", response);
            console.log("Response list:", response.list);
            console.log("Response data:", response.data);

            let flashSalesData: FlashSaleItem[] = [];

            // 根据实际的响应结构提取数据
            if (response && Array.isArray(response.list)) {
                // 如果响应直接包含 list 属性
                flashSalesData = response.list.map((item: any) => ({
                    ...item,
                    status: checkFlashSaleStatus(item)
                }));
            } else if (response.data && Array.isArray(response.data.list)) {
                // 如果响应是 {data: {list: [...]}}
                flashSalesData = response.data.list.map((item: any) => ({
                    ...item,
                    status: checkFlashSaleStatus(item)
                }));
            } else if (Array.isArray(response.data)) {
                // 如果响应是 {data: [...]}
                flashSalesData = response.data.map((item: any) => ({
                    ...item,
                    status: checkFlashSaleStatus(item)
                }));
            }

            console.log("处理后的秒杀数据:", flashSalesData);
            setCurrentFlashList(flashSalesData);

            // 生成可选的日期列表
            const dates = [];
            for (let i = 0; i < 3; i++) {
                const date = new Date();
                date.setDate(date.getDate() + i);
                dates.push(formatDate(date));
            }
            setAvailableDates(dates);

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
            // 直接获取UserPointsResponse
            const response = await api.get<UserPointsResponse>('/mall/user/points');

            console.log("point Response structure:", response);
            const data = response as unknown as UserPointsResponse;
            setUserPoints(data);

            // 同时更新 AuthContext 中的用户积分
            if (user) {
                refreshUser();
            }
        } catch (error) {
            console.error('加载用户积分失败:', error);
            // 保持原有状态
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


    // 秒杀抢购处理函数
    const handleGrabFlashSale = async (flashSaleId: string, item: FlashSaleItem) => {
        // 1. 前置校验
        if (!requireLogin('参与秒杀')) return false;

        if (loadingIds[flashSaleId]) {
            console.log('请求中，请稍候...');
            return false;
        }

        // 2. 客户端状态校验（防重复提交）
        const currentStatus = checkFlashSaleStatus(item);
        if (currentStatus !== 'active') {
            alert('活动未开始或已结束');
            return false;
        }

        if (item.remainingStock <= 0) {
            alert('商品已抢光');
            return false;
        }

        // 3. 积分校验
        if (userPoints && userPoints.balance < item.salePrice) {
            alert(`积分不足，需要${item.salePrice}积分，当前只有${userPoints.balance}积分`);
            return false;
        }

        // 4. 设置加载状态
        setLoadingIds(prev => ({ ...prev, [flashSaleId]: true }));

        try {
            // 5. 构建请求数据
            const requestData: GrabFlashRequest = {
                flashSaleId: flashSaleId,
                quantity: 1 // 默认抢购1件
            };

            console.log('发送秒杀请求:', requestData);

            // 6. 发送请求
            const response = await api.post<GrabFlashResponse>(
                '/mall/flash/grab',
                requestData,
                {
                    timeout: 10000, // 10秒超时
                    headers: {
                        'X-Request-Type': 'flash-sale'
                    }
                }
            );

            // 7. 处理响应
            const result = response.data;

            if (result.success) {
                // 抢购成功
                await handleGrabSuccess(result, item);
                return true;
            } else {
                // 业务逻辑失败
                alert(`${item.productName}: ${result.message}`);
                return false;
            }

        } catch (error: any) {
            // 8. 错误处理
            await handleGrabError(error, item);
            return false;
        } finally {
            // 9. 清理加载状态
            setLoadingIds(prev => ({ ...prev, [flashSaleId]: false }));
        }
    };

    // 抢购成功处理
    const handleGrabSuccess = async (result: GrabFlashResponse, item: FlashSaleItem) => {
        // 显示成功消息
        alert(`🎉 恭喜！抢购成功！\n${item.productName}: ${result.message}`);

        // 如果有虚拟内容（卡密等）
        if (result.virtualContent) {
            if (confirm('虚拟商品已兑换成功！是否查看卡密？')) {
                alert(`卡密：${result.virtualContent}\n请妥善保存！`);
            }
        }

        // 如果有订单保留时间
        if (result.reserveExpiresAt) {
            const expiresAt = new Date(result.reserveExpiresAt);
            const now = new Date();
            const minutesLeft = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60));

            if (minutesLeft > 0) {
                alert(`请在 ${minutesLeft} 分钟内完成支付，否则订单将自动取消`);

                // 可以跳转到支付页面
                if (result.orderId) {
                    // navigate(`/order/pay/${result.orderId}`);
                }
            }
        }

        // 刷新数据
        await Promise.all([
            loadFlashSales(activeDate),
            loadUserPoints(),
            refreshUser() // 刷新用户信息
        ]);
    };

    // 抢购错误处理
    const handleGrabError = async (error: any, item: FlashSaleItem) => {
        console.error('秒杀抢购失败:', error);

        if (error.response) {
            // 服务器返回的错误
            const errorData = error.response.data;

            switch (error.response.status) {
                case 400:
                    alert(`请求参数错误: ${errorData.message}`);
                    break;

                case 401:
                    alert('登录已过期，请重新登录');
                    navigate('/login', { state: { from: '/mall' } });
                    break;

                case 403:
                    alert(`抢购失败: ${errorData.message || '无权限'}`);
                    break;

                case 409:
                    // 库存冲突
                    alert(`很遗憾，${errorData.message || '手慢了，商品已被抢光'}`);
                    break;

                case 429:
                    // 请求过于频繁
                    alert(`操作过于频繁，请稍后再试\n${errorData.waitTime ? `等待时间: ${errorData.waitTime}秒` : ''}`);
                    break;

                default:
                    alert(`抢购失败: ${errorData.message || '服务器错误'}`);
            }

            // 如果返回了剩余库存，更新本地状态
            if (errorData.remainingStock !== undefined) {
                setCurrentFlashList(prev => prev.map(flashItem =>
                    flashItem.id === item.id
                        ? { ...flashItem, remainingStock: errorData.remainingStock }
                        : flashItem
                ));
            }
        } else if (error.request) {
            // 请求发出但没有响应
            alert('网络异常，请检查网络连接');
        } else {
            // 其他错误
            alert('抢购失败，请稍后重试');
        }
    };

    // 在秒杀商品渲染中的按钮点击处理
   const onGrabClick = async (item: FlashSaleItem) => {
    // 检查登录
    if (!requireLogin('参与秒杀')) return;
    
    // 获取当前状态
    const currentStatus = checkFlashSaleStatus(item);
    
    // 状态检查
    if (currentStatus !== 'active') {
        alert(`活动${currentStatus === 'upcoming' ? '尚未开始' : '已结束'}`);
        return;
    }
    
    if (item.remainingStock <= 0) {
        alert('商品已抢光');
        return;
    }
    
    // 积分检查
    if (userPoints && userPoints.balance < item.salePrice) {
        alert(`积分不足，需要${item.salePrice}积分，当前只有${userPoints.balance}积分`);
        return;
    }
    
    // 确认弹窗
    if (!confirm(`确定要抢购【${item.productName}】吗？\n需要消耗 ${item.salePrice} 积分`)) {
        return;
    }
    
    // 执行抢购逻辑
    await handleGrabClick(item);
};



    // --- 初始化加载 ---
    useEffect(() => {
        if (isLoggedIn) {
            loadProducts();
            loadFlashSales(activeDate);
            loadUserPoints();
        }
    }, [isLoggedIn]);

    // 实时更新秒杀状态
    useEffect(() => {
        if (!isLoggedIn || currentFlashList.length === 0) return;

        const interval = setInterval(() => {
            // 重新计算所有秒杀商品的状态
            const updatedList = currentFlashList.map(item => ({
                ...item,
                status: checkFlashSaleStatus(item)
            }));

            // 只有当状态发生变化时才更新状态
            if (JSON.stringify(updatedList) !== JSON.stringify(currentFlashList)) {
                setCurrentFlashList(updatedList);
            }
        }, 1000); // 每秒检查一次

        return () => clearInterval(interval);
    }, [currentFlashList, isLoggedIn]);
    // 当 activeDate 变化时重新加载秒杀活动
    useEffect(() => {
        if (isLoggedIn) {
            loadFlashSales(activeDate);
        }
    }, [activeDate, isLoggedIn]);

    // --- Actions ---
    const handleDateChange = async (date: string) => {
        if (date === activeDate) return;
        setActiveDate(date);
    };

    // 普通商品兑换逻辑
    const handleExchangeClick = async (product: Product) => {
        if (!requireLogin('兑换商品')) return;

        if (loadingIds[product.id]) return;

        // 检查积分是否足够
        if (userPoints && userPoints.balance < product.pointsRequired) {
            alert(`积分不足，需要${product.pointsRequired}积分，当前只有${userPoints.balance}积分`);
            return;
        }

        // 检查库存
        if (product.stock <= 0) {
            alert('商品库存不足');
            return;
        }

        setLoadingIds(prev => ({ ...prev, [product.id]: true }));

        try {
            const request: ExchangeRequest = {
                productId: product.id,
                quantity: 1
            };

            // 如果是实物商品，需要获取收货信息
            if (!product.isVirtual) {
                const name = prompt('请输入收货人姓名：');
                const phone = prompt('请输入收货人电话：');
                const address = prompt('请输入收货地址：');

                if (!name || !phone || !address) {
                    alert('请填写完整的收货信息');
                    return;
                }

                request.shippingInfo = { name, phone, address };
            }

            // 直接获取ExchangeResponse，不需要处理Result包装
            const response = await api.post<ExchangeResponse>('/mall/exchange', request);
            const data = response as unknown as ExchangeResponse;

            if (data.success) {
                alert(`${product.name}: ${data.message}`);

                // 重新加载数据
                await Promise.all([
                    loadProducts(),
                    loadUserPoints()
                ]);

                // 如果是虚拟商品且有卡密，显示卡密
                if (product.isVirtual && data.virtualContent) {
                    alert(`卡密：${data.virtualContent}\n请妥善保存！`);
                }
            } else {
                alert(`${product.name}: ${data.message}`);
            }

        } catch (error: any) {
            // 拦截器已经alert了错误，这里处理业务逻辑
            console.error('兑换商品失败:', error);
            // 如果是业务逻辑错误（如库存不足），error.message已经是业务信息
            // 不需要再额外alert
        } finally {
            setLoadingIds(prev => ({ ...prev, [product.id]: false }));
        }
    };

    // 秒杀抢购逻辑
    const handleGrabClick = async (item: FlashSaleItem) => {
        if (!requireLogin('参与秒杀')) return;

        if (loadingIds[item.id]) return;

        // 重新检查状态（防止点击瞬间状态变化）
        const currentStatus = checkFlashSaleStatus(item);
        if (currentStatus !== 'active') {
            alert('活动未开始或已结束');
            return;
        }

        if (item.remainingStock <= 0) {
            alert('商品已抢光');
            return;
        }

        // 检查积分是否足够
        if (userPoints && userPoints.balance < item.salePrice) {
            alert(`积分不足，需要${item.salePrice}积分，当前只有${userPoints.balance}积分`);
            return;
        }

        setLoadingIds(prev => ({ ...prev, [item.id]: true }));

        try {
            const request: GrabFlashRequest = {
                flashSaleId: item.id
            };

            const response = await api.post<GrabFlashResponse>('/mall/flash/grab', request);
            const data = response as unknown as GrabFlashResponse;

            if (data.success) {
                alert(`${item.productName}: ${data.message}`);

                // 重新加载数据
                await Promise.all([
                    loadFlashSales(activeDate),
                    loadUserPoints()
                ]);

                if (data.reserveExpiresAt) {
                    const expiresAt = new Date(data.reserveExpiresAt);
                    const now = new Date();
                    const minutesLeft = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60));
                    if (minutesLeft > 0) {
                        alert(`请在${minutesLeft}分钟内完成支付，否则订单将自动取消`);
                    }
                }
            } else {
                alert(`${item.productName}: ${data.message}`);
            }

        } catch (error: any) {
            console.error('秒杀抢购失败:', error);
        } finally {
            setLoadingIds(prev => ({ ...prev, [item.id]: false }));
        }
    };

    const renderFlashSaleItem = (item: FlashSaleItem) => {
        // 计算秒杀进度百分比
        const progress = item.totalStock > 0
            ? Math.round((1 - item.remainingStock / item.totalStock) * 100)
            : 0;

        // 获取按钮状态
        const buttonState = getFlashButtonState(item);
        const isGrabDisabled = buttonState.disabled || loadingIds[item.id];
        const currentStatus = checkFlashSaleStatus(item);

        return (
            <div key={item.id} className="flex gap-3 group p-3 hover:bg-slate-800/20 rounded-lg transition-colors">
                {/* 商品图片 */}
                <div className="w-20 h-20 bg-slate-800 rounded-lg flex-shrink-0 relative overflow-hidden">
                    <img
                        src={item.image || `https://picsum.photos/200/200?random=${item.id}`}
                        alt={item.productName}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        onError={(e) => {
                            e.currentTarget.src = `https://picsum.photos/200/200?random=${item.id}`;
                        }}
                    />
                    {/* 状态遮罩 */}
                    {currentStatus === 'ended' && (
                        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center text-xs text-white">
                            已结束
                        </div>
                    )}
                    {currentStatus === 'upcoming' && (
                        <div className="absolute inset-0 bg-blue-900/80 flex items-center justify-center text-xs text-white">
                            即将开始
                        </div>
                    )}
                    {currentStatus === 'active' && item.remainingStock <= 0 && (
                        <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center text-xs text-white">
                            已抢光
                        </div>
                    )}
                    {/* 倒计时标签（即将开始） */}
                    {currentStatus === 'upcoming' && (
                        <div className="absolute bottom-1 left-1 right-1 bg-blue-600/90 text-white text-[10px] px-1 py-0.5 rounded text-center truncate">
                            {(() => {
                                const now = new Date();
                                const startTime = new Date(item.startTime);
                                const diffMs = startTime.getTime() - now.getTime();
                                const diffMins = Math.floor(diffMs / (1000 * 60));
                                const diffHours = Math.floor(diffMins / 60);

                                if (diffHours > 0) {
                                    return `${diffHours}小时后开始`;
                                } else if (diffMins > 0) {
                                    return `${diffMins}分钟后开始`;
                                } else {
                                    return '即将开始';
                                }
                            })()}
                        </div>
                    )}
                </div>

                {/* 商品信息 */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                        {/* 商品名称和描述 */}
                        <h4 className="text-sm font-medium text-slate-200 line-clamp-1 group-hover:text-white transition-colors">
                            {item.productName}
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                            {item.description || '暂无描述'}
                        </p>

                        {/* 进度条（只在活动进行中显示） */}
                        {currentStatus === 'active' && item.remainingStock > 0 && (
                            <div className="mt-2">
                                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                    <span className="truncate">
                                        已抢 {item.totalStock - item.remainingStock}/{item.totalStock}
                                    </span>
                                    <span className="flex-shrink-0">{progress}%</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-red-500 to-orange-500 h-1.5 rounded-full transition-all duration-500 ease-out"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* 剩余时间（活动进行中） */}
                        {currentStatus === 'active' && item.remainingStock > 0 && (
                            <div className="mt-1 text-[10px] text-red-400 font-medium">
                                {(() => {
                                    const now = new Date();
                                    const endTime = new Date(item.endTime);
                                    const diffMs = endTime.getTime() - now.getTime();
                                    const diffMins = Math.floor(diffMs / (1000 * 60));
                                    const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);

                                    if (diffMins > 0) {
                                        return `剩余 ${diffMins}分${diffSecs}秒`;
                                    } else if (diffSecs > 0) {
                                        return `剩余 ${diffSecs}秒`;
                                    } else {
                                        return '即将结束';
                                    }
                                })()}
                            </div>
                        )}
                    </div>

                    {/* 价格和按钮区域 */}
                    <div className="flex justify-between items-end mt-2">
                        {/* 价格信息 */}
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-baseline gap-1">
                                <span className="text-red-400 font-bold text-sm truncate">
                                    {item.salePrice}积分
                                </span>
                                <span className="text-[10px] text-slate-600 line-through flex-shrink-0">
                                    {item.originalPrice}积分
                                </span>
                            </div>
                            {/* 节省积分 */}
                            <div className="text-[10px] text-green-400 font-medium">
                                节省 {item.originalPrice - item.salePrice}积分
                            </div>
                            {/* 库存信息 */}
                            <div className="text-[10px] text-slate-500 mt-0.5">
                                剩余库存: {item.remainingStock > 0 ? item.remainingStock : '无'}
                                {item.dailyLimit > 0 && ` · 限购${item.dailyLimit}件`}
                            </div>
                        </div>

                        {/* 抢购按钮 */}
                        <button
                            onClick={() => onGrabClick(item)}
                            disabled={isGrabDisabled}
                            className={`
                            px-3 py-1 text-xs rounded-full border min-w-[60px]
                            flex justify-center items-center transition-all duration-200
                            font-medium
                            ${buttonState.className}
                            ${loadingIds[item.id] ? 'opacity-75 cursor-wait' : ''}
                            ${!isGrabDisabled ? 'hover:scale-105 active:scale-95 shadow-lg' : ''}
                            ${currentStatus === 'active' && item.remainingStock > 0
                                    ? 'shadow-[0_2px_10px_rgba(239,68,68,0.3)] hover:shadow-[0_4px_20px_rgba(239,68,68,0.5)]'
                                    : ''
                                }
                        `}
                            title={isGrabDisabled
                                ? (currentStatus === 'upcoming' ? '活动尚未开始'
                                    : currentStatus === 'ended' ? '活动已结束'
                                        : item.remainingStock <= 0 ? '商品已抢光'
                                            : '无法抢购')
                                : '点击抢购'}
                        >
                            {loadingIds[item.id] ? (
                                <>
                                    <Loader2 size={12} className="animate-spin mr-1" />
                                    抢购中
                                </>
                            ) : (
                                <span className="flex items-center gap-1">
                                    {buttonState.text}
                                    {currentStatus === 'active' && item.remainingStock > 0 && !loadingIds[item.id] && (
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const handleLotteryClick = () => navigate('/lottery');
    const handleWalletClick = () => navigate('/wallet?tab=points');

    // 签到领积分
    const handleCheckInClick = () => {
        if (!requireLogin('签到')) return;
        navigate('/daily-check-in');
    };

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

    // 显示积分的函数
    const displayPoints = () => {
        if (!isLoggedIn) return "登录查看";

        if (loadingPoints) return "加载中...";

        if (userPoints) {
            return userPoints.balance;
        }

        return user?.points || 0;
    };

    return (
        <div className="pt-24 pb-12 min-h-screen px-4 md:px-8 max-w-7xl mx-auto relative z-10">
            {/* Top Status Bar */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center mb-8 shadow-xl">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-amber-500/20 rounded-full">
                            <Coins className="text-amber-400 w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-slate-400 text-sm">我的积分</span>
                            <div className="text-2xl font-bold text-white flex items-baseline gap-1">
                                {displayPoints()}
                                {isLoggedIn ? (
                                    <span
                                        onClick={handleCheckInClick}
                                        className="text-xs font-normal text-amber-400 cursor-pointer hover:underline flex items-center"
                                    >
                                        签到领积分 <ChevronRight size={12} />
                                    </span>
                                ) : (
                                    <span
                                        onClick={() => navigate('/login', { state: { from: '/mall' } })}
                                        className="text-xs font-normal text-blue-400 cursor-pointer hover:underline flex items-center"
                                    >
                                        登录获取积分 <ChevronRight size={12} />
                                    </span>
                                )}
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
                                className={`px-4 py-1.5 rounded-lg text-sm border transition-all ${index === 0
                                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                                    : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    {/* Carousel */}
                    {loadingProducts ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="animate-spin text-blue-400" size={32} />
                            <span className="ml-3 text-slate-400">加载商品中...</span>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20 text-slate-500">
                            暂无商品
                        </div>
                    ) : (
                        <div
                            ref={scrollContainerRef}
                            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="flex-shrink-0 w-64 snap-start group bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] flex flex-col"
                                >
                                    {/* Image Area */}
                                    <div className="aspect-square bg-slate-800 relative overflow-hidden p-6 flex items-center justify-center">
                                        <img
                                            src={product.imageUrl || `https://picsum.photos/300/300?random=${product.id}`}
                                            alt={product.name}
                                            className="w-full h-full object-contain drop-shadow-xl transition-transform group-hover:scale-110 duration-500"
                                            onError={(e) => {
                                                e.currentTarget.src = `https://picsum.photos/300/300?random=${product.id}`;
                                            }}
                                        />
                                        {product.tag && (
                                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-600 text-[10px] font-bold text-white rounded">
                                                {product.tag}
                                            </div>
                                        )}
                                        {product.stock <= 0 && (
                                            <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
                                                <span className="text-white text-sm font-bold">已售罄</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Area */}
                                    <div className="p-4 flex flex-col flex-grow bg-white/[0.02]">
                                        <h3 className="text-sm font-medium text-slate-200 mb-2 line-clamp-2 h-10">{product.name}</h3>
                                        <p className="text-xs text-slate-500 mb-2 line-clamp-2">{product.description}</p>
                                        <div className="mt-auto pt-2 border-t border-white/5">
                                            <div className="flex flex-col mb-2">
                                                <div className="flex items-baseline gap-1 text-blue-300 font-bold text-lg">
                                                    {product.pointsRequired} <span className="text-xs font-normal text-slate-400">积分</span>
                                                </div>
                                                {product.originalPrice && product.originalPrice > 0 && (
                                                    <span className="text-xs font-medium text-slate-400">价值 ¥{product.originalPrice}</span>
                                                )}
                                                <div className="text-xs text-slate-500 mt-1">
                                                    库存: {product.stock > 0 ? product.stock : '无'}
                                                    {product.limitPerUser && product.limitPerUser > 1 && ` · 限购${product.limitPerUser}件`}
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-slate-600">
                                                    {product.isVirtual ? '虚拟商品' : '实物商品'}
                                                </span>
                                                <button
                                                    onClick={() => handleExchangeClick(product)}
                                                    disabled={!isLoggedIn || loadingIds[product.id] || product.stock <= 0}
                                                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors border min-w-[72px] flex justify-center ${!isLoggedIn
                                                        ? 'bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed'
                                                        : product.stock <= 0
                                                            ? 'bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed'
                                                            : loadingIds[product.id]
                                                                ? 'bg-white/10 border-white/10 text-white cursor-wait'
                                                                : 'bg-white/10 hover:bg-blue-600 border-white/10 hover:border-blue-500 text-white'
                                                        }`}
                                                >
                                                    {!isLoggedIn ? '请先登录' :
                                                        product.stock <= 0 ? '已售罄' :
                                                            loadingIds[product.id] ? (
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
                    )}

                    {/* Banner */}
                    <div className="w-full mt-4 relative rounded-2xl overflow-hidden border border-white/10 group cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-amber-600/20 group-hover:opacity-100 transition-opacity" />
                        <div className="relative p-6 flex flex-col items-center justify-center gap-3 backdrop-blur-sm bg-slate-900/30">
                            <div className="bg-amber-500 text-slate-900 text-xs font-bold px-2 py-0.5 rounded absolute top-0 right-0 rounded-bl-lg rounded-tr-lg">
                                限时
                            </div>
                            <h3 className="text-xl font-bold text-amber-400">幸运大抽奖</h3>
                            <p className="text-sm text-slate-400">赢取年度会员大奖</p>
                            <button
                                onClick={handleLotteryClick}
                                className="mt-2 px-8 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-full hover:shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-shadow"
                            >
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

                        {/* 动态日期 Tabs */}
                        <div className="flex justify-between mb-6 text-sm border-b border-white/10 pb-2">
                            {availableDates.length > 0 ? (
                                availableDates.map(date => (
                                    <div
                                        key={date}
                                        onClick={() => handleDateChange(date)}
                                        className={`cursor-pointer transition-colors pb-2 -mb-2.5 border-b-2 ${activeDate === date
                                            ? 'text-red-400 font-bold border-red-500'
                                            : 'text-slate-500 border-transparent hover:text-slate-300'
                                            }`}
                                    >
                                        {date}
                                    </div>
                                ))
                            ) : (
                                <div className="text-slate-500">暂无活动</div>
                            )}
                        </div>

                        {/* List Content */}
                        {isSwitchingDate ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
                                <Loader2 className="animate-spin" size={24} />
                                <span className="text-xs">加载中...</span>
                            </div>
                        ) : currentFlashList.length === 0 ? (
                            <div className="text-center py-20 text-slate-500 text-xs">
                                {isLoggedIn ? '暂无秒杀活动' : '请先登录查看'}
                            </div>
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