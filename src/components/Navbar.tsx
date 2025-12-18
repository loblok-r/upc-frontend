import React, { useState, useEffect } from 'react';
import type { NavItem } from '../types';
import { Logo } from './home/Logo';
import { useNavigate, useLocation } from 'react-router-dom';
// 1. 引入 Menu 和 X 图标
import { Menu, X } from 'lucide-react';

const navItems: NavItem[] = [
  { label: '首页', href: '/' },
  { label: '灵感', href: '#inspiration' },
  { label: '社区', href: '/community' },
  { label: '商城', href: '/mall' },
  { label: '2025抽奖活动', href: '/lottery' },
  { label: '关于', href: '/upc' },
];

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  // 2. 新增状态来控制移动菜单的显示/隐藏
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isLightPage = location.pathname === '/upc';

  const handleCreateClick = () => {
    navigate('/work');
  };

  const handleNavClick = (href: string) => {
    // 点击任何链接后都关闭移动菜单
    setIsMobileMenuOpen(false); 
    
    if (href.startsWith('#')) {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(href.substring(1));
          element?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const element = document.getElementById(href.substring(1));
        element?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 监听窗口大小变化，如果从手机放大到桌面，自动关闭菜单
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // 768px 是 Tailwind 'md' 断点
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getNavbarBgClass = () => {
    // 强制给移动菜单打开时一个背景色
    if (isMobileMenuOpen) {
      return isLightPage
        ? 'bg-white/95 backdrop-blur-md border-gray-200 py-3 shadow-sm'
        : 'bg-[#050a1f]/95 backdrop-blur-md border-white/10 py-3';
    }
    if (scrolled) {
      return isLightPage
        ? 'bg-white/80 backdrop-blur-md border-gray-200 py-3 shadow-sm'
        : 'bg-[#050a1f]/80 backdrop-blur-md border-white/10 py-3';
    }
    return 'bg-transparent border-transparent py-6';
  };

  const getTextColorClass = () => {
    if (isLightPage) return 'text-gray-600 hover:text-black';
    return 'text-gray-300 hover:text-white';
  };

  const textColorClass = getTextColorClass();
  const navbarBgClass = getNavbarBgClass();

  return (
    // 添加 relative 以便移动菜单定位
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${navbarBgClass}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
 
        <div onClick={() => navigate('/')} className="cursor-pointer">
          <Logo isDark={isLightPage} />
        </div>

        {/* 3. 桌面端导航链接: md:flex (中等屏幕以上显示) */}
        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.href)}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 hover:bg-black/5 ${textColorClass}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          {/* 4. 免费体验按钮: 桌面端显示 */}
          <button
            onClick={handleCreateClick}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-lg shadow-blue-500/30 hover:shadow-blue-400/50 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            免费体验
          </button>
          
          {/* 5. 汉堡菜单按钮: md:hidden (只在手机端显示) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${textColorClass}`}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* 6. 移动端菜单 (展开时显示) */}
      {isMobileMenuOpen && (
        <div className="md:hidden w-full absolute top-full left-0 animate-in fade-in slide-in-from-top-2 duration-300">
           {/* 使用与导航栏一致的背景，确保无缝衔接 */}
           <div className={`pt-2 pb-6 px-4 space-y-2 border-t ${isLightPage ? 'border-gray-200' : 'border-white/10'}`}>
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.href)}
                  className={`block w-full text-left px-4 py-3 text-base font-semibold rounded-lg transition-colors ${textColorClass} ${isLightPage ? 'hover:bg-gray-100' : 'hover:bg-white/5'}`}
                >
                  {item.label}
                </button>
              ))}
           </div>
        </div>
      )}
    </nav>
  );
};