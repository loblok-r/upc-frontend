import type { Post, User, Comment } from '../types/community';

// 1. 模拟用户数据
export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'upcV', handle: '@upcv1898981', avatar: 'https://picsum.photos/seed/u1/100/100', followers: 125000, isVerified: true },
  { id: 'u2', name: '用户2923', handle: '@user29233632', avatar: 'https://picsum.photos/seed/u2/100/100', followers: 370000, isVerified: true },
  { id: 'u3', name: '艺术虎', handle: '@arttiger14131', avatar: 'https://picsum.photos/seed/u3/100/100', followers: 45000 },
  { id: 'u4', name: 'CyberJ', handle: '@CyberrrrrJ', avatar: 'https://picsum.photos/seed/u4/100/100', followers: 8900 },
  { id: 'u5', name: '冬儿', handle: '@donger', avatar: 'https://picsum.photos/seed/u5/100/100', followers: 134000, isVerified: true },
  { id: 'u6', name: 'AI Observer', handle: '@aiwatcher', avatar: 'https://picsum.photos/seed/u6/100/100', followers: 1200 },
];

// 2. 构建多级评论结构
// 场景：针对光影效果的深度讨论 (Level 3 -> Level 2 -> Level 1)

// Level 3: 最底层的回复
const REPLY_LEVEL_3: Comment = {
  id: 'r_level_3',
  userId: 'u1',
  user: MOCK_USERS[0], // upcV
  text: '确实，特别是漫反射的处理，现在的渲染器算法太强了。',
  likes: 5,
  createdAt: '10分钟前',
  replies: []
};

// Level 2: 回复 Level 1，并包含 Level 3 的回复
const REPLY_LEVEL_2_A: Comment = {
  id: 'r_level_2_a',
  userId: 'u4',
  user: MOCK_USERS[3], // CyberJ
  text: '我觉得不仅仅是材质，主要是环境光遮蔽（AO）开得恰到好处。',
  likes: 12,
  createdAt: '25分钟前',
  replies: [REPLY_LEVEL_3] // 嵌套 Level 3
};

const REPLY_LEVEL_2_B: Comment = {
  id: 'r_level_2_b',
  userId: 'u6',
  user: MOCK_USERS[5], // AI Observer
  text: '同意楼上，这种金属质感很难调。',
  likes: 3,
  createdAt: '20分钟前',
  replies: [] // 没有回复
};

// Level 1: 根评论
const ROOT_COMMENT_1: Comment = {
  id: 'c1',
  userId: 'u2',
  user: MOCK_USERS[1], // 用户2923
  text: '这张图的光影逻辑简直完美，完全看不出是生成的！🤯',
  likes: 142,
  createdAt: '1小时前',
  replies: [REPLY_LEVEL_2_A, REPLY_LEVEL_2_B] // 包含两个二级回复
};

// 场景：简单的问答 (单层回复)
const REPLY_TO_PROMPT: Comment = {
  id: 'r_prompt',
  userId: 'u3',
  user: MOCK_USERS[2], // 艺术虎
  text: '作者置顶了，看最上面的描述。',
  likes: 8,
  createdAt: '2小时前',
  replies: []
};

const ROOT_COMMENT_2: Comment = {
  id: 'c2',
  userId: 'u5',
  user: MOCK_USERS[4], // 冬儿
  text: '求提示词！这个风格太喜欢了 😍',
  likes: 56,
  createdAt: '3小时前',
  replies: [REPLY_TO_PROMPT]
};

const ROOT_COMMENT_3: Comment = {
  id: 'c3',
  userId: 'u6',
  user: MOCK_USERS[5],
  text: '如果是Midjourney V6出的，那细节真的无敌。',
  likes: 22,
  createdAt: '5小时前',
  replies: []
};

// 3. 导出完整的评论数组
export const MOCK_COMMENTS: Comment[] = [
  ROOT_COMMENT_1, // 包含3层嵌套
  ROOT_COMMENT_2, // 包含2层嵌套
  ROOT_COMMENT_3, // 无嵌套
];

// 4. 生成帖子列表
export const MOCK_POSTS: Post[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `p${i}`,
  userId: `u${i % MOCK_USERS.length}`,
  
  // 模拟数据差异化
  title: i % 3 === 0 ? '赛博朋克 2077: 霓虹幻夜' : (i % 2 === 0 ? '失落的文明遗迹' : undefined),
  
  content: i % 3 === 0 
    ? '使用最新模型生成的霓虹城市夜景，重点尝试了雨夜反光的质感，大家觉得怎么样？提示词已共享。' 
    : '今天尝试了一种新的渲染风格，结合了水墨与3D渲染，探索传统与现代的边界。 #AIArt #Design #Concept',
  
  imageUrl: `https://picsum.photos/seed/${i * 456}/600/${i % 2 === 0 ? 800 : 600}`,
  
  likesCount: Math.floor(Math.random() * 5000) + 100,
  commentsCount: Math.floor(Math.random() * 200) + 10,
  sharesCount: Math.floor(Math.random() * 500), // 添加 sharesCount 避免报错
  
  author: MOCK_USERS[i % MOCK_USERS.length],
  createdAt: '2023-12-07 12:10:00',
  
  // 重要：将上面的多级评论挂载到每个帖子上，这样点击任意帖子都能看到效果
  comments: MOCK_COMMENTS 
}));

// 5. 榜单数据 (保持不变)
export const LEADERBOARD_DATA = {
  creators: [
    { rank: 1, user: MOCK_USERS[0], score: 98.5 },
    { rank: 2, user: MOCK_USERS[4], score: 95.2 },
    { rank: 3, user: MOCK_USERS[1], score: 92.1 },
    { rank: 4, user: MOCK_USERS[2], score: 88.4 },
  ],
  remixes: [
    { rank: 1, user: MOCK_USERS[3], score: 1000 },
    { rank: 2, user: MOCK_USERS[2], score: 850 },
    { rank: 3, user: MOCK_USERS[0], score: 600 },
  ]
};