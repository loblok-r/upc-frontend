import { format, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale/zh-CN';
import type{ CheckInDay, DayStatus } from '../../types/checkIn'; 

// Helper: 生成本周签到数据（从周一到周日）
const generateWeekData = (userCheckInRecords: Set<string>, todayStr: string): CheckInDay[] => {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // 周一为第一天
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // 预定义奖励规则（你可以从配置或 API 获取）
  const rewardMap: Record<number, { points: number; exp: number; isMilestone: boolean; specialReward?: string }> = {
    0: { points: 10, exp: 5, isMilestone: false }, // 周一
    1: { points: 10, exp: 5, isMilestone: false }, // 周二
    2: { points: 20, exp: 10, isMilestone: false }, // 周三
    3: { points: 50, exp: 15, isMilestone: false , specialReward: '10% 优惠券'}, // 周四
    4: { points: 15, exp: 5, isMilestone: false }, // 周五
    5: { points: 15, exp: 5, isMilestone: false }, // 周六
    6: { points: 100, exp: 50, isMilestone: true, specialReward: '算力值400' }, // 周日
  };

  return days.map((date, idx) => {
    const dateStr = format(date, 'MM.dd');
    const dayOfWeek = format(date, 'eee', { locale: zhCN });
    const isoDate = format(date, 'yyyy-MM-dd');

    let status: DayStatus = 'future';
    if (isSameDay(date, new Date())) {
      status = userCheckInRecords.has(isoDate) ? 'checked' : 'today';
    } else if (date < now) {
      status = userCheckInRecords.has(isoDate) ? 'checked' : 'missed';
    }

    const reward = rewardMap[idx] || { points: 10, exp: 5, isMilestone: false };

    return {
      date: dateStr,
      dayOfWeek: dayOfWeek.slice(0, 2), // "周一", "周二"
      status,
      ...reward,
    };
  });
};
export default generateWeekData;