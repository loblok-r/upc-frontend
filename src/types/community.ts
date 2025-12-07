export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  followers: number;
  isVerified?: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  user: User;
  text: string;
  likes: number;
  timeAgo: string;
  replies?: Comment[]; // Changed from number to Comment[] for nested structure
}

export interface Post {
  id: string;
  type: 'video' | 'image';
  thumbnailUrl: string;
  caption: string;
  author: User;
  likes: number;
  commentsCount: number;
  shares: number;
  comments: Comment[];
  timestamp: string;
}

export const ViewState = {
  LANDING: 'LANDING',
  APP: 'APP'
} as const;
export type ViewState = typeof ViewState[keyof typeof ViewState];


export const SidebarTab = {
  HOME: 'HOME',
  SEARCH: 'SEARCH',
  LEADERBOARD: 'LEADERBOARD',
  PROFILE: 'PROFILE'
} as const;
export type SidebarTab = typeof SidebarTab[keyof typeof SidebarTab];