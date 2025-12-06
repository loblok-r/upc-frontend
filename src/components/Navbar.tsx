import React, { useState, useEffect } from 'react';
import type { NavItem } from '../types';
import { Logo } from './home/Logo';
import { useNavigate, useLocation } from 'react-router-dom'; 

const navItems: NavItem[] = [
  { label: '首页', href: '/' },
  { label: '灵感', href: '#inspiration' },
  { label: '社区', href: '#community' },
  { label: '商城', href: '/mall' },
  { label: '2025抽奖活动', href: '/lottery' },
  { label: '关于', href: '/upc' },
];

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 
  const [scrolled, setScrolled] = useState(false);

  //判断是否是“关于”页面 
  const isLightPage = location.pathname === '/upc';

  const handleCreateClick = () => {
    navigate('/work');
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 动态样式逻辑
  const getNavbarBgClass = () => {
    if (scrolled) {

      return isLightPage
        ? 'bg-white/80 backdrop-blur-md border-gray-200 py-3 shadow-sm'
        : 'bg-[#050a1f]/80 backdrop-blur-md border-white/10 py-3';
    }
    return 'bg-transparent border-transparent py-6';
  };

  // 文字颜色逻辑
  const getTextColorClass = () => {
    if (isLightPage) {
      return 'text-gray-600 hover:text-black';
    }
    return 'text-gray-300 hover:text-white';
  };

  const getLangBtnClass = () => {
    if (isLightPage) {
      return 'text-gray-500 hover:text-black';
    }
    return 'text-gray-400 hover:text-white';
  };

  const textColorClass = getTextColorClass();
  const navbarBgClass = getNavbarBgClass();
  const langBtnClass = getLangBtnClass();

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${navbarBgClass}`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
 
        <div onClick={() => navigate('/')} className="cursor-pointer">
          <Logo isDark={isLightPage} />
        </div>

        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 hover:bg-black/5 ${textColorClass}`}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <button className={`hidden lg:block text-sm font-medium transition-colors ${langBtnClass}`}>
            中文
          </button>
          <button
            onClick={handleCreateClick}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-lg shadow-blue-500/30 hover:shadow-blue-400/50 transition-all duration-300 transform hover:-translate-y-0.5">
            免费体验
          </button>
        </div>
      </div>
    </nav>
  );
};