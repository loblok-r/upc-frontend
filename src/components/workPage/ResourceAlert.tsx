
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface ResourceAlertProps {
  type: 'computingPower' | 'dailyLimit' | 'memberOnly';
  required?: number;
  current?: number;
}

export const ResourceAlert: React.FC<ResourceAlertProps> = ({ type, required, current }) => {
  const { user } = useAuth();
  
  const getAlertContent = () => {
    switch (type) {
      case 'computingPower':
        return {
          title: '算力不足',
          message: `需要 ${required} 点算力，当前仅剩 ${current} 点`,
          action: '立即充值',
          icon: 'fa-solid fa-bolt'
        };
      case 'dailyLimit':
        return {
          title: '今日使用已达上限',
          message: '免费用户每日使用次数有限，升级会员享无限使用',
          action: '升级会员',
          icon: 'fa-solid fa-crown'
        };
      case 'memberOnly':
        return {
          title: '会员专属功能',
          message: '此功能需要会员权限才能使用',
          action: '升级会员',
          icon: 'fa-solid fa-gem'
        };
    }
  };
  
  const content = getAlertContent();
  
  return (
    <div className="p-4 bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-xl mb-4">
      <div className="flex items-start gap-3">
        <div className="text-red-400 text-lg">
          <i className={content.icon}></i>
        </div>
        <div className="flex-1">
          <h4 className="text-white font-semibold">{content.title}</h4>
          <p className="text-gray-300 text-sm mt-1">{content.message}</p>
          <button className="mt-3 text-sm bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
            {content.action}
          </button>
        </div>
      </div>
    </div>
  );
};