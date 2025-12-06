import React from 'react';
import { ChevronRight, FileText, Truck, PackageOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';



export const ExchangeRecordPage: React.FC = () => {
  const navigate = useNavigate(); 
  return (
    <div className="min-h-screen w-full bg-[#0B0F19] text-slate-200 p-4 md:p-8 font-sans flex flex-col">
      

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-2">
        
        <div className="flex items-center gap-2 text-sm">
          <span 
          onClick={() => navigate('/mall')}
          className="text-slate-400 hover:text-white transition-colors cursor-pointer">积分商城</span>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <span className="text-white font-medium">兑换记录</span>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 hover:text-orange-300 hover:border-orange-500/40 transition-all text-sm font-medium group">
            <FileText className="w-4 h-4" />
            <span>前往开发票</span>
          </button>
          
          <button className="flex items-center gap-2 px-5 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 hover:text-orange-300 hover:border-orange-500/40 transition-all text-sm font-medium group">
            <Truck className="w-4 h-4" />
            <span>查看物流</span>
          </button>
        </div>
      </header>

      
      <main className="flex-1 bg-[#111827] rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden flex flex-col">
        
       
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none" 
          style={{ 
             backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
          }} 
        />

        
        <div className="flex-1 flex flex-col items-center justify-center p-12 z-10 animate-fade-in">
          
        
          <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-inner">
             <PackageOpen className="w-10 h-10 text-slate-600" strokeWidth={1.5} />
          </div>
          
    
          <h3 className="text-slate-400 text-lg font-medium tracking-wide">暂无兑换记录</h3>
          <p className="text-slate-600 text-sm mt-2">您还没有使用积分兑换过任何商品</p>
          
      
          {/* <button 
          onClick={() => navigate('/mall')}
          className="mt-8 px-8 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-cyan-900/20 transition-all hover:scale-105">
            去商城逛逛
          </button> */}
        </div>

      </main>
    </div>
  );
};

export default ExchangeRecordPage;