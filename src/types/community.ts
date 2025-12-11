// 1. 用户接口保持不变
export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  followers: number;
  isVerified?: boolean;
}

// 2. 评论接口优化
export interface Comment {
  id: string;
  userId: string;
  user: User;        // 评论发布者信息
  text: string;      // 评论内容
  likes: number;     // 点赞数
  createdAt: string; // 建议后端返回 ISO 时间字符串，前端计算 "timeAgo"
  replies?: Comment[]; // 嵌套回复
}

// 3. 帖子接口 (重点修改)
export interface Post {
  // --- 数据库直接对应字段 ---
  id: string;          // bigint -> string
  userId: string;      // user_id
  title?: string;      // title (nullable)
  content?: string;    // content (nullable) -> 修改为可选，因为后端允许 NULL
  imageUrl: string;    // image_url
  likesCount: number;  // likes_count
  commentsCount: number; // comments_count
  
  // --- UI 展示需要的额外字段 (通常不存在于 Post 表，而是 Mock 或以后加的) ---
  sharesCount?: number; // 详情页还在用 shares，建议加回来作为可选字段，防止报错

  // --- 联表查询/聚合字段 ---
  author: User;        // 后端 API 组装时必须把用户信息带回来
  createdAt: string;   // created_at (ISO string)
  
  // --- 详情页专用 ---
  // 修改 any[] 为具体的 Comment[]，获得更好的代码提示
  comments?: Comment[]; 
}

// 视图状态保持不变
export const ViewState = {
  LANDING: 'LANDING',
  APP: 'APP'
} as const;
export type ViewState = typeof ViewState[keyof typeof ViewState];

// 侧边栏状态保持不变
export const SidebarTab = {
  HOME: 'HOME',
  SEARCH: 'SEARCH',
  LEADERBOARD: 'LEADERBOARD',
  PROFILE: 'PROFILE'
} as const;
export type SidebarTab = typeof SidebarTab[keyof typeof SidebarTab];