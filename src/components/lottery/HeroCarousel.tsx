import React from 'react';
import { PRODUCTS } from '../../data/constants';
import { useNavigate } from 'react-router-dom'; 
import * as Icons from 'lucide-react';

const HeroCarousel: React.FC = () => {

  const navigate = useNavigate();
  // Ensure we have enough items for a smooth loop on wide screens
  const displayProducts = PRODUCTS;

   const handleLoginClick = () => {
    navigate('/login');
  };

  const ProductCard = ({ product }: { product: any }) => {
    const IconComponent = (Icons as any)[product.icon] || Icons.Box;
    const colorParts = product.color.split('-');
    // Safer color extraction
    const colorName = colorParts.length > 1 ? colorParts[1] : 'blue'; 

    return (
      <div 
        className="w-[280px] md:w-[320px] h-[380px] rounded-2xl relative group/card transition-all duration-300 hover:-translate-y-2 mx-4 flex-shrink-0 cursor-pointer"
      >
        {/* Card Background & Border */}
        <div className="absolute inset-0 bg-brand-card rounded-2xl border border-white/5 group-hover/card:border-white/20 transition-all overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${colorName}-500 to-transparent opacity-50 group-hover/card:opacity-100 transition-opacity`}></div>
          
          {/* Content */}
          <div className="h-full flex flex-col items-center justify-center p-6 text-center z-10 relative">
            {/* Icon Glow */}
            <div className={`w-24 h-24 rounded-full bg-black/40 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover/card:shadow-[0_0_40px_${colorName === 'white' ? 'rgba(255,255,255,0.2)' : `rgba(var(--color-${colorName}-500),0.3)`}] transition-shadow duration-500`}>
              <IconComponent className={`w-12 h-12 ${product.color} drop-shadow-lg`} />
            </div>

            <h3 className="text-2xl font-bold text-white mb-3">{product.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              {product.subtitle}
            </p>

            {product.badge && (
               <span className="absolute top-4 right-4 bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded border border-red-500/30">
                 {product.badge}
               </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full py-12 md:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-brand-dark opacity-90 -z-10"></div>
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand-glow/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="container-fluid w-full relative">
        
        {/* Infinite Carousel Container */}
        <div className="relative w-full overflow-hidden group">
            {/* Gradient Masks */}
            <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-r from-brand-dark to-transparent z-20 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-l from-brand-dark to-transparent z-20 pointer-events-none"></div>

            <div className="flex">
                {/* First Set */}
                <div className="flex animate-marquee-slow group-hover:pause min-w-full shrink-0 items-center justify-around">
                    {displayProducts.map((product, idx) => (
                        <ProductCard key={`p1-${idx}`} product={product} />
                    ))}
                </div>
                {/* Second Set */}
                <div className="flex animate-marquee-slow group-hover:pause min-w-full shrink-0 items-center justify-around">
                    {displayProducts.map((product, idx) => (
                        <ProductCard key={`p2-${idx}`} product={product} />
                    ))}
                </div>
            </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center mt-12 relative z-20">
            <button 
                 onClick={handleLoginClick}
                className="relative group px-10 py-3.5 rounded-full overflow-hidden transition-transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-yellow-400 opacity-80 group-hover:opacity-100 transition-opacity blur-sm"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-300 opacity-100 rounded-full border border-yellow-200/50 shadow-[0_0_20px_rgba(234,179,8,0.5)]"></div>
                <span className="relative text-brand-dark font-bold text-lg tracking-wide">请先登录</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;