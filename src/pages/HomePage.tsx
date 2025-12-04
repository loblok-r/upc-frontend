import React from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/home/Hero';

function HomePage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden selection:bg-purple-500 selection:text-white">
      <Navbar />
      <Hero />
      
      {/* Placeholder for future sections mentioned in prompt context */}
      <section id="inspiration" className="py-20 bg-[#050a1f] border-t border-white/5">
         <div className="container mx-auto px-6 text-center">
            <h3 className="text-2xl font-bold text-gray-300 mb-8">灵感画廊</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
               {[1,2,3,4].map(i => (
                  <div key={i} className="aspect-square bg-white/5 rounded-lg border border-white/5 hover:border-blue-500/50 transition-colors flex items-center justify-center">
                    <span className="text-xs text-gray-600">Sample Art {i}</span>
                  </div>
               ))}
            </div>
         </div>
      </section>
    </div>
  );
}

export default HomePage;
