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

// 从原始用户数据构建完整 User 对象（含计算字段）
const buildFullUser = (rawUserData: any): User => {
  const memberStatus = calculateMemberStatus(
    rawUserData.isPermanentMember || false,
    rawUserData.memberExpireAt
  );

  const displayLevel = mapLevelToDisplay(rawUserData.level || 'level1');

  return {
    id: rawUserData.id || rawUserData.userId || '',
    username: rawUserData.username || '',
    email: rawUserData.email || '',
    exp: rawUserData.exp || 0,
    points: rawUserData.points || 0,
    maxPoints: (rawUserData.maxPoints as number) || 1000,
    computingPower: rawUserData.computingPower || 0,
    maxcomputingPower: (rawUserData.maxcomputingPower as number) || 1000,
    level: rawUserData.level || 'level1',
    displayLevel,
    lotteryCounts: rawUserData.lotteryCounts || 0,
    streakDays: rawUserData.streakDays || 0,
    checkedIn: rawUserData.checkedIn || false,

    stats: rawUserData.stats || {
      works: 0,
      followers: 0,
      likes: 0,
    },
    isPermanentMember: rawUserData.isPermanentMember || false,
    memberExpireAt: rawUserData.memberExpireAt,
    avatar: rawUserData.avatar || '',
    expireTime: rawUserData.expireTime || 0,

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

  const login = (newToken: string, userData: any) => {
    // 构建完整用户对象
    const newUser = buildFullUser(userData);

    setToken(newToken);
    setUser(newUser);
    setIsLoggedIn(true);

    // 保存 token 和原始用户数据（不含计算字段）
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify({
      id: userData.userId || userData.id || '',
      username: userData.username || '',
      email: userData.email || '',
      exp: userData.exp || 0,
      lotteryCounts: userData.lotteryCounts || 0,
      streakDays: userData.streakDays || 0,
      checkedIn: userData.checkedIn || false,
      points: userData.points || 0,
      maxPoints: userData.maxPoints || 1000,
      computingPower: userData.computingPower || 0,
      maxcomputingPower: userData.maxcomputingPower || 1000,
      level: userData.level || 'level1',
      stats: userData.stats || { works: 0, followers: 0, likes: 0 },
      isPermanentMember: userData.isPermanentMember || false,
      memberExpireAt: userData.memberExpireAt,
      avatar: userData.avatar || '',
      expireTime: userData.expireTime || 0,
    }));
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
    const rawUserData = await apiClient.get('/api/user/profile'); // 假设 apiClient 已解包 Result<T>
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