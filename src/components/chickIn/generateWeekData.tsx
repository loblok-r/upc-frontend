import { format, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, startOfDay } from 'date-fns';
import { zhCN } from 'date-fns/locale/zh-CN';
import type { CheckInDay, DayStatus } from '../../types/checkIn'; 

// Helper: 生成本周签到数据（从周一到周日）
const generateWeekData = (userCheckInRecords: Set<string>, todayStr: string): CheckInDay[] => {
  // 建议使用传入的 todayStr 构造参考时间，避免客户端时间不准
  const referenceDate = todayStr ? new Date(todayStr) : new Date();
  
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 }); // 周一为第一天
  const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // 奖励规则
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
    const isoDate = format(date, 'yyyy-MM-dd'); // 2024-12-31 这种格式

    let status: DayStatus = 'future';
    
    // 使用 startOfDay 比较日期，避免小时分钟的影响
    if (isSameDay(date, referenceDate)) {
      status = userCheckInRecords.has(isoDate) ? 'checked' : 'today';
    } else if (date < startOfDay(referenceDate)) {
      status = userCheckInRecords.has(isoDate) ? 'checked' : 'missed';
    }

    const reward = rewardMap[idx] || { points: 10, exp: 5, isMilestone: false };

    return {
      date: dateStr,
      fullDate: isoDate,        // ✅ 新增：保存完整的 ISO 日期，供后端接口直接使用
      dayOfWeek: dayOfWeek.slice(0, 2), // "周一"
      status,
      ...reward,
    } as any; // 如果 CheckInDay 类型还没更新，可以暂时断言为 any，建议去 types/checkIn 增加 fullDate 定义
  });
};

export default generateWeekData;