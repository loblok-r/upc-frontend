export type DayStatus = 'checked' | 'missed' | 'today' | 'future';

export interface CheckInDay {
  date: string;
  dayOfWeek: string;
  status: DayStatus;
  points: number; // 积分奖励
  exp: number;    // 经验奖励
  isMilestone: boolean;
  specialReward?: string;
}