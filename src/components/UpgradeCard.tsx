import React from 'react';

interface UpgradeCardProps {
  openUpgradeModal: () => void;
}

const UpgradeCard: React.FC<UpgradeCardProps> = ({ openUpgradeModal }) => {
  return (
    /* 
      Wrapper Div: 
      - Bridges the gap using pl-4 (instead of margin) to maintain 'group-hover' state when moving mouse across.
      - Handles positioning and transition animations.
    */
    <div className="absolute left-full bottom-0 mb-4 pl-4 z-50 transform transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-[-10px] pointer-events-none group-hover:pointer-events-auto">
      <div className="w-80 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="bg-slate-800 p-2 rounded-lg w-[48%]">
            <h3 className="text-lg font-bold text-gray-300">免费版</h3>
            <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded">受限</span>
            
            <ul className="mt-4 space-y-3 text-sm text-gray-400">
              <li className="flex justify-between">
                <span>对话模式</span>
                <span className="text-green-400">✓</span>
              </li>
              <li className="flex justify-between">
                <span>智能任务</span>
                <span className="text-red-400">0/2</span>
              </li>
              <li className="flex justify-between">
                <span>AI 演示文稿</span>
                <span className="text-red-400">0/2</span>
              </li>
               <li className="flex justify-between">
                <span>AI 绘图</span>
                <span className="text-red-400">0/5</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-purple-500/30 p-2 rounded-lg w-[48%] relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-orange-500 text-[10px] text-white px-2 py-0.5 rounded-bl-lg font-bold">
              推荐
            </div>
            <h3 className="text-lg font-bold text-white">专业版</h3>
             <span className="text-xs text-orange-200 bg-orange-500/20 px-2 py-0.5 rounded">无限</span>
            
            <ul className="mt-4 space-y-3 text-sm text-white font-medium">
               <li className="flex justify-between">
                <span>对话模式</span>
                <span className="text-orange-400">✓</span>
              </li>
              <li className="flex justify-between">
                <span>智能任务</span>
                <span className="text-orange-400">0/50</span>
              </li>
              <li className="flex justify-between">
                <span>AI 演示文稿</span>
                <span className="text-orange-400">✓</span>
              </li>
               <li className="flex justify-between">
                <span>AI 绘图</span>
                <span className="text-orange-400">0/100</span>
              </li>
            </ul>
          </div>
        </div>
        
        <button 
        onClick={openUpgradeModal} 
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-orange-500/20 flex items-center justify-center gap-2">
          <i className="fa-solid fa-gem"></i>
          立即升级 Pro
        </button>
      </div>
    </div>
  );
};

export default UpgradeCard;