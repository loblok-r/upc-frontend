import React, { useState, useEffect, useRef } from 'react';
import { PRODUCTS } from '../../data/constants';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate , useLocation} from 'react-router-dom';
import * as Icons from 'lucide-react';
import { Loader2, X, Trophy, AlertCircle } from 'lucide-react';

// ==========================================
// 1. Mock Backend Service (模拟后台接口)
// ==========================================
const MockLotteryService = {
  /**
   * 获取用户抽奖状态
   * 模拟：已登录，且剩余 3 次机会
   * 你可以修改这里的返回逻辑来测试不同状态
   */
  /**
   * 请求抽奖接口
   */
  draw: (): Promise<any> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 随机返回一个奖品
        const randomProduct = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
        resolve(randomProduct);
      }, 1500); // 模拟网络请求时间
    });
  }
};

// ==========================================
// 2. Component Implementation
// ==========================================

const HeroCarousel: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user, logout } = useAuth(); 


  
  // Ensure we have enough items for a smooth loop
  const displayProducts = [...PRODUCTS, ...PRODUCTS]; // Double it for smoother loop if needed

  // --- States ---
  // --- States ---
  const [userStatus, setUserStatus] = useState({ 
    isLoggedIn: false, 
    chances: 0 
  });
  const [loading, setLoading] = useState(true);
  
  // Animation Control
  const [isSpinning, setIsSpinning] = useState(false);
  const [marqueeSpeed, setMarqueeSpeed] = useState('40s'); // 初始慢速
  
  // Result Modal
  const [showResult, setShowResult] = useState(false);
  const [winPrize, setWinPrize] = useState<any>(null);

  // --- Initialization ---
 // --- Initialization ---
  useEffect(() => {
    const init = async () => {
      try {
        // 直接使用最新的 isLoggedIn 状态
        // 这里模拟获取用户机会，实际应该从 API 获取
        const status = { 
          isLoggedIn: isLoggedIn, 
          chances: isLoggedIn ? 3 : 0 // 登录用户有3次机会
        };
        setUserStatus(status);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [isLoggedIn]); 

   // 添加另一个 useEffect 来响应登录状态变化
  useEffect(() => {
    if (!loading) {
      setUserStatus(prev => ({
        ...prev,
        isLoggedIn: isLoggedIn,
        chances: isLoggedIn ? 3 : 0
      }));
    }
  }, [isLoggedIn, loading]);

  // --- Handlers ---

  const handleLoginClick = () => {
    if (!isLoggedIn) {
      // 传递当前路径 (from) 和当前视图 (returnTab)
      navigate('/login', {
        state: {
          from: location.pathname
        }
      });
    } else {
      console.log('用户已登录，显示下拉菜单');
    }
  };

  const handleGetChancesClick = () => {
    // 导航去任务中心或钱包
    navigate('/mall'); 
  };

  const handleDrawClick = async () => {
    if (isSpinning || userStatus.chances <= 0) return;

    // 1. 开始抽奖动画
    setIsSpinning(true);
    setMarqueeSpeed('0.5s'); // 🚀 急速变快 (模拟老虎机旋转)

    try {
      // 2. 调用后台接口 (同时转盘在狂转)
      const prize = await MockLotteryService.draw();
      setWinPrize(prize);

      // 3. 拿到结果，进入缓冲阶段
      setMarqueeSpeed('2s'); // 🐢 缓缓变慢

      // 4. 模拟缓缓停下的过程 (延迟展示结果)
      setTimeout(() => {
        setIsSpinning(false);
        setMarqueeSpeed('40s'); // 恢复正常巡航速度
        setShowResult(true);    // 弹出结果
        
        // 扣除次数
        setUserStatus(prev => ({ ...prev, chances: prev.chances - 1 }));
      }, 2000); // 缓冲2秒后停下

    } catch (error) {
      console.error("Draw failed", error);
      setIsSpinning(false);
      setMarqueeSpeed('40s');
    }
  };

  // --- Render Button Logic ---
  const renderButton = () => {
    if (loading) {
      return (
        <button className="px-10 py-3.5 rounded-full bg-white/10 text-white font-bold flex items-center gap-2 cursor-wait">
          <Loader2 className="animate-spin w-5 h-5" /> 加载中...
        </button>
      );
    }

    // 状态 1: 未登录
    if (!userStatus.isLoggedIn) {
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

    // 状态 2: 已登录且有次数 (抽奖状态)
    if (userStatus.chances > 0) {
      return (
        <button 
          onClick={handleDrawClick}
          disabled={isSpinning}
          className="relative group px-12 py-4 rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed"
        >
          {/* Animated Background for Draw Button */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient-x opacity-90"></div>
          <div className="absolute inset-0 border border-white/30 rounded-full"></div>
          
          <div className="relative flex flex-col items-center leading-none">
             <span className="text-white font-black text-xl tracking-wider drop-shadow-md">
                {isSpinning ? '抽奖中...' : '立即抽奖'}
             </span>
             {!isSpinning && (
                <span className="text-[10px] text-white/80 mt-1 bg-black/20 px-2 py-0.5 rounded-full">
                  剩余次数: {userStatus.chances}
                </span>
             )}
          </div>
        </button>
      );
    }

    // 状态 3: 已登录但无次数
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


  // --- Helper: Product Card Component ---
  const ProductCard = ({ product }: { product: any }) => {
    const IconComponent = (Icons as any)[product.icon] || Icons.Box;
    const colorParts = product.color.split('-');
    const colorName = colorParts.length > 1 ? colorParts[1] : 'blue'; 

    return (
      <div 
        className="w-[280px] md:w-[320px] h-[380px] rounded-2xl relative group/card transition-all duration-300 hover:-translate-y-2 mx-4 flex-shrink-0 cursor-pointer"
      >
        <div className="absolute inset-0 bg-brand-card rounded-2xl border border-white/5 group-hover/card:border-white/20 transition-all overflow-hidden bg-[#1a1b26]">
          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${colorName}-500 to-transparent opacity-50 group-hover/card:opacity-100 transition-opacity`}></div>
          
          <div className="h-full flex flex-col items-center justify-center p-6 text-center z-10 relative">
            <div className={`w-24 h-24 rounded-full bg-black/40 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover/card:shadow-[0_0_40px_${colorName === 'white' ? 'rgba(255,255,255,0.2)' : `rgba(var(--color-${colorName}-500),0.3)`}] transition-shadow duration-500`}>
              <IconComponent className={`w-12 h-12 ${product.color} drop-shadow-lg`} />
            </div>

            <h3 className="text-2xl font-bold text-white mb-3">{product.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              {product.subtitle}
            </p>

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

  return (
    <div className="relative w-full py-12 md:py-20 overflow-hidden min-h-[600px] flex flex-col justify-center">
      <div className="absolute inset-0 bg-brand-dark opacity-90 -z-10 bg-[#0f0c29]"></div>
      
      {/* Background Glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple-600/20 blur-[100px] rounded-full pointer-events-none transition-all duration-1000 ${isSpinning ? 'scale-125 bg-red-600/30' : 'scale-100'}`} />

      <div className="container-fluid w-full relative">
        
        {/* Infinite Carousel Container */}
        <div className="relative w-full overflow-hidden group">
            {/* Gradient Masks */}
            <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-r from-[#0f0c29] to-transparent z-20 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-l from-[#0f0c29] to-transparent z-20 pointer-events-none"></div>

            <div className="flex">
                {/* 
                   KEY CHANGE: Use inline style for animationDuration to control speed via state.
                   We need two identical sets for the infinite loop illusion.
                */}
                <div 
                  className="flex animate-marquee-slow min-w-full shrink-0 items-center justify-around"
                  style={{ animationDuration: marqueeSpeed, animationPlayState: 'running' }}
                >
                    {displayProducts.map((product, idx) => (
                        <ProductCard key={`p1-${idx}`} product={product} />
                    ))}
                </div>
                <div 
                  className="flex animate-marquee-slow min-w-full shrink-0 items-center justify-around"
                  style={{ animationDuration: marqueeSpeed, animationPlayState: 'running' }}
                >
                    {displayProducts.map((product, idx) => (
                        <ProductCard key={`p2-${idx}`} product={product} />
                    ))}
                </div>
            </div>
        </div>

        {/* CTA Button Area */}
        <div className="flex justify-center mt-16 relative z-20">
            {renderButton()}
        </div>
      </div>

      {/* Result Modal Overlay */}
      {showResult && winPrize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowResult(false)}></div>
           
           <div className="relative bg-[#1a1b26] border border-white/10 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
              {/* Explosion Effect Background */}
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
                     onClick={() => {
                        setShowResult(false);
                        // 如果还有次数，可以自动触发下一次，这里简单处理为关闭弹窗以便再次点击
                     }}
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