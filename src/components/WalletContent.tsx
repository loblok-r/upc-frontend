import React, { useState, useEffect } from 'react';
import { WalletTabId } from '../types';
import type { PointTransaction, Coupon, OrderItem, BenefitItem } from '../types/index';
import type { PaginationParams, PaginatedResponse } from '../types/page';
import { SIDEBAR_ITEMS } from '../data/constants';
import {
  Coins, Filter, ChevronDown, Archive, Loader2,
  Ticket, Calendar, Package, Truck, ShieldCheck, Lock,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MockWalletService } from '../services/mockWalletService';
import api from '../utils/api';

interface WalletContentProps {
  activeTab: WalletTabId;
}

// 分页配置
const DEFAULT_PAGE_SIZE = 8;
const PAGE_SIZE_OPTIONS = [8];

export const WalletContent: React.FC<WalletContentProps> = ({ activeTab }) => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  // 数据状态
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // 跳页输入框状态
  const [goToPageInput, setGoToPageInput] = useState('');

  // 重置分页状态当切换tab时
  useEffect(() => {
    setCurrentPage(1);
    setTotal(0);
    setTotalPages(1);
  }, [activeTab]);

  // 构建分页参数
  const buildPaginationParams = (): PaginationParams => {
    return {
      page: currentPage,
      pageSize: pageSize,
      // 可以在这里添加其他筛选条件
    };
  };

  // 从后端API获取积分流水（带分页）
  const fetchPointsFromBackend = async (params: PaginationParams) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching points with params:', params);

      // 使用封装好的api调用后端接口，传递分页参数
     const response = await api.get('/points/transactions', { params: params }) as any;
      

      console.log('API Response:', response); // 调试用

      // 重要：由于 api.ts 的拦截器已经处理了 response.data.data
      // 所以 response 现在直接就是 {list: [...], total: 11, ...}
      const pointsData = response?.list || [];
      const total = response?.total || 0;
      const pageSize = response?.pageSize || params.pageSize;
      const totalPages = response?.totalPages || Math.ceil(total / pageSize);

      console.log('Extracted data:', {
        pointsDataLength: pointsData.length,
        total,
        pageSize,
        totalPages
      });

      // 更新分页信息
      setTotal(total);
      setTotalPages(totalPages);

      // 将后端数据转换为前端需要的格式
      const formattedData = Array.isArray(pointsData)
        ? pointsData.map((item: any) => ({
          id: item.id?.toString() || `tx-${Date.now()}-${Math.random()}`,
          amount: item.deltaPoints || 0,
          source: item.bizTypeDesc || item.bizType || '每日签到',
          date: item.createdAt ? formatDate(item.createdAt) : '未知时间',
        }))
        : [];

      setData(formattedData);
    } catch (err: any) {
      console.error("Failed to fetch points from backend", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });

      setError(err.message || '加载积分流水失败');

      // 如果后端失败，可以降级使用mock数据
      try {
        console.log('Falling back to mock data');
        const mockResult = await MockWalletService.fetchTabContent(activeTab);

        const safeMockResult = Array.isArray(mockResult) ? mockResult : [];
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedMockData = safeMockResult.slice(startIndex, endIndex);

        setData(paginatedMockData);
        setTotal(safeMockResult.length);
        setTotalPages(Math.ceil(safeMockResult.length / pageSize));
      } catch (mockErr) {
        console.error("Mock data also failed", mockErr);
        setData([]);
        setTotal(0);
        setTotalPages(1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 添加日期格式化函数
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // 返回原字符串
      }
      // 格式化为中文日期：YYYY年MM月DD日
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '-');
    } catch (e) {
      return dateString;
    }
  };

  // 获取优惠券数据
  const fetchCouponsFromBackend = async (params: PaginationParams) => {
    try {
      // const response = await api.get('/coupons/list', { params }) as any;
      const response :any = {};
      const { data: couponsData, total, page, pageSize, totalPages } = response;

      setTotal(total);
      setTotalPages(totalPages);

       const formattedData = Array.isArray(couponsData)
        ? couponsData.map((item: any) => ({
          id: item.id?.toString() || `tx-${Date.now()}-${Math.random()}`,
          title: item.name || item.title,
          discount: item.value || item.discount,
          expiry: item.expiryDate || item.validUntil,
          status: item.status || 'active',
        }))
        : [];
      setData(formattedData);
    } catch (err) {
      console.error("Failed to fetch coupons", err);
      const mockResult = await MockWalletService.fetchTabContent(activeTab);

      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedMockData = mockResult.slice(startIndex, endIndex);

      setData(paginatedMockData);
      setTotal(mockResult.length);
      setTotalPages(Math.ceil(mockResult.length / pageSize));
    }
  };

  // 获取实物订单数据
  const fetchOrdersFromBackend = async (params: PaginationParams) => {
    try {
      // const response = await api.get('/orders', { params }) as any; 
      const response :any = {};
      const { data: ordersData, total, page, pageSize, totalPages } = response;

      setTotal(total || ordersData.length);
      setTotalPages(totalPages || Math.ceil((total || ordersData.length) / pageSize));

      const formattedData: OrderItem[] = ordersData.map((item: any) => ({
        id: item.orderId || item.id,
        name: item.productName || item.name,
        image: item.imageUrl || item.image,
        status: item.status === 'delivered' ? 'delivered' : 'shipping',
        date: item.orderDate || item.createdAt,
      }));
      setData(formattedData);
    } catch (err) {
      console.error("Failed to fetch orders", err);
      const mockResult = await MockWalletService.fetchTabContent(activeTab);

      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedMockData = mockResult.slice(startIndex, endIndex);

      setData(paginatedMockData);
      setTotal(mockResult.length);
      setTotalPages(Math.ceil(mockResult.length / pageSize));
    }
  };

  // 获取权益数据
  const fetchBenefitsFromBackend = async (params: PaginationParams) => {
    try {
      // const response = await api.get('/benefits', { params }) as any;
      const response :any = {};
      const { data: benefitsData, total, page, pageSize, totalPages } = response;

      setTotal(total || benefitsData.length);
      setTotalPages(totalPages || Math.ceil((total || benefitsData.length) / pageSize));

      const formattedData: BenefitItem[] = benefitsData.map((item: any) => ({
        id: item.id,
        title: item.name || item.title,
        description: item.description,
        level: item.level || '普通',
        isUnlocked: item.unlocked || item.isUnlocked,
      }));
      setData(formattedData);
    } catch (err) {
      console.error("Failed to fetch benefits", err);
      const mockResult = await MockWalletService.fetchTabContent(activeTab);

      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedMockData = mockResult.slice(startIndex, endIndex);

      setData(paginatedMockData);
      setTotal(mockResult.length);
      setTotalPages(Math.ceil(mockResult.length / pageSize));
    }
  };

  // 监听 activeTab 和分页变化，调用对应的API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      const params = buildPaginationParams();

      // 清空旧数据，防止闪烁
      setData([]);

      try {
        switch (activeTab) {
          case WalletTabId.POINTS:
            await fetchPointsFromBackend(params);
            break;
          case WalletTabId.COUPONS:
            await fetchCouponsFromBackend(params);
            break;
          case WalletTabId.PHYSICAL_ITEMS:
            await fetchOrdersFromBackend(params);
            break;
          case WalletTabId.BENEFITS:
            await fetchBenefitsFromBackend(params);
            break;
          default:
            const result = await MockWalletService.fetchTabContent(activeTab);

            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedData = result.slice(startIndex, endIndex);

            setData(paginatedData);
            setTotal(result.length);
            setTotalPages(Math.ceil(result.length / pageSize));
        }
      } catch (err: any) {
        console.error("Fetch tab content failed", err);
        setError(err.message || '加载数据失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab, currentPage, pageSize]);

  // 分页控制函数
  const goToFirstPage = () => {
    if (currentPage > 1) {
      setCurrentPage(1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToLastPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(totalPages);
    }
  };

  const handleGoToPage = () => {
    const pageNum = parseInt(goToPageInput);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setGoToPageInput('');
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    // 重置到第一页
    setCurrentPage(1); 
  };

  const handleUseClick = () => {
    navigate('/mall');
  };

  // 判断积分金额是正数还是负数
  const getAmountType = (amount: number): 'positive' | 'negative' => {
    return amount >= 0 ? 'positive' : 'negative';
  };

  // 格式化金额显示（为正数添加+号）
  const formatAmount = (amount: number): string => {
    if (amount >= 0) {
      return `+${amount}`;
    }
    // 负数自带-号
    return `${amount}`; 
  };

  // 渲染分页控件
  const renderPagination = () => {
    if (total === 0) return null;

    return (
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-white/10">
        {/* 左侧：每页显示数量 */}
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>每页显示</span>
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            className="bg-slate-800/50 border border-white/10 rounded px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            {PAGE_SIZE_OPTIONS.map(size => (
              <option key={size} value={size}>{size} 条</option>
            ))}
          </select>
          <span>共 {total} 条记录</span>
        </div>

        <div className="flex items-center gap-2">
          {/* 第一页 */}
          <button
            onClick={goToFirstPage}
            disabled={currentPage === 1 || isLoading}
            className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="第一页"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* 上一页 */}
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1 || isLoading}
            className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="上一页"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* 当前页信息 */}
          <div className="px-4 py-2 text-sm">
            <span className="text-slate-300">第 </span>
            <span className="font-bold text-cyan-400">{currentPage}</span>
            <span className="text-slate-300"> 页 / 共 </span>
            <span className="font-bold text-slate-300">{totalPages}</span>
            <span className="text-slate-300"> 页</span>
          </div>

          {/* 下一页 */}
          <button
            onClick={goToNextPage}
            disabled={currentPage >= totalPages || isLoading}
            className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="下一页"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* 最后一页 */}
          <button
            onClick={goToLastPage}
            disabled={currentPage >= totalPages || isLoading}
            className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="最后一页"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>

        {/* 右侧：跳转到指定页 */}
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>跳转到</span>
          <input
            type="number"
            value={goToPageInput}
            onChange={(e) => setGoToPageInput(e.target.value)}
            min="1"
            max={totalPages}
            className="w-16 bg-slate-800/50 border border-white/10 rounded px-2 py-1 text-white text-center focus:outline-none focus:ring-1 focus:ring-cyan-500"
            placeholder="页码"
          />
          <span>页</span>
          <button
            onClick={handleGoToPage}
            disabled={!goToPageInput || isLoading}
            className="px-3 py-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            跳转
          </button>
        </div>
      </div>
    );
  };

  // 积分列表渲染
  const renderPoints = (list: PointTransaction[]) => (
    <>
      <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-slate-500 uppercase tracking-wider mb-4 px-4">
          <div className="col-span-4 md:col-span-3">积分 <span className="text-amber-500/80 bg-amber-500/10 px-1 rounded text-[10px] ml-1">流水</span></div>
          <div className="col-span-4 md:col-span-6">来源</div>
          <div className="col-span-4 md:col-span-3 text-right">时间</div>
        </div>
        {list.map((tx) => {
          const amountType = getAmountType(tx.amount);
          const isPositive = amountType === 'positive';

          return (
            <div
              key={tx.id}
              className="grid grid-cols-12 gap-4 items-center bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-xl p-4 transition-all duration-200 group"
            >
              <div className="col-span-4 md:col-span-3 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isPositive ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-700/50 text-slate-400'
                  }`}>
                  <Coins className="w-4 h-4" />
                </div>
                <span className={`font-mono font-bold ${isPositive ? 'text-amber-400' : 'text-slate-400'
                  }`}>
                  {formatAmount(tx.amount)}
                </span>
              </div>

              <div className="col-span-4 md:col-span-6 text-sm text-slate-300 group-hover:text-white transition-colors">
                {tx.source}
              </div>

              <div className="col-span-4 md:col-span-3 text-right text-sm text-slate-500 font-mono">
                {formatDate(tx.date)} 
              </div>
            </div>
          );
        })}
      </div>
      {renderPagination()}
    </>
  );

  //优惠券渲染
  const renderCoupons = (list: Coupon[]) => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {list.map(coupon => (
          <div key={coupon.id} className={`relative flex rounded-xl overflow-hidden border ${coupon.status === 'active' ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/5 bg-white/5 opacity-60'}`}>
            <div className={`w-24 flex flex-col items-center justify-center p-4 border-r border-dashed ${coupon.status === 'active' ? 'border-amber-500/30 bg-amber-500/10' : 'border-white/10 bg-white/5'}`}>
              <Ticket className={`w-6 h-6 mb-2 ${coupon.status === 'active' ? 'text-amber-500' : 'text-slate-500'}`} />
              <span className={`text-lg font-bold ${coupon.status === 'active' ? 'text-amber-500' : 'text-slate-500'}`}>{coupon.type === 'discount' ? coupon.discount : '¥' + coupon.discount}</span>
            </div>
            <div className="flex-1 p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-white font-medium">{coupon.title}</h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> 有效期至 {coupon.expiry}
                </p>
              </div>
              <div className="mt-3 flex justify-end">
                <span className={`text-xs px-2 py-1 rounded ${coupon.status === 'active' ? 'bg-amber-500 text-black font-bold' : 'bg-slate-700 text-slate-400'}`}>
                  {coupon.status === 'active' ? '立即使用' : coupon.status === 'expired' ? '已过期' : '已使用'}
                </span>
              </div>
            </div>
            <div className="absolute -top-2 left-[5.75rem] w-4 h-4 bg-[#111827] rounded-full"></div>
            <div className="absolute -bottom-2 left-[5.75rem] w-4 h-4 bg-[#111827] rounded-full"></div>
          </div>
        ))}
      </div>
      {renderPagination()}
    </>
  );

  // 实物订单渲染
  const renderOrders = (list: OrderItem[]) => (
    <>
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {list.map(order => (
          <div key={order.id} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
            <img src={order.image} className="w-16 h-16 rounded-lg bg-black object-cover" />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="text-white font-medium">{order.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${order.status === 'delivered' ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                  }`}>
                  {order.status === 'delivered' ? '已送达' : '运输中'}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1"><Package className="w-3 h-3" /> 订单号: {order.id}</span>
                <span>{order.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {renderPagination()}
    </>
  );

  // 权益列表渲染
  const renderBenefits = (list: BenefitItem[]) => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {list.map(benefit => (
          <div key={benefit.id} className={`p-6 rounded-xl border flex flex-col items-center text-center gap-3 transition-all ${benefit.isUnlocked ? 'bg-gradient-to-b from-white/10 to-transparent border-white/10' : 'bg-black/20 border-white/5 opacity-50'
            }`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${benefit.isUnlocked ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-600'}`}>
              {benefit.isUnlocked ? <ShieldCheck className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-white font-bold">{benefit.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{benefit.description}</p>
            </div>
            <span className="mt-2 text-[10px] border border-white/10 px-2 py-0.5 rounded text-slate-500">{benefit.level}</span>
          </div>
        ))}
      </div>
      {renderPagination()}
    </>
  );

  // 主渲染逻辑 

  return (
    <div className="relative z-10 h-full flex flex-col">
      {/* 标题栏 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-white/5 pb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          {SIDEBAR_ITEMS.find(i => i.id === activeTab)?.label}
          {/* 只有在积分 Tab 显示余额标签 */}
          {activeTab === WalletTabId.POINTS && !isLoading && (
            <span className="text-sm font-normal text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              当前积分 {authUser?.points || 0}
            </span>
          )}
        </h2>

        {/* 只有积分 Tab 显示 "去使用" */}
        {activeTab === WalletTabId.POINTS && (
          <div className="flex gap-4">
            <div className="hidden md:flex items-center gap-2 text-slate-400 text-sm cursor-pointer hover:text-white transition-colors mr-4">
              <Filter className="w-4 h-4" /> <span>筛选</span> <ChevronDown className="w-3 h-3" />
            </div>
            <button onClick={handleUseClick} className="bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold px-6 py-2 rounded-lg shadow-lg shadow-amber-500/20 transition-all">
              去使用
            </button>
          </div>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-xs underline hover:text-red-300"
          >
            关闭
          </button>
        </div>
      )}

      {/* 内容区域：处理 Loading、空数据、不同 Tab */}
      <div className="flex-1">
        {isLoading ? (
          // Loading State
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            <p className="text-sm">加载数据中...</p>
          </div>
        ) : data.length > 0 ? (
          <>
            {activeTab === WalletTabId.POINTS && renderPoints(data)}
            {activeTab === WalletTabId.COUPONS && renderCoupons(data)}
            {activeTab === WalletTabId.PHYSICAL_ITEMS && renderOrders(data)}
            {activeTab === WalletTabId.BENEFITS && renderBenefits(data)}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]" style={{ animationDelay: '0.1s' }}>
            <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden">
              <Archive className="w-8 h-8 text-slate-600" />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12 opacity-50"></div>
            </div>
            <p className="text-slate-400 text-sm">空空如也，还没有内容哦~</p>
          </div>
        )}
      </div>
    </div>
  );
};