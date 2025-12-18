import React, { useState, useEffect} from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { Loader2, X, Trophy, AlertCircle } from 'lucide-react';
import api from '../../utils/api';


// 定义奖品类型
interface LotteryPrize {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  badge?: string;
}

const HeroCarousel: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user: authUser, isLoading: authIsLoading, refreshUser } = useAuth();

  // 状态：奖品列表 & 加载状态
  const [prizes, setPrizes] = useState<LotteryPrize[]>([]);
  const [loadingPrizes, setLoadingPrizes] = useState(true);

  const chances = authUser?.lotteryCounts || 0;

  // 抽奖状态
  const [isSpinning, setIsSpinning] = useState(false);
  const [marqueeSpeed, setMarqueeSpeed] = useState('40s');
  const [showResult, setShowResult] = useState(false);
  const [winPrize, setWinPrize] = useState<LotteryPrize | null>(null);

  // 从后端加载奖品列表
  useEffect(() => {
    const fetchPrizes = async () => {
      try {
        const prizeList: LotteryPrize[] = await api.get('/lottery/list');
        setPrizes(prizeList);
      } catch (err) {
        console.error('加载奖品失败:', err);
        setPrizes([]);
      } finally {
        setLoadingPrizes(false);
      }
    };

    fetchPrizes();
  }, []);

  // 操作函数
  const handleLoginClick = () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: location.pathname } });
    }
  };

  const handleGetChancesClick = () => {
    navigate('/mall');
  };

  interface DrawResult {
    prizeId: string;
    user: {
      lotteryCounts: number;
      id: string;
    };
  }

  // 抽奖函数
  const handleDrawClick = async () => {
    if (isSpinning || chances <= 0 || prizes.length === 0) return;

    setIsSpinning(true);
    setMarqueeSpeed('0.5s');

    try {
      const result : any = await api.post<DrawResult>('/lottery/draw');
      const { prizeId } = result; 

      const matchedPrize = prizes.find(p => p.id === prizeId);
      if (!matchedPrize) {
        throw new Error('未找到对应的奖品信息');
      }

      await refreshUser();

      setMarqueeSpeed('2s');
      setTimeout(() => {
        setIsSpinning(false);
        setMarqueeSpeed('40s');
        setShowResult(true);
        setWinPrize(matchedPrize);
      }, 2000);
    } catch (error: any) {
      console.error('抽奖失败:', error);
      setIsSpinning(false);
      setMarqueeSpeed('40s');
      alert(`抽奖失败: ${error.message || '未知错误'}`);
    }
  };

  // 渲染按钮
  const renderButton = () => {
    if (authIsLoading || loadingPrizes) {
      return (
        <button className="px-10 py-3.5 rounded-full bg-white/10 text-white font-bold flex items-center gap-2 cursor-wait">
          <Loader2 className="animate-spin w-5 h-5" /> 加载中...
        </button>
      );
    }

    if (!isLoggedIn) {
      return (
        <button
          onClick={handleLoginClick}
          className="relative group px-10 py-3.5 rounded-full overflow-hidden transition-transform hover:scale-105"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-yellow-400 opacity-80 group-hover:opacity-100 transition-opacity blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-300 opacity-100 rounded-full border border-yellow-200/50 shadow-[0_0_20px_rgba(234,179,8,0.5)]"></div>
          <span className="relative text-brand-dark font-bold text-lg tracking-wide">请先登录</span>
        </button>
      );
    }

    if (chances > 0 && prizes.length > 0) {
      return (
        <button
          onClick={handleDrawClick}
          disabled={isSpinning}
          className="relative group px-12 py-4 rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient-x opacity-90"></div>
          <div className="absolute inset-0 border border-white/30 rounded-full"></div>
          <div className="relative flex flex-col items-center leading-none">
            <span className="text-white font-black text-xl tracking-wider drop-shadow-md">
              {isSpinning ? '抽奖中...' : '立即抽奖'}
            </span>
            {!isSpinning && (
              <span className="text-[10px] text-white/80 mt-1 bg-black/20 px-2 py-0.5 rounded-full">
                剩余次数: {chances}
              </span>
            )}
          </div>
        </button>
      );
    }

    return (
      <button
        onClick={handleGetChancesClick}
        className="relative group px-10 py-3.5 rounded-full overflow-hidden transition-transform hover:scale-105"
      >
        <div className="absolute inset-0 bg-slate-700 opacity-80 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute inset-0 border border-white/20 rounded-full"></div>
        <span className="relative text-white font-bold text-lg tracking-wide flex items-center gap-2">
          获取次数 <AlertCircle size={16} />
        </span>
      </button>
    );
  };

  // 奖品卡片组件
  const ProductCard = ({ product }: { product: LotteryPrize }) => {
    const IconComponent = (Icons as any)[product.icon] || Icons.Box;
    const colorParts = product.color.split('-');
    const colorName = colorParts.length > 1 ? colorParts[1] : 'blue';

    return (
      <div className="w-[260px] md:w-[320px] h-[340px] md:h-[380px] rounded-2xl relative group/card transition-all duration-300 hover:-translate-y-2 flex-shrink-0 cursor-pointer snap-center">
        <div className="absolute inset-0 bg-brand-card rounded-2xl border border-white/5 group-hover/card:border-white/20 transition-all overflow-hidden bg-[#1a1b26]">
          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${colorName}-500 to-transparent opacity-50 group-hover/card:opacity-100 transition-opacity`}></div>
          <div className="h-full flex flex-col items-center justify-center p-6 text-center z-10 relative">
            <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full bg-black/40 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover/card:shadow-[0_0_40px_${colorName === 'white' ? 'rgba(255,255,255,0.2)' : `rgba(var(--color-${colorName}-500),0.3)`}] transition-shadow duration-500`}>
              <IconComponent className={`w-10 h-10 md:w-12 md:h-12 ${product.color} drop-shadow-lg`} />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{product.title}</h3>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed mb-6 line-clamp-2">{product.subtitle}</p>
            {product.badge && (
              <span className="absolute top-4 right-4 bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded border border-red-500/30">
                {product.badge}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 构造轮播数据
  const displayProducts = [...prizes, ...prizes];

  return (
    <div className="relative w-full py-12 md:py-20 overflow-hidden min-h-[500px] md:min-h-[600px] flex flex-col justify-center">
      <div className="absolute inset-0 bg-brand-dark opacity-90 -z-10 bg-[#0f0c29]"></div>
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[400px] bg-purple-600/20 blur-[100px] rounded-full pointer-events-none transition-all duration-1000 ${isSpinning ? 'scale-125 bg-red-600/30' : 'scale-100'}`} />

      <div className="container-fluid w-full relative">
        <div className="relative w-full overflow-hidden group">
          {/* 遮罩层 - 仅在 PC 端显示，或手机端两侧留白 */}
          <div className="absolute left-0 top-0 bottom-0 w-4 md:w-40 bg-gradient-to-r from-[#0f0c29] to-transparent z-20 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-4 md:w-40 bg-gradient-to-l from-[#0f0c29] to-transparent z-20 pointer-events-none"></div>

          {loadingPrizes ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin w-8 h-8 text-white" />
            </div>
          ) : (
            <>
              {/* 1. Mobile View: 原生横向滚动，带 Snap 效果 */}
              <div className="flex md:hidden overflow-x-auto snap-x snap-mandatory px-8 gap-4 scrollbar-hide pb-4">
                 {/* 手机端只渲染一份奖品列表即可，无需无限循环 */}
                 {prizes.map((product, idx) => (
                    <div key={`m-${idx}`} className="snap-center shrink-0">
                       <ProductCard product={product} />
                    </div>
                 ))}
                 {/* 如果奖品太少，可以重复渲染一次保证视觉效果 */}
                 {prizes.length < 3 && prizes.map((product, idx) => (
                    <div key={`m-dup-${idx}`} className="snap-center shrink-0">
                       <ProductCard product={product} />
                    </div>
                 ))}
              </div>

              {/* 2. Desktop View: 自动无限跑马灯 */}
              <div className="hidden md:flex">
                <div
                  className="flex animate-marquee-slow min-w-full shrink-0 items-center justify-around"
                  style={{ animationDuration: marqueeSpeed }}
                >
                  {displayProducts.map((product, idx) => (
                    // 这里添加 mx-4 增加间距
                    <div key={`p1-${idx}`} className="mx-4">
                        <ProductCard product={product} />
                    </div>
                  ))}
                </div>
                <div
                  className="flex animate-marquee-slow min-w-full shrink-0 items-center justify-around"
                  style={{ animationDuration: marqueeSpeed }}
                >
                  {displayProducts.map((product, idx) => (
                    <div key={`p2-${idx}`} className="mx-4">
                        <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-center mt-12 md:mt-16 relative z-20 scale-90 md:scale-100">{renderButton()}</div>
      </div>

      {/* 中奖弹窗  */}
      {showResult && winPrize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setShowResult(false)}
          ></div>
          <div className="relative bg-[#1a1b26] border border-white/10 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/20 blur-[60px] rounded-full pointer-events-none"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(234,179,8,0.6)] animate-bounce">
                <Trophy size={40} className="text-white drop-shadow-md" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2">恭喜中奖!</h2>
              <p className="text-slate-400 mb-6">运气爆棚，获得了以下奖品</p>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 w-full mb-6">
                <h3 className="text-xl font-bold text-amber-400 mb-1">{winPrize.title}</h3>
                <p className="text-xs text-slate-500">{winPrize.subtitle}</p>
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowResult(false)}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors"
                >
                  关闭
                </button>
                <button
                  onClick={() => setShowResult(false)}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                >
                  再试一次
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowResult(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroCarousel;