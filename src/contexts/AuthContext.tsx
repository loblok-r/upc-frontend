// contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import type { User } from '../types';
import apiClient from '../utils/api';



interface AuthContextType {
  isLoggedIn: boolean;
  refreshUser: () => void;
  user: User | null;
  token: string | null;
  login: (token: string, userData: any) => void;
  logout: () => void;
  isLoading: boolean;
  refreshMemberStatus: () => void;
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
  isPermanentMember: boolean,
  memberExpireAt?: number
): {
  isMember: boolean;
  memberDaysLeft?: number;
  memberStatus: 'permanent' | 'active' | 'expired' | 'none';
} => {
  if (isPermanentMember) {
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
  const level = (rawUserData.userLevel || 'LEVEL1').toLowerCase(); // "LEVEL1" → "level1"

  // 2. 处理 memberExpireAt：ISO 字符串 → Unix 时间戳（秒）
  let memberExpireAtTimestamp: number | undefined;
  if (rawUserData.memberExpireAt) {
    const date = new Date(rawUserData.memberExpireAt);
    if (!isNaN(date.getTime())) {
      memberExpireAtTimestamp = Math.floor(date.getTime() / 1000); // 转为秒
    }
  }

  // 3. 计算会员状态
  const memberStatus = calculateMemberStatus(
    rawUserData.isPermanentMember || false,
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
    maxPoints: 1000, // 或从配置获取
    computingPower: rawUserData.computingPower || 0,
    maxcomputingPower: 1000,

    // 关键修正字段 👇
    level,                  // ← 来自 userLevel
    displayLevel,
    lotteryCounts: rawUserData.lotteryCounts || 0,
    streakDays: rawUserData.streakDays || 0,
    checkedIn: rawUserData.checkedIn || false, // 注意：后端是 isCheckedIn！

    // 会员字段
    isPermanentMember: rawUserData.isPermanentMember || false,
    memberExpireAt: memberExpireAtTimestamp,

    // 社区 stats
    stats: rawUserData.stats || { works: 0, followers: 0, likes: 0 },

    // 计算字段
    ...memberStatus,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // 从 localStorage 恢复登录状态
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUserStr = localStorage.getItem('auth_user');

    if (storedToken && storedUserStr) {
      try {
        const parsedRawUser = JSON.parse(storedUserStr);
        const fullUser = buildFullUser(parsedRawUser);

        setToken(storedToken);
        setUser(fullUser);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  // 刷新会员状态
  const refreshMemberStatus = () => {
    if (user) {
      const memberStatus = calculateMemberStatus(
        user.isPermanentMember,
        user.memberExpireAt
      );
      
      setUser({
        ...user,
        ...memberStatus,
      });
    }
  };

  // 实时检查会员过期（每5分钟）
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
            user.isPermanentMember,
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

  const login = async (newToken: string, userData: any) => {
  setToken(newToken);
  localStorage.setItem('auth_token', newToken);

  try {
    const profileResponse = await apiClient.get('/user/profile');
    console.log('✅ profileResponse:', profileResponse); // 现在能看到了！

    const newUser = buildFullUser(profileResponse);
    setUser(newUser);
    setIsLoggedIn(true);

    const { displayLevel, isMember, memberStatus, memberDaysLeft, ...rawFields } = newUser;
    localStorage.setItem('auth_user', JSON.stringify(rawFields));
    
  } catch (error) {
    console.error('❌ 获取用户资料失败:', error);
    // 可选：登出并提示用户
    logout();
    alert('登录成功，但加载用户信息失败，请重试');
  }
};
  const logout = () => {
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);

    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };
  
  const refreshUser = async () => {
  try {
    const rawUserData = await apiClient.get('/user/profile'); 
    const fullUser = buildFullUser(rawUserData);

    setUser(fullUser);
    setIsLoggedIn(true);

    // 仅保存原始字段到 localStorage
    const { 
      displayLevel, isMember, memberStatus, memberDaysLeft, ...rawFields 
    } = fullUser;

    localStorage.setItem('auth_user', JSON.stringify(rawFields));
  } catch (err) {
    console.error('Refresh user failed:', err);
  }
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
      refreshMemberStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};