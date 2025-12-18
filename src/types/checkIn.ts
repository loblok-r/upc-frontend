export type DayStatus = 'checked' | 'missed' | 'today' | 'future';

export interface CheckInDay {
  date: string;
  dayOfWeek: string;
  status: DayStatus;
  points: number; 
  exp: number;    
  isMilestone: boolean;
  specialReward?: string;
}