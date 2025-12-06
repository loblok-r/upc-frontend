import React from 'react';
import { WalletTabId } from '../types';
import { MOCK_TRANSACTIONS, SIDEBAR_ITEMS } from '../data/constants';
import { Coins, Filter, ChevronDown, Archive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WalletContentProps {
  activeTab: WalletTabId;
}

export const WalletContent: React.FC<WalletContentProps> = ({ activeTab }) => {

  const navigate = useNavigate();

  // Handle "去使用" button click
  const handleUseClick = () => {
    navigate('/mall');
  };
  
  // If active tab is Points, render the list (Image 2)
  if (activeTab === WalletTabId.POINTS) {
    return (
      <div className="relative z-10 h-full flex flex-col animate-fade-in">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-white/5 pb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            积分 <span className="text-sm font-normal text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">当前积分</span>
          </h2>
          <button 
            onClick={handleUseClick}
          className="bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold px-6 py-2 rounded-lg shadow-lg shadow-amber-500/20 transition-all">
            去使用
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex bg-black/30 rounded-lg p-1 border border-white/5">
            {['全部', '已消耗', '已过期'].map((filter, idx) => (
              <button
                key={filter}
                className={`px-4 py-1.5 text-sm rounded-md transition-all ${
                  idx === 0
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 text-slate-400 text-sm cursor-pointer hover:text-white transition-colors">
            <Filter className="w-4 h-4" />
            <span>筛选</span>
            <ChevronDown className="w-3 h-3" />
          </div>
        </div>

        {/* List Header */}
        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-slate-500 uppercase tracking-wider mb-4 px-4">
          <div className="col-span-4 md:col-span-3">积分 <span className="text-amber-500/80 bg-amber-500/10 px-1 rounded text-[10px] ml-1">流水</span></div>
          <div className="col-span-4 md:col-span-6">来源</div>
          <div className="col-span-4 md:col-span-3 text-right">时间</div>
        </div>

        {/* List Items */}
        <div className="space-y-2">
          {MOCK_TRANSACTIONS.map((tx) => (
            <div 
              key={tx.id}
              className="grid grid-cols-12 gap-4 items-center bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-xl p-4 transition-all duration-200 group"
            >
              <div className="col-span-4 md:col-span-3 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    tx.type === 'earn' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-700/50 text-slate-400'
                }`}>
                    <Coins className="w-4 h-4" />
                </div>
                <span className={`font-mono font-bold ${
                    tx.type === 'spend' || tx.type === 'expire' ? 'text-slate-400' : 'text-amber-400'
                }`}>
                    {tx.type === 'earn' ? `积分+${tx.amount}` : `积分${tx.amount}`}
                </span>
              </div>
              
              <div className="col-span-4 md:col-span-6 text-sm text-slate-300 group-hover:text-white transition-colors">
                {tx.source}
              </div>
              
              <div className="col-span-4 md:col-span-3 text-right text-sm text-slate-500 font-mono">
                {tx.date}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Generic Empty State for other tabs (Image 3)
  return (
    <div className="relative z-10 h-full flex flex-col animate-fade-in">
        <div className="border-b border-white/5 pb-6 mb-12">
            <h2 className="text-2xl font-bold text-white capitalize">
              {SIDEBAR_ITEMS.find(i => i.id === activeTab)?.label}
            </h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]" style={{ animationDelay: '0.1s' }}>
            <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden">
                <Archive className="w-8 h-8 text-slate-600" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12 opacity-50"></div>
            </div>
            <p className="text-slate-400 text-sm">空空如也，还没有奖励哦~</p>
        </div>
    </div>
  );
};