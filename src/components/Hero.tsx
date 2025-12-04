import React from 'react';
import { useNavigate } from 'react-router-dom'; // 导入导航钩子
import { Typewriter } from './Typewriter';

export const Hero: React.FC = () => {

  const navigate = useNavigate(); // 创建导航实例

  const handleCreateClick = () => {
    navigate('/work'); // 导航到工作页面
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[#020617]">
        {/* Deep Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#020617] opacity-80"></div>
        
        {/* Radial Glows for Space Vibe */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]"></div>
        
        {/* Planet-like shadow element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[600px] md:h-[600px] rounded-full bg-gradient-to-br from-black to-transparent opacity-90 blur-2xl z-0 pointer-events-none"></div>
        
        {/* Stars (Static simulated using radial gradients for performance) */}
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-1/3 left-3/4 w-1.5 h-1.5 bg-blue-200 rounded-full opacity-40"></div>
        <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-purple-200 rounded-full opacity-50 animate-pulse"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center mt-16">
        
        {/* Main large text in background layer opacity */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full select-none pointer-events-none">
             <h1 className="text-[12vw] font-black text-white/5 leading-none tracking-tighter">
                INTELLIGENCE
             </h1>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl md:text-2xl font-light text-blue-300 tracking-[0.2em] uppercase mb-4 animate-fade-in-up">
            Universal Picture Composer
          </h2>

          <div className="min-h-[120px] md:min-h-[160px] flex items-center justify-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight drop-shadow-2xl">
              <span className="block mb-2 md:inline md:mb-0">人工智能技术 融入</span>
              <br className="md:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 ml-0 md:ml-4">
                <Typewriter 
                  phrases={[
                    "创意生产",
                    "娱乐互动"
                  ]} 
                  typingSpeed={150}
                  deletingSpeed={80}
                  pauseDuration={3000}
                />
              </span>
            </h1>
          </div>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
             你聪明靠谱的设计助理。利用先进的生成式AI模型，将想象力瞬间转化为视觉杰作。
             <br/>
             <span className="text-sm opacity-60">Powered by Gemini 2.5 Flash & Pro Models</span>
          </p>

          <div className="relative group inline-block">
             <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-500 group-hover:duration-200"></div>
             <button className="relative px-12 py-4 bg-[#0a0f25] rounded-full leading-none flex items-center gap-3 border border-white/10 hover:bg-[#121835] transition-colors duration-300"
                onClick={handleCreateClick} // 添加点击事件
                >
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                  立即创作
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-blue-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
             </button>
          </div>
        </div>
      </div>
      
      {/* Decorative planet/orb at bottom right like reference */}
      <div className="absolute bottom-[10%] right-[10%] w-16 h-16 rounded-full bg-slate-700 shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.8)] opacity-60"></div>
      <div className="absolute bottom-[20%] left-[5%] w-8 h-8 rounded-full bg-slate-800 shadow-[inset_-4px_-4px_10px_rgba(0,0,0,0.8)] opacity-40"></div>
    </div>
  );
};