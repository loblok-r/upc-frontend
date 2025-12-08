import React, { useState, useRef, useEffect } from 'react';
import type { User } from '../../types';

import {
   LogOut, ChevronRight, Zap, Award,
   CalendarCheck, LayoutGrid, CreditCard, Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserMenuProps {
   onLogout: () => void;
   user: User; // 
}

export const UserMenu: React.FC<UserMenuProps> = ({ onLogout, user }) => {
   const navigate = useNavigate();
   const [isOpen, setIsOpen] = useState(false);

   //引入 Ref 来存储定时器 ID
   const timeoutRef = useRef<NodeJS.Timeout | null>(null);

   const userData = {
      id: user.id,
      name: user.username,
      avatar: user.avatar || '',
      level: user.displayLevel,
      stats: user.stats || {
        works: 0,
        comments: 0,
        likes: 0,
      },
      exp: user.exp,
      computingPower: user.computingPower,
      maxcomputingPower: user.maxcomputingPower,
      isMember: user.isMember,
   };

   const menuItems = [
      { icon: <CalendarCheck size={16} />, label: "每日签到", onClick: () => navigate('/daily-check-in') },
      { icon: <LayoutGrid size={16} />, label: "我的社区", onClick: () => navigate('/community') },
      { icon: <CreditCard size={16} />, label: "我的卡包", onClick: () => navigate('/wallet') },
      { icon: <Settings size={16} />, label: "设置", onClick: () => { } },
   ];

   // 鼠标移入处理：清除关闭定时器，保持打开
   const handleMouseEnter = () => {
      if (timeoutRef.current) {
         clearTimeout(timeoutRef.current);
      }
      setIsOpen(true);
   };

   // 鼠标移出处理：延迟关闭 (给用户 200ms 的时间移动鼠标跨过间隙)
   const handleMouseLeave = () => {
      timeoutRef.current = setTimeout(() => {
         setIsOpen(false);
      }, 200); // 200ms 的缓冲期，足够从头像移动到菜单
   };

   // 组件卸载时清理定时器，防止内存泄漏
   useEffect(() => {
      return () => {
         if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
   }, []);

   return (
      <div
         className="relative z-50"
         // 将事件绑定到最外层容器
         onMouseEnter={handleMouseEnter}
         onMouseLeave={handleMouseLeave}
      >
         {/* 头像触发区 */}
         <button className="flex items-center gap-3 py-1 focus:outline-none">
            <div className="text-right hidden md:block">
               <div className="text-sm font-semibold text-white leading-tight">{userData.name}</div>


               {/* 根据 isMember 显示不同的用户标签 */}
               {userData.isMember ? (
                  <div className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 rounded inline-block border border-amber-500/20 mt-0.5">
                     PRO USER
                  </div>
               ) : (
                  <div className="text-[10px] text-gray-400 font-bold bg-gray-500/10 px-1.5 rounded inline-block border border-gray-500/20 mt-0.5">
                     FREE USER
                  </div>
               )}
            </div>



            <div className="relative">
               <img
                  src={userData.avatar}
                  alt="Avatar"
                  className={`w-9 h-9 rounded-full border-2 transition-all ${isOpen ? 'border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'border-white/20'}`}
               />
               {/* 在线状态小点 */}
               <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#0f0c29] rounded-full"></div>
            </div>
         </button>

         {/* 2. 下拉菜单 */}
         {isOpen && (
            // 这里保留 mt-2 是为了视觉美观，
            // 但因为有了上面的 handleMouseLeave 延迟逻辑，鼠标跨越这个 2px-8px 的间隙时不会导致菜单关闭
            <div className="absolute right-0 top-full mt-2 w-72 bg-[#1a1b26] border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">

               {/* 背景装饰 */}
               <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-indigo-900/40 to-transparent pointer-events-none" />

               {/* A. 头部信息 */}
               <div className="p-5 relative">
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 to-purple-500">
                           <img src={userData.avatar} className="w-full h-full rounded-full border-2 border-[#1a1b26] object-cover" />
                        </div>
                        <div>
                           <h3 className="text-white font-bold">{userData.name}</h3>
                           <div className="flex items-center gap-2 text-xs text-gray-400">
                              UID: 8888{userData.id}
                           </div>
                        </div>
                     </div>
                     <div className="flex flex-col items-end">
                        <div className="text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">
                           {userData.level}
                        </div>
                     </div>
                  </div>

                  {/* B. 进度条区域 */}
                  <div className="space-y-4">
                     {/* 经验条 */}
                     <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                           <span className="text-gray-400 flex items-center gap-1"><Award size={12} /> 经验值</span>
                           <span className="text-white font-mono">{userData.exp}/100</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                           <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${userData.exp}%` }}></div>
                        </div>
                     </div>

                     {/* 算力条 */}
                     <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                           <span className="text-gray-400 flex items-center gap-1"><Zap size={12} className="text-amber-400" /> 算力点数</span>
                           <span className="text-amber-400 font-mono font-bold">{userData.computingPower}</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                           <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: `${(userData.computingPower || 0) / userData.maxcomputingPower * 100}%` }}></div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="h-px bg-white/5 mx-4"></div>

               {/* C. 菜单选项 */}
               <div className="p-2 space-y-1">
                  {menuItems.map((item, idx) => (
                     <button
                        key={idx}
                        onClick={item.onClick}
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-colors group text-sm"
                     >
                        <div className="flex items-center gap-3">
                           <span className="text-gray-500 group-hover:text-indigo-400 transition-colors">{item.icon}</span>
                           <span>{item.label}</span>
                        </div>
                        <ChevronRight size={14} className="text-gray-600 group-hover:text-gray-400 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                     </button>
                  ))}
               </div>

               <div className="h-px bg-white/5 mx-4"></div>

               {/* D. 底部操作 */}
               <div className="p-2">
                  <button
                     onClick={onLogout}
                     className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors text-sm"
                  >
                     <LogOut size={16} />
                     <span>退出登录</span>
                  </button>
               </div>
            </div>
         )}
      </div>
   );
};