import React from 'react';
// import { Navbar } from '../components/Navbar';
import TopTicker from '../components/lottery/TopTicker';
import HeroCarousel from '../components/lottery/HeroCarousel';
import InfoSection from '../components/lottery/InfoSection';
import ChatWidget from '../components/ChatWidget';

const LotteryPage: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col font-sans text-slate-200 bg-brand-dark">
      {/* Global Background Elements */}
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none z-0"></div>
      
      {/* Top Banner & Navigation */}
      <header className="relative z-50">
         {/* <Navbar /> */}
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex flex-col">

        {/* Hero Section with Carousel —— 下移 */}
        <div className="mt-32">
           <TopTicker />
          <HeroCarousel />
        </div>
        
        {/* Info Section —— 再往下 */}
        <div className="mt-10">
          <InfoSection />
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-slate-600 text-sm relative z-10 bg-black/40">
        <div className="container mx-auto">
          &copy; {new Date().getFullYear()} Mitce. All rights reserved.
        </div>
      </footer>

      {/* Floating Chat Widget */}
      {/* <ChatWidget /> */}
    </div>
  );
};

export default LotteryPage;
