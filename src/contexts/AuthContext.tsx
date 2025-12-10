// contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import type { User } from '../types';
import {  AppMode } from '../types';
import api from '../utils/api';



// 后端响应类型定义
interface ApiUserResources {
  dailyUsage?: DailyUsage;
  computingPower?: number;
  maxComputingPower?: number;
}

// 新增：资源相关接口
interface DailyUsage {
  textChat: number;        // 文字对话使用次数
  aiDrawing: number;       // AI绘图使用次数
  lastResetDate: string;   // 最后重置日期 (YYYY-MM-DD)
}

interface UserResources {
  dailyUsage: DailyUsage;
  computingPower: number;
  maxComputingPower: number;
}

interface AuthContextType {
  // 原有字段
  isLoggedIn: boolean;
  refreshUser: () => void;
  user: User | null;
  token: string | null;
  login: (token: string, userData: any) => void;
  logout: () => void;
  isLoading: boolean;
  refreshMemberStatus: () => void;
  
  // 新增：资源管理字段
  userResources: UserResources | null;
  refreshResources: () => Promise<void>;
  
  // 新增：权限检查方法
  checkGenerationPermission: (
    mode: AppMode, 
    options?: { estimatedCost?: number; requireHD?: boolean }
  ) => {
    allowed: boolean;
    reason?: string;
    insufficientComputingPower?: number;
    dailyLimitReached?: boolean;
  };
  
  // 新增：计算消耗
  calculateCost: (mode: AppMode, options?: { requireHD?: boolean; wordCount?: number }) => number;
}

// 映射等级到显示等级
const mapLevelToDisplay = (level: string): string => {
  const levelMap: Record<string, string> = {
    'level1': 'LV.1',
    'level2': 'LV.2',
    'level3': 'LV.3',
    'level4': 'LV.4',
    'level5': 'LV.5'
  };
  
  if (levelMap[level]) {
    return levelMap[level];
  }

  if (level.startsWith('level')) {
    const levelNum = level.replace('level', '');
    return `LV.${levelNum}`;
  }

  return level;
};

// 计算会员状态的工具函数
const calculateMemberStatus = (
  permanentMember: boolean,
  memberExpireAt?: number
): {
  isMember: boolean;
  memberDaysLeft?: number;
  memberStatus: 'permanent' | 'active' | 'expired' | 'none';
} => {
  if (permanentMember) {
    return {
      isMember: true,
      memberStatus: 'permanent',
      memberDaysLeft: undefined,
    };
  }

  if (!memberExpireAt) {
    return {
      isMember: false,
      memberStatus: 'none',
    };
  }

  const now = Date.now();
  const expireTime = memberExpireAt * 1000;

  if (now > expireTime) {
    return {
      isMember: false,
      memberStatus: 'expired',
      memberDaysLeft: 0,
    };
  }

  const timeLeft = expireTime - now;
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

  return {
    isMember: true,
    memberStatus: 'active',
    memberDaysLeft: daysLeft,
  };
};

// 默认资源配置
const DEFAULT_RESOURCES: UserResources = {
  dailyUsage: {
    textChat: 0,
    aiDrawing: 0,
    lastResetDate: new Date().toISOString().split('T')[0]
  },
  computingPower: 0,
  maxComputingPower: 1000
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const buildFullUser = (rawUserData: any): User => {
  // 1. 处理 level 字段映射
  const level = (rawUserData.userLevel || 'LEVEL1').toLowerCase();

  // 2. 处理 memberExpireAt：ISO 字符串 → Unix 时间戳（秒）
  let memberExpireAtTimestamp: number | undefined;
  if (rawUserData.memberExpireAt) {
    const date = new Date(rawUserData.memberExpireAt);
    if (!isNaN(date.getTime())) {
      memberExpireAtTimestamp = Math.floor(date.getTime() / 1000);
    }
  }

  // 3. 计算会员状态
  const memberStatus = calculateMemberStatus(
    rawUserData.permanentMember || false,
    memberExpireAtTimestamp
  );

  // 4. 映射等级显示
  const displayLevel = mapLevelToDisplay(level);

  return {
    // 基础字段
    id: String(rawUserData.userId || rawUserData.id || ''),
    username: rawUserData.username || '',
    email: rawUserData.email || '',
    token: rawUserData.token,
    avatar: rawUserData.avatar || '',

    // 数值字段
    exp: rawUserData.exp || 0,
    points: rawUserData.points || 0,
    maxPoints: 1000,
    computingPower: rawUserData.computingPower || 0,
    maxcomputingPower: 1000,

    // 关键修正字段
    level,                 
    displayLevel,
    lotteryCounts: rawUserData.lotteryCounts || 0,
    streakDays: rawUserData.streakDays || 0,
    checkedIn: rawUserData.checkedIn || false, 

    // 会员字段
    permanentMember: rawUserData.permanentMember || false,
    memberExpireAt: memberExpireAtTimestamp,

    // 社区 stats
    stats: rawUserData.stats || { works: 0, followers: 0, likes: 0 },

    // 每日额度
    dailyUsage: rawUserData.dailyUsage || {
      textChatCounts: 0,
      aiDrawingCounts: 0,
    },

    // 计算字段
    ...memberStatus,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userResources, setUserResources] = useState<UserResources | null>(null);
  

  // 初始化：从 token 恢复登录状态，并强制从后端拉取最新用户数据
useEffect(() => {
  const storedToken = localStorage.getItem('auth_token');

  if (storedToken) {
    setToken(storedToken);
    setIsLoggedIn(true);

    // 无论本地有没有缓存，都向后端请求最新用户资料
    api.get('/user/profile')
      .then((rawUserData) => {
        const fullUser = buildFullUser(rawUserData);

        setUser(fullUser);

        // 更新 localStorage（覆盖可能过期的旧缓存）
        const { displayLevel, isMember, memberStatus, memberDaysLeft, ...rawFields } = fullUser;
        localStorage.setItem('auth_user', JSON.stringify(rawFields));

        // 初始化资源状态（基于最新用户数据）
        const initialResources: UserResources = {
          dailyUsage: {
            textChat: 0,
            aiDrawing: 0,
            lastResetDate: new Date().toISOString().split('T')[0],
          },
          computingPower: fullUser.computingPower || 0,
          maxComputingPower: fullUser.maxcomputingPower || 1000,
        };
        setUserResources(initialResources);
        localStorage.setItem('user_resources', JSON.stringify(initialResources));
      })
      .catch((error) => {
        console.error('初始化时获取用户资料失败，可能 token 已失效:', error);
        // 清除无效登录状态
        logout();
      })
      .finally(() => {
        setIsLoading(false);
      });
  } else {
    // 未登录
    setIsLoading(false);
  }
}, []);

  // 检查是否需要重置当日使用（每日0点）
  useEffect(() => {
    const checkAndResetDailyUsage = () => {
      if (!userResources) return;
      
      const today = new Date().toISOString().split('T')[0];
      if (userResources.dailyUsage.lastResetDate !== today) {
        setUserResources(prev => prev ? {
          ...prev,
          dailyUsage: {
            textChat: 0,
            aiDrawing: 0,
            lastResetDate: today
          }
        } : prev);
        
        // 保存到 localStorage
        localStorage.setItem('user_resources', JSON.stringify({
          ...userResources,
          dailyUsage: {
            textChat: 0,
            aiDrawing: 0,
            lastResetDate: today
          }
        }));
      }
    };
    
    checkAndResetDailyUsage();
    const interval = setInterval(checkAndResetDailyUsage, 60000); // 每分钟检查一次
    return () => clearInterval(interval);
  }, [userResources]);

  // 刷新会员状态
  const refreshMemberStatus = () => {
    if (user) {
      const memberStatus = calculateMemberStatus(
        user.permanentMember,
        user.memberExpireAt
      );
      
      setUser({
        ...user,
        ...memberStatus,
      });
    }
  };

  // 实时检查会员过期
  useEffect(() => {
    if (!user || user.memberStatus === 'permanent' || user.memberStatus === 'none') {
      return;
    }
    
    const checkInterval = setInterval(() => {
      const now = Date.now();
      
      if (user.memberStatus === 'active' && user.memberExpireAt) {
        const expireTime = user.memberExpireAt * 1000;
        
        if (now > expireTime) {
          const updatedMemberStatus = calculateMemberStatus(
            user.permanentMember,
            user.memberExpireAt
          );
          
          setUser({
            ...user,
            ...updatedMemberStatus,
          });
        }
      }
    }, 5 * 60 * 1000);
    
    return () => clearInterval(checkInterval);
  }, [user]);

  // 清理存储数据
  const clearStoredData = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('user_resources');
  };

  const login = async (newToken: string, userData: any) => {
    setToken(newToken);
    localStorage.setItem('auth_token', newToken);

    try {
      // api 拦截器已经返回 data
      const profileData = await api.get('/user/profile');
      console.log('✅ profileData:', profileData);

      const newUser = buildFullUser(profileData);
      setUser(newUser);
      setIsLoggedIn(true);

      // 初始化资源状态
      const initialResources: UserResources = {
        dailyUsage: {
          textChat: 0,
          aiDrawing: 0,
          lastResetDate: new Date().toISOString().split('T')[0]
        },
        computingPower: newUser.computingPower || 0,
        maxComputingPower: newUser.maxcomputingPower || 1000
      };
      setUserResources(initialResources);

      // 保存到 localStorage
      const { displayLevel, isMember, memberStatus, memberDaysLeft, ...rawFields } = newUser;
      localStorage.setItem('auth_user', JSON.stringify(rawFields));
      localStorage.setItem('user_resources', JSON.stringify(initialResources));
      
    } catch (error) {
      console.error('❌ 获取用户资料失败:', error);
      logout();
      alert('登录成功，但加载用户信息失败，请重试');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setUserResources(null);
    setIsLoggedIn(false);
    clearStoredData();
  };
  
  const refreshUser = async () => {
    try {
      const rawUserData = await api.get('/user/profile'); 
      const fullUser = buildFullUser(rawUserData);

      setUser(fullUser);
      setIsLoggedIn(true);

      // 更新资源状态中的算力
      if (userResources) {
        setUserResources(prev => prev ? {
          ...prev,
          computingPower: fullUser.computingPower || 0
        } : prev);
        
        // 更新 localStorage
        localStorage.setItem('user_resources', JSON.stringify({
          ...userResources,
          computingPower: fullUser.computingPower || 0
        }));
      }

      // 保存到 localStorage
      const { displayLevel, isMember, memberStatus, memberDaysLeft, ...rawFields } = fullUser;
      localStorage.setItem('auth_user', JSON.stringify(rawFields));
    } catch (err) {
      console.error('Refresh user failed:', err);
    }
  };

  // 刷新资源状态（从后端）
  // 刷新资源状态（从后端）
const refreshResources = async () => {
  if (!isLoggedIn) return;
  
  try {
    // 添加类型断言
    const resourcesData = await api.get('/user/resources') as ApiUserResources;
    
    if (resourcesData) {
      // 构建完整的资源对象
      const updatedResources: UserResources = {
        dailyUsage: resourcesData.dailyUsage || {
          textChat: 0,
          aiDrawing: 0,
          lastResetDate: new Date().toISOString().split('T')[0]
        },
        computingPower: resourcesData.computingPower || user?.computingPower || 0,
        maxComputingPower: resourcesData.maxComputingPower || user?.maxcomputingPower || 1000
      };
      
      setUserResources(updatedResources);
      localStorage.setItem('user_resources', JSON.stringify(updatedResources));
      
      // 同时更新 user 对象的算力
      if (user && resourcesData.computingPower !== undefined) {
        setUser({
          ...user,
          computingPower: resourcesData.computingPower
        });
      }
    }
  } catch (error) {
    console.error('刷新资源状态失败:', error);
    // 如果后端没有这个接口，可以优雅降级
    console.log('使用本地资源状态');
  }
};

  // 计算消耗
const calculateCost = (
  mode: AppMode, 
  options?: { requireHD?: boolean; wordCount?: number }
): number => {
  const { requireHD = false, wordCount = 1000 } = options || {};
  
  // 只处理实际存在的模式，其他模式返回默认值
  const costs = {
    [AppMode.TEXT_CHAT]: Math.ceil(wordCount / 1000), // 每千字1点
    [AppMode.AI_DRAWING]: requireHD ? 25 : 10, // 高清25点，标准10点
    [AppMode.AI_WRITING]: Math.ceil(wordCount / 500), // 每500字2点
    [AppMode.SMART_PRESENTATION]: 50, // 演示文稿50点
    [AppMode.DEEP_SEARCH]: 5, // 深度搜索5点
    [AppMode.PODCAST]: 30, // 播客30点/分钟
    [AppMode.MORE_TOOLS]: 0 // 更多工具免费
  };
  
  // 使用类型断言确保安全
  return (costs as Record<AppMode, number>)[mode] || 1;
};

  // 权限检查
  const checkGenerationPermission = (
    mode: AppMode,
    options?: { estimatedCost?: number; requireHD?: boolean }
  ) => {
    const { estimatedCost, requireHD = false } = options || {};
    
    // 未登录
    if (!isLoggedIn || !user) {
      return {
        allowed: false,
        reason: '请先登录'
      };
    }
    
    // 计算实际消耗
    const cost = estimatedCost || calculateCost(mode, { requireHD });
    
    // 检查算力
    if (userResources && userResources.computingPower < cost) {
      return {
        allowed: false,
        reason: `算力不足，当前${userResources.computingPower}点，需要${cost}点`,
        insufficientComputingPower: cost - userResources.computingPower
      };
    }
    
    // 检查免费用户日限
    if (!user.isMember && userResources) {
      const usageKey = mode === AppMode.AI_DRAWING ? 'aiDrawing' : 'textChat';
      const dailyLimit = mode === AppMode.AI_DRAWING ? 5 : 20; // 绘图5次，对话20次
      
      if (userResources.dailyUsage[usageKey] >= dailyLimit) {
        return {
          allowed: false,
          reason: `今日${mode === AppMode.AI_DRAWING ? 'AI绘图' : '文字对话'}次数已达上限（${dailyLimit}次）`,
          dailyLimitReached: true
        };
      }
    }
    
    // 检查会员高清权限
    if (mode === AppMode.AI_DRAWING && requireHD && !user.isMember) {
      return {
        allowed: false,
        reason: '高清分辨率需要会员权限'
      };
    }
    
    return { allowed: true };
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      user,
      token,
      login,
      logout,
      refreshUser,
      isLoading,
      refreshMemberStatus,
      
      // 新增
      userResources,
      refreshResources,
      checkGenerationPermission,
      calculateCost
    }}>
      {children}
    </AuthContext.Provider>
  );
};