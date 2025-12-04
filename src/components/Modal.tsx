import React, { useState } from 'react';
import { X, Check, Zap, Sparkles, LayoutTemplate, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 
import { CountdownTimer } from './CountdownTimer';
import type { PricingPlan } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PLANS: PricingPlan[] = [
  {
    id: 'week',
    name: '7天体验卡',
    price: '￥5.99',
    billingText: '7天后自动续费 (￥19.99/月)',
  },
  {
    id: 'month',
    name: '月度会员',
    price: '￥19.99',
    originalPrice: '￥29.99',
    billingText: '下个月自动续费',
    badge: '省 34%',
  },
  {
    id: 'year',
    name: '年度会员',
    price: '￥7.90',
    originalPrice: '￥19.99',
    billingText: '按年付费 (每月 ￥7.90)',
    badge: '省 61%',
    isPopular: true,
  },
];

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('month');

  const handleLoginClick = () => {
    // Find the selected plan
    const selectedPlan = PLANS.find(plan => plan.id === selectedPlanId);
    
    // Navigate to pay-info page with the selected plan data
    if (selectedPlan) {
      navigate('/pay-info', { 
        state: { 
          selectedPlan: {
             planName: selectedPlan.name,
          price: parseFloat(selectedPlan.price.replace('￥', '')), // 确保只提取数字
          originalPrice: selectedPlan.originalPrice ? 
            parseFloat(selectedPlan.originalPrice.replace('￥', '')) : undefined,
          currency: '￥',
          billingText: selectedPlan.billingText, // 传递完整的 billingText
          period: getPeriodFromBillingText(selectedPlan.billingText), // 提取周期
          badge: selectedPlan.badge,
          isPopular: selectedPlan.isPopular,
          id: selectedPlan.id// Extract period from billing text
          }
        } 
      });
    } else {
      // Fallback to default plan if somehow none is selected
      navigate('/pay-info');
    }
  };

  // 添加辅助函数来从 billingText 中提取周期
function getPeriodFromBillingText(billingText: string): string {
  if (billingText.includes('年')) return '年';
  if (billingText.includes('月')) return '月';
  if (billingText.includes('天')) return '天';
  return '月'; // 默认
}

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-[#0B0F19] rounded-2xl shadow-[0_0_50px_-12px_rgba(79,70,229,0.5)] border border-slate-700/50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[200px] -left-[200px] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]" />
          <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-[30%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[90px]" />
          
          {/* Subtle Grid overlay inside modal */}
          <div className="absolute inset-0 micro-grid opacity-30 mix-blend-overlay" />
        </div>

        {/* Header Bar - Gradient */}
        <div className="relative z-10 w-full bg-gradient-to-r from-orange-100 via-orange-50 to-orange-100 dark:from-orange-900/40 dark:via-amber-900/20 dark:to-orange-900/40 border-b border-orange-500/20 py-3 px-6 flex flex-col sm:flex-row items-center justify-center sm:space-x-4 text-center">
            <span className="flex items-center text-orange-400 font-semibold mb-2 sm:mb-0">
               <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
               限时优惠
            </span>
            <CountdownTimer />
            
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col lg:flex-row p-6 lg:p-10 gap-8 lg:gap-12">
          
          {/* Left Column: Value Proposition */}
          <div className="flex-1 flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-full px-3 py-1">
                 <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="text-xs font-medium text-indigo-300">Loblok UPC Pro</span>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
                  黑色星期五特惠
                </span>
                <br />
                <span className="text-2xl lg:text-3xl font-medium text-slate-300 mt-2 block">
                  立省 <span className="text-orange-500 font-bold text-4xl lg:text-5xl mx-1">61%</span>
                </span>
              </h2>
              <p className="text-slate-400 text-lg">
                全能 AI 工作台，让每个人都成为专家。
              </p>
            </div>

            <div className="space-y-6">
              {/* Feature 1 */}
              <div className="flex items-start space-x-4 group">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500/20 group-hover:scale-110 transition-all duration-300">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">一体化 AI 生产力工具</h3>
                  <p className="text-slate-400 text-sm mt-1">集成 10+ 种 AI 功能，一个平台省去数百元的订阅费。</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start space-x-4 group">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 group-hover:bg-purple-500/20 group-hover:scale-110 transition-all duration-300">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">解锁高级 Agent 模式</h3>
                  <p className="text-slate-400 text-sm mt-1">您的 24/7 智能助手，自主规划并完成复杂工作任务。</p>
                </div>
              </div>

               {/* Feature 3 */}
               <div className="flex items-start space-x-4 group">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-300">
                  <LayoutTemplate className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">一键 AI 演示文稿生成</h3>
                  <p className="text-slate-400 text-sm mt-1">从简单的提示词到精美的幻灯片，内置当下流行的设计模板。</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing Selection */}
          <div className="flex-1 max-w-md w-full mx-auto lg:mx-0">
             <div className="flex flex-col space-y-4">
                {PLANS.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  return (
                    <div 
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`
                        relative rounded-xl p-4 cursor-pointer transition-all duration-200 border-2
                        ${isSelected 
                          ? 'bg-slate-800/80 border-orange-500 shadow-lg shadow-orange-500/10' 
                          : 'bg-slate-900/40 border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-600'}
                      `}
                    >
                      {/* Popular Badge */}
                      {plan.isPopular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                          最受欢迎
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                           <div className="flex items-center space-x-2">
                             <h4 className={`font-semibold text-lg ${isSelected ? 'text-white' : 'text-slate-300'}`}>{plan.name}</h4>
                             {plan.badge && (
                               <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-2 py-0.5 rounded border border-orange-500/20">
                                 {plan.badge}
                               </span>
                             )}
                           </div>
                           <p className="text-xs text-slate-500 mt-1">{plan.billingText}</p>
                        </div>
                        
                        <div className="text-right">
                           <div className="flex flex-col items-end">
                              <span className={`text-2xl font-bold ${isSelected ? 'text-orange-400' : 'text-slate-200'}`}>
                                {plan.price}<span className="text-sm font-normal text-slate-500">/月</span>
                              </span>
                              {plan.originalPrice && (
                                <span className="text-sm text-slate-500 line-through decoration-slate-500">
                                  {plan.originalPrice}
                                </span>
                              )}
                           </div>
                        </div>
                      </div>

                      {/* Selection Circle Indicator */}
                      <div className={`absolute top-1/2 -translate-y-1/2 -left-3 lg:-left-4 w-6 h-6 lg:w-8 lg:h-8 rounded-full border-2 flex items-center justify-center bg-[#0B0F19] transition-colors
                        ${isSelected ? 'border-orange-500 text-orange-500' : 'border-slate-600 text-transparent'}
                      `}>
                        <div className={`w-3 h-3 lg:w-4 lg:h-4 rounded-full ${isSelected ? 'bg-orange-500' : ''}`} />
                      </div>
                    </div>
                  );
                })}
             </div>

             {/* Action Button */}
             <div className="mt-8 space-y-4">
                <button 
                 onClick={handleLoginClick}
                className="relative w-full group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-200"></div>
                  <div className="relative w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-4 rounded-xl shadow-xl flex items-center justify-center space-x-2 transition-all active:scale-[0.98]">
                    <span>立即升级解锁</span>
                    <Sparkles className="w-5 h-5 fill-white/20" />
                  </div>
                </button>
                <p className="text-center text-slate-500 text-xs">
                  可随时取消订阅。7天无理由退款保证。
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};