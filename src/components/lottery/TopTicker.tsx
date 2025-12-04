import React from 'react';
import { WINNERS } from '../../data/constants';
import { Bell } from 'lucide-react';

const TopTicker: React.FC = () => {
  return (
    <div className="w-full bg-slate-900/80 border-b border-white/5 backdrop-blur-md h-10 flex items-center overflow-hidden relative z-50">
      <div className="container mx-auto px-4 flex items-center h-full">
        <div className="flex items-center text-xs text-slate-400 font-medium mr-6 shrink-0 z-10 bg-slate-900/80 pr-4">
          <Bell className="w-3.5 h-3.5 mr-2 text-brand-accent" />
          <span>更多付费权益</span>
        </div>
        
        {/* Infinite Scrolling Area */}
        <div className="flex-1 overflow-hidden relative h-full flex items-center mask-image-linear-gradient">
           <div className="flex w-full overflow-hidden group">
              {/* First Copy */}
              <div className="flex items-center space-x-8 animate-marquee whitespace-nowrap px-4 min-w-full shrink-0">
                {WINNERS.map((winner, idx) => (
                  <div key={`w1-${idx}`} className="flex items-center space-x-2 text-xs text-slate-300">
                    <span className="bg-white/10 px-1.5 py-0.5 rounded text-slate-400">{winner.username}</span>
                    <span className="text-red-400 font-bold">{winner.prize}</span>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-500">{winner.time}</span>
                  </div>
                ))}
              </div>
              {/* Second Copy for Seamless Loop */}
              <div className="flex items-center space-x-8 animate-marquee whitespace-nowrap px-4 min-w-full shrink-0">
                {WINNERS.map((winner, idx) => (
                  <div key={`w2-${idx}`} className="flex items-center space-x-2 text-xs text-slate-300">
                    <span className="bg-white/10 px-1.5 py-0.5 rounded text-slate-400">{winner.username}</span>
                    <span className="text-red-400 font-bold">{winner.prize}</span>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-500">{winner.time}</span>
                  </div>
                ))}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default TopTicker;