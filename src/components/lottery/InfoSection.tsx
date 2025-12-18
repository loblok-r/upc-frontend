import React from 'react';
import { useNavigate } from 'react-router-dom';

const InfoSection: React.FC = () => {
  const navigate = useNavigate();

  const handleMallNavigation = () => {
    navigate('/mall');
  };

  return (
    <section className="relative w-full py-10 md:py-16 bg-brand-dark">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Section Title - Mobile: Center/Smaller, Desktop: Left/Larger */}
        <h2 className="text-3xl md:text-5xl font-bold mb-8 md:mb-12 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 drop-shadow-sm text-center md:text-left">
          抽奖活动说明。
        </h2>

        {/* Grid Layout - Mobile: 1 col, Desktop: 2 cols */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          
          {/* Card 1: Full Width Top */}
          <div className="md:col-span-2 bg-brand-card rounded-xl border border-white/5 p-6 md:p-8 relative overflow-hidden hover:border-white/10 transition-colors group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-red-500/10 transition-colors"></div>
            
            <h3 className="text-xl md:text-2xl font-bold text-red-500 mb-3 md:mb-4">获得抽奖次数</h3>
            <p className="text-slate-300 leading-relaxed text-base md:text-lg">
              通过积分兑换、参加活动、充值、签到赢得抽奖次数，连续签到 <span className="text-white font-semibold">7天</span> 即可获得 <span className="text-white font-semibold">1次</span> 抽奖机会，另外可以通过签到、日常活动可以增加账户积分，积分可以兑换抽奖次数。
              <button onClick={handleMallNavigation} className="text-blue-400 hover:text-blue-300 ml-2 underline underline-offset-4 bg-none border-none cursor-pointer">
                积分兑换
              </button>
            </p>
          </div>

          {/* Card 2: Process */}
          <div className="bg-brand-card rounded-xl border border-white/5 p-6 md:p-8 relative overflow-hidden hover:border-white/10 transition-colors">
            <h3 className="text-xl md:text-2xl font-bold text-red-500 mb-4 md:mb-6">抽奖过程</h3>
            <ul className="space-y-3 text-slate-300 text-sm md:text-base">
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full mt-2 md:mt-2.5 mr-3 shrink-0"></span>
                <span>每次抽奖即扣除1次机会。</span>
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full mt-2 md:mt-2.5 mr-3 shrink-0"></span>
                <span>奖品分为3个等级，分别为 金色 紫色 和蓝色。</span>
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full mt-2 md:mt-2.5 mr-3 shrink-0"></span>
                <span>中奖机会分别为 20% 30% 50% 系统将随机开奖。</span>
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full mt-2 md:mt-2.5 mr-3 shrink-0"></span>
                <span>有些奖品可能有使用期限，请在领取后查看具体说明。</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Claim Prize */}
          <div className="bg-brand-card rounded-xl border border-white/5 p-6 md:p-8 relative overflow-hidden hover:border-white/10 transition-colors">
            <h3 className="text-xl md:text-2xl font-bold text-red-500 mb-4 md:mb-6">领取奖品</h3>
            <ul className="space-y-3 text-slate-300 text-sm md:text-base">
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full mt-2 md:mt-2.5 mr-3 shrink-0"></span>
                <span><span className="text-white font-medium">额度：</span> 点数领取后自动增加会员使用额度。</span>
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full mt-2 md:mt-2.5 mr-3 shrink-0"></span>
                <span><span className="text-white font-medium">积分：</span> 点数领取后自动获得积分。</span>
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full mt-2 md:mt-2.5 mr-3 shrink-0"></span>
                <span><span className="text-white font-medium">会员：</span> 点数领取后自动开通至帐户。</span>
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full mt-2 md:mt-2.5 mr-3 shrink-0"></span>
                <span><span className="text-white font-medium">卡券：</span> 点击领取后将自动添加至帐户。</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Text */}
        <div className="mt-12 md:mt-20 text-center relative z-10">
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
            <p className="text-red-500 font-medium py-4 text-sm md:text-lg px-4">
                「UPC全体员工谨向您表达诚挚的感谢，感谢您在过去一年中的支持与陪伴。」
            </p>
        </div>

      </div>
    </section>
  );
};

export default InfoSection;