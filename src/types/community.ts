// src/types/community.ts

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  followers: number;
  isVerified?: boolean;
  isFollowed?: boolean; 
  // 个人中心统计数据 (可选，视后端返回情况)
  stats?: {
    works: number;
    followers: number;
    likes: number;
  };
  computingPower?: number;
  maxcomputingPower?: number;
  isMember?: boolean; // 是否是 PRO 会员
  username?: string; // 兼容部分接口可能返回 username 而不是 name
}

export interface Comment {
  id: string;
  userId: string;
  user: User;
  text: string;
  likes: number;
  createdAt: string; // ISO String
  replies?: Comment[];
}

export interface Post {
  id: string;
  userId: string;
  title?: string;
  content?: string;
  imageUrl: string;
  likesCount: number;
  commentsCount: number;
  sharesCount?: number; // 可选
  author: User;
  createdAt: string;
  comments?: Comment[]; // 详情页使用
}

// 视图状态
export const ViewState = {
  LANDING: 'LANDING',
  APP: 'APP'
} as const;
export type ViewState = typeof ViewState[keyof typeof ViewState];

// 侧边栏 Tab 枚举
export const SidebarTab = {
  HOME: 'HOME',
  SEARCH: 'SEARCH',
  LEADERBOARD: 'LEADERBOARD',
  PROFILE: 'PROFILE'
} as const;
export type SidebarTab = typeof SidebarTab[keyof typeof SidebarTab];

// 排行榜单项
export interface LeaderboardItem {
  rank: number;
  score: number; // 热度值/分数
  author: User;
}