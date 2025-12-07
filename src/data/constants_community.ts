import type { Post, User, Comment  } from '../types/community';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'upcV', handle: '@upcv1898981', avatar: 'https://picsum.photos/seed/u1/100/100', followers: 125000, isVerified: true },
  { id: 'u2', name: '用户2923', handle: '@user29233632', avatar: 'https://picsum.photos/seed/u2/100/100', followers: 370000, isVerified: true },
  { id: 'u3', name: '艺术虎', handle: '@arttiger14131', avatar: 'https://picsum.photos/seed/u3/100/100', followers: 45000 },
  { id: 'u4', name: 'CyberJ', handle: '@CyberrrrrJ', avatar: 'https://picsum.photos/seed/u4/100/100', followers: 8900 },
  { id: 'u5', name: '冬儿', handle: '@donger', avatar: 'https://picsum.photos/seed/u5/100/100', followers: 134000, isVerified: true },
  { id: 'u6', name: 'AI Observer', handle: '@aiwatcher', avatar: 'https://picsum.photos/seed/u6/100/100', followers: 1200 },
];

// Helper to create nested structure
const REPLY_1: Comment = { 
  id: 'r1', 
  userId: 'u6', 
  user: MOCK_USERS[5], 
  text: '确实，尤其是水面的反射，很难分辨真假。', 
  likes: 8, 
  timeAgo: '1小时前',
  replies: []
};

const REPLY_2: Comment = { 
  id: 'r2', 
  userId: 'u4', 
  user: MOCK_USERS[3], 
  text: '现在的模型对物理规律的理解越来越深刻了。', 
  likes: 5, 
  timeAgo: '45分钟前',
  replies: []
};

export const MOCK_COMMENTS: Comment[] = [
  { 
    id: 'c1', 
    userId: 'u2', 
    user: MOCK_USERS[1], 
    text: '简直太超现实了！光影效果完美。', 
    likes: 42, 
    timeAgo: '2小时前',
    replies: [REPLY_1] // Nested reply
  },
  { 
    id: 'c2', 
    userId: 'u3', 
    user: MOCK_USERS[2], 
    text: '这迭代了多少次？连贯性太惊人了。', 
    likes: 12, 
    timeAgo: '5小时前',
    replies: [REPLY_2] // Nested reply
  },
  { 
    id: 'c3', 
    userId: 'u5', 
    user: MOCK_USERS[4], 
    text: '太搞笑了 😂', 
    likes: 27, 
    timeAgo: '1天前',
    replies: []
  },
  { 
    id: 'c4', 
    userId: 'u1', 
    user: MOCK_USERS[0], 
    text: '等等，这到底是实拍还是生成的？我已经分不清了。', 
    likes: 156, 
    timeAgo: '30分钟前',
    replies: []
  },
];

export const MOCK_POSTS: Post[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `p${i}`,
  type: 'image', // Using images to simulate video thumbnails for performance
  thumbnailUrl: `https://picsum.photos/seed/${i * 123}/600/${i % 2 === 0 ? 800 : 600}`,
  caption: i % 3 === 0 ? '一只赛博朋克猫咪在霓虹城市中探索。' : '超写实自然纪录片片段。',
  author: MOCK_USERS[i % MOCK_USERS.length],
  likes: Math.floor(Math.random() * 5000) + 100,
  commentsCount: Math.floor(Math.random() * 200) + 10,
  shares: Math.floor(Math.random() * 500),
  comments: MOCK_COMMENTS,
  timestamp: '12月7日 12:10 PM'
}));

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