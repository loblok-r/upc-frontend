import type { ProductCard, Winner } from '../types';

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
    icon: 'Star',
    color: 'text-purple-400',
    badge: '热门'
  },
  {
    id: '2',
    title: '专业版月卡',
    subtitle: '赠送一个月的专业版接口使用权益',
    icon: 'Video',
    color: 'text-blue-400'
  },
  {
    id: '3',
    title: '专业版永久使用',
    subtitle: '赠送专业版接口永久使用权益, 无需续费',
    icon: 'Calendar',
    color: 'text-yellow-400'
  },
  {
    id: '4',
    title: '积分+200点',
    subtitle: '赠送200积分',
    icon: 'Infinity',
    color: 'text-orange-400'
  },
  {
    id: '5',
    title: '抽奖次数X3',
    subtitle: '使用该卡可以增加抽奖次数3次',
    icon: 'Banknote',
    color: 'text-green-400'
  },
  {
    id: '6',
    title: '智能任务额度X3',
    subtitle: '智能任务使用额度+3',
    icon: 'Banknote',
    color: 'text-green-400'
  },
  {
    id: '7',
    title: '补签卡',
    subtitle: '使用该卡可以补签一次',
    icon: 'Banknote',
    color: 'text-green-400'
  },
  {
    id: '8',
    title: 'AI绘图额度x3',
    subtitle: 'AI绘图使用额度+3',
    icon: 'Banknote',
    color: 'text-green-400'
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