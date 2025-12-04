import React from 'react';

export const TechBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-900">
      {/* Deep gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950"></div>
      
      {/* Abstract grid overlay */}
      <div 
        className="absolute inset-0 opacity-20" 
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      ></div>

      {/* Glowing orbs/blurred spots for depth */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600 blur-[120px] opacity-20 animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600 blur-[120px] opacity-20 animate-pulse-slow delay-1000"></div>
      <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] rounded-full bg-cyan-500 blur-[100px] opacity-10 animate-float"></div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-slate-900 opacity-80 pointer-events-none"></div>
    </div>
  );
};