import React, { useState, useEffect } from 'react';
import type { NavItem } from '../types';
import { Logo } from './Logo';

const navItems: NavItem[] = [
  { label: '首页', href: '#' },
  { label: '灵感', href: '#inspiration' },
  { label: '社区', href: '#community' },
  { label: '商城', href: '#store' },
  { label: '关于', href: '#about' },
];

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${
        scrolled
          ? 'bg-[#050a1f]/80 backdrop-blur-md border-white/10 py-3'
          : 'bg-transparent border-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Left: AI Generated Logo */}
        <Logo />

        {/* Center: Navigation Links */}
        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="px-5 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-full transition-all duration-200"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Right: CTA & Lang */}
        <div className="flex items-center gap-6">
          <button className="hidden lg:block text-gray-400 hover:text-white text-sm font-medium transition-colors">
            中文
          </button>
          <button 
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-lg shadow-blue-500/30 hover:shadow-blue-400/50 transition-all duration-300 transform hover:-translate-y-0.5">
            免费体验
          </button>
        </div>
      </div>
    </nav>
  );
};