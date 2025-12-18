import React from 'react';
import TopTicker from '../components/lottery/TopTicker';
import HeroCarousel from '../components/lottery/HeroCarousel';
import InfoSection from '../components/lottery/InfoSection';
import ChatWidget from '../components/ChatWidget';

const LotteryPage: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col font-sans text-slate-200">
      <div className="fixed inset-0 -z-20">
 
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
        
 
        <div className="absolute inset-0 overflow-hidden">
   
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '3s'}}></div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        </div>
      </div>


      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none z-0"></div>
      

      <header className="relative z-50">
      </header>


      <main className="relative z-10 flex-grow flex flex-col">

        <div className="mt-32">
           <TopTicker />
          <HeroCarousel />
        </div>
        
 
        <div className="mt-10">
          <InfoSection />
        </div>
      </main>


      <footer className="w-full py-8 text-center text-slate-600 text-sm relative z-10 bg-black/40">
        <div className="container mx-auto">
          &copy; {new Date().getFullYear()} Upc. All rights reserved.
        </div>
      </footer>

    </div>
  );
};

export default LotteryPage;
