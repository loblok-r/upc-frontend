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
    following: number;
    likes: number;
  };
  computingPower?: number;
  maxcomputingPower?: number;
  isMember?: boolean; // 是否是 PRO 会员
  username?: string; // 兼容部分接口可能返回 username 而不是 name
  bio?: string; // 用户简介
}

export interface Comment {
  id: string;
  userId: string;
  user: User;
  text: string;
  likes: number;
  isLiked?: boolean; // 当前用户是否点赞了该评论
  createdAt: string; // ISO String
  replies?: Comment[];
  timeAgo?: string; // 前端计算的时间
}

export interface Post {
  id: string;
  userId: string;
  title?: string;
  content?: string;
  imageUrl: string;
  likesCount: number;
  commentsCount: number;
  sharesCount?: number; 
  isLiked?: boolean; 
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
  PROFILE: 'PROFILE',
  USER_PROFILE: 'USER_PROFILE' 
} as const;
export type SidebarTab = typeof SidebarTab[keyof typeof SidebarTab];

// 排行榜单项
export interface LeaderboardItem {
  rank: number;
  score: number; 
  author: User;
}

export interface LeaderboardData {
  creators: LeaderboardItem[];
  remixes: LeaderboardItem[];
}