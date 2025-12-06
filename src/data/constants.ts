import type { ProductCard,Document, Winner, MallProduct, FlashSaleItem } from '../types';

export const WINNERS: Winner[] = [
  { username: "p***x", prize: "专业版次数+10", time: "1分钟前" },
  { username: "m***9", prize: "专业版月卡", time: "2分钟前" },
  { username: "a***k", prize: "积分+100点", time: "5分钟前" },
  { username: "user_88", prize: "抽奖次数+3", time: "刚刚" },
  { username: "fox**", prize: "智能任务额度X3", time: "10分钟前" },
  { username: "moon**", prize: "2***1 积分+200点", time: "12分钟前" },
];

export const PRODUCTS: ProductCard[] = [
  {
    id: '1',
    title: '现金奖励',
    subtitle: '赠送100美元现金奖励',
    icon: 'DollarSign',
    color: 'text-green-400',
    badge: '热门'
  },
  {
    id: '2',
    title: '专业版月卡',
    subtitle: '赠送一个月的专业版接口使用权益',
    icon: 'Zap',
    color: 'text-blue-400'
  },
  {
    id: '3',
    title: '专业版永久使用',
    subtitle: '赠送专业版接口永久使用权益, 无需续费',
    icon: 'Infinity',
    color: 'text-yellow-400'
  },
  {
    id: '4',
    title: '积分+200点',
    subtitle: '赠送200积分',
    icon: 'Coins',
    color: 'text-orange-400'
  },
  {
    id: '5',
    title: '抽奖次数X3',
    subtitle: '使用该卡可以增加抽奖次数3次',
    icon: 'Dices',
    color: 'text-pink-400'
  },
  {
    id: '6',
    title: '智能任务额度X3',
    subtitle: '智能任务使用额度+3',
    icon: 'Sparkles',
    color: 'text-purple-400'
  },
  {
    id: '7',
    title: '补签卡',
    subtitle: '使用该卡可以补签一次',
    icon: 'CheckCircle',
    color: 'text-cyan-400'
  },
  {
    id: '8',
    title: 'AI绘图额度x3',
    subtitle: 'AI绘图使用额度+3',
    icon: 'Palette',
    color: 'text-rose-400'
  }
];

export const AI_SYSTEM_INSTRUCTION = `
You are the AI customer support agent for "Mitce", a digital rewards and subscription platform. 
Your tone should be professional, friendly, and helpful.
Language: Simplified Chinese (简体中文).

Key Platform Info:
- We offer subscriptions for Telegram, Disney+, and data plans.
- Users can win prizes by recharging balance (5 USD = 3 lottery chances).
- Prizes include subscription extensions, extra data, and balance multipliers.
- Support hours: 9:00 - 18:00.

If asked about technical issues, suggest checking the "Help Docs" (帮助文档) first.
If asked about the lottery, explain the $5 recharge rule.
`;

export const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'new',
    title: '新建文档',
    date: '您可以手动创建文件',
    type: 'doc',
    isPlaceholder: true
  },
  {
    id: '1',
    title: 'AI 与大数据分析',
    date: '2025-12-06 13:33 创建',
    type: 'slides',
    thumbnailColor: 'bg-orange-500/20' 
  },
  {
    id: '2',
    title: 'Q3 季度财务报告',
    date: '2025-11-20 09:15 创建',
    type: 'sheet',
    thumbnailColor: 'bg-green-500/20'
  },
  {
    id: '3',
    title: '产品发布会演讲稿',
    date: '2025-11-15 16:40 创建',
    type: 'doc',
    thumbnailColor: 'bg-blue-500/20'
  }
];

export const MallPRODUCTS: MallProduct[] = [
  {
    id: '1',
    name: '京东E卡 30元 [折扣兑]',
    points: 1665,
    cash: 15,
    originalPoints: 3840,
    image: 'https://picsum.photos/300/300?random=1',
    category: 'card',
    tag: '超值'
  },
  {
    id: '2',
    name: '7天WPS大会员 [折扣兑]',
    points: 170,
    cash: 6.8,
    originalPoints: 850,
    image: 'https://picsum.photos/300/300?random=2',
    category: 'office',
    tag: '热门'
  },
  {
    id: '3',
    name: '京东E卡 5元 [折扣兑]',
    points: 274,
    cash: 3,
    originalPoints: 700,
    image: 'https://picsum.photos/300/300?random=3',
    category: 'card'
  },
  {
    id: '4',
    name: '20元话费充值 [折扣兑]',
    points: 1400,
    cash: 9,
    originalPoints: 2760,
    image: 'https://picsum.photos/300/300?random=4',
    category: 'card'
  },
  {
    id: '5',
    name: '帆布手提包 [折扣兑]',
    points: 150,
    cash: 4.8,
    originalPoints: 630,
    image: 'https://picsum.photos/300/300?random=5',
    category: 'goods',
    tag: '限量'
  },
  {
    id: '6',
    name: 'AI生成点数包 (100点)',
    points: 500,
    image: 'https://picsum.photos/300/300?random=6',
    category: 'virtual'
  }
];

export const FLASH_SALES: FlashSaleItem[] = [
  {
    id: 'f1',
    name: 'CoCo代金券10元',
    description: '每日每场限量15份',
    price: 799,
    originalPrice: 1200,
    time: '12月6日',
    status: 'ended',
    image: 'https://picsum.photos/100/100?random=10'
  },
  {
    id: 'f2',
    name: '小号户外旅行洗漱包',
    description: '每日每场限量150份',
    price: 1190,
    originalPrice: 1190,
    time: '12月7日',
    status: 'active',
    image: 'https://picsum.photos/100/100?random=11'
  },
  {
    id: 'f3',
    name: '爱奇艺黄金会员月卡',
    description: '每日每场限量50份',
    price: 2500,
    originalPrice: 3000,
    time: '12月8日',
    status: 'upcoming',
    image: 'https://picsum.photos/100/100?random=12'
  }
];

export const FILTERS = [
  '1元起兑',
  '办公好物',
  '超值优选',
  '会员卡券',
  '家居日用',
  '数码家电',
  'WPS周边'
];