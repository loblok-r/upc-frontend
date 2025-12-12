import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import generateWeekData from '../components/chickIn/generateWeekData';
import api from '../utils/api';
import { format } from 'date-fns';

import {
  ChevronLeft, Calendar, Zap, Gift, Check,
  RotateCcw, Sparkles, Cpu, Coins, Award, ArrowRightLeft
} from 'lucide-react';

export const DailyCheckInPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [checkInHistory, setCheckInHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const consecutiveDays = user?.streakDays || 0;
  const isCheckedToday = user?.checkedIn || false;

  // ✅ weekData 完全由 checkInHistory 派生，不手动 setState
  const todayISO = format(new Date(), 'yyyy-MM-dd');
  const weekData = useMemo(() => {
    const checkInSet = new Set(checkInHistory);
    return generateWeekData(checkInSet, todayISO);
  }, [checkInHistory, todayISO]);


  // 获取签到历史
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // api.get() 直接返回数据，不是完整的响应对象
        const data = await api.get('/checkin/history');
      

        // data 是 {checkInHistory: [...]}
        if (data && data.checkInHistory) {
          setCheckInHistory(data.checkInHistory);
        } else {
          console.error('数据格式错误，期望 checkInHistory 字段:', data);
          setCheckInHistory([]);
        }
      } catch (err) {
        console.error('Failed to load check-in history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // 今日奖励（用于展示）
  const todayReward = weekData.find(day => day.status === 'today') || { points: 10, exp: 5 };

  // 状态：弹窗 & 奖励信息
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [rewardMessage, setRewardMessage] = useState({ points: 0, exp: 0, extra: '' });

  // 补签卡（模拟）
  const retroCards = user?.retroCounts || 0;

  // ====== 签到逻辑 ======
  const handleCheckIn = async () => {
    if (isCheckedToday) return;

    // 提前缓存今日奖励（基于当前 weekData）
    const todayData = weekData.find(day => day.status === 'today');
    if (!todayData) {
      alert('今日签到数据异常');
      return;
    }

    try {
      await api.post('/checkin/checkin', {});
       // api.get() 直接返回数据，不是完整的响应对象
        const data = await api.get('/checkin/history');
    
        // data 是 {checkInHistory: [...]}
        if (data && data.checkInHistory) {
          setCheckInHistory(data.checkInHistory);
        } else {
          console.error('数据格式错误，期望 checkInHistory 字段:', data);
          setCheckInHistory([]);
        }

      // 刷新用户基础状态（checkedIn, streakDays）
      await refreshUser();

      // 弹窗
      setRewardMessage({
        points: todayData.points,
        exp: todayData.exp,
        extra: todayData.specialReward || '',
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('签到失败:', error);
      alert('签到失败，请稍后再试');
    }
  };

  // ====== 补签逻辑 ======
  // ====== 补签逻辑 ======
  const handleRetroCheckIn = async (index: number) => {
    // 使用 user 中的 retroCounts
    if (!user || user.retroCounts <= 0) return;

    const targetDay = weekData[index];
    if (targetDay.status !== 'missed') return;

    // 提取日期数字
    const extractDayFromDateStr = (dateStr: string | number): number => {
      const str = String(dateStr);
      // 从 "12.10" 中提取 "10"
      const match = str.match(/\.(\d+)$/);
      if (match) {
        return parseInt(match[1]);
      }
      return parseInt(str);
    };

    const dayNumber = extractDayFromDateStr(targetDay.date);

    // 验证日期
    if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 31) {
      alert('日期格式错误');
      return;
    }

    // 构造补签日期
    const yearMonth = todayISO.substring(0, 7);
    const dayStr = dayNumber.toString().padStart(2, '0');
    const retroDate = `${yearMonth}-${dayStr}`;

    try {
      // 1. 发送补签请求
      const response = await api.post('/checkin/retro', { retroDate: retroDate });

      // 2. 刷新签到历史
      // api.get() 直接返回数据，不是完整的响应对象
        const data = await api.get('/checkin/history');
      

        // data 是 {checkInHistory: [...]}
        if (data && data.checkInHistory) {
          setCheckInHistory(data.checkInHistory);
        } else {
          console.error('数据格式错误，期望 checkInHistory 字段:', data);
          setCheckInHistory([]);
        }



      // 3. 刷新用户数据（包含积分、连续签到天数、补签卡数量）
      await refreshUser();

      // 4. 显示成功弹窗
      setRewardMessage({
        points: targetDay.points,
        exp: targetDay.exp,
        extra: '补签成功',
      });
      setShowSuccessModal(true);

    } catch (error: any) {
      console.error('补签失败:', error);
      alert(`补签失败: ${error.response?.data?.message || error.message}`);
    }
  };

  // 跳转兑换页
  const handleExchange = () => {
    navigate('/mall');
  };

  return (
    <div className="min-h-screen bg-[#0f0c29] text-white font-sans relative overflow-hidden flex flex-col">
      {/* 背景装饰 */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-900/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0f0c29]/80 backdrop-blur-md">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold tracking-wide">每日签到</h1>
        <div className="w-8" />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Top Card */}
          <section className="relative rounded-3xl overflow-hidden p-6 md:p-10 border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] shadow-2xl">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left space-y-2">
                <div className="flex items-center justify-center md:justify-start gap-2 text-amber-400 font-medium mb-1">
                  <Sparkles size={16} />
                  <span>累积积分兑换算力</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white">
                  已连续签到 <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">{consecutiveDays}</span> 天
                </h2>
                <p className="text-slate-400 text-sm md:text-base max-w-md">
                  今日签到可获得 <span className="text-amber-400 font-bold">{todayReward.points} 积分</span> 及{' '}
                  <span className="text-blue-400 font-bold">{todayReward.exp} 经验</span>。
                  <br />连续签到 7 天可获得神秘大礼包。
                </p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={handleCheckIn}
                  disabled={isCheckedToday}
                  className={`
                    relative group w-36 h-36 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-500 shadow-2xl
                    ${isCheckedToday
                      ? 'border-green-500/30 bg-green-900/20 cursor-default'
                      : 'border-amber-500/50 bg-gradient-to-b from-amber-500/20 to-orange-600/20 hover:scale-105 hover:shadow-[0_0_50px_rgba(245,158,11,0.5)]'
                    }
                  `}
                >
                  {isCheckedToday ? (
                    <>
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-1 shadow-lg">
                        <Check size={28} className="text-black" />
                      </div>
                      <span className="text-sm font-bold text-green-400">已签到</span>
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-20"></div>
                      <Coins size={40} className="text-amber-400 mb-2 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]" />
                      <span className="text-base font-bold text-white tracking-wider">立即签到</span>
                      <div className="flex items-center gap-1 text-[10px] text-amber-200/90 bg-amber-500/20 px-2 py-0.5 rounded-full mt-1">
                        <span>+{todayReward.points} 积分</span>
                      </div>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 border border-white/10 text-xs text-slate-400">
                  <RotateCcw size={12} />
                  补签卡: <span className="text-white font-bold">{user?.retroCounts || 0}</span> 张
                </div>
              </div>
            </div>
          </section>

          {/* Calendar */}
          <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Calendar size={18} className="text-purple-400" /> 签到日历
              </h3>
              <span className="text-xs text-slate-500">每周日重置周期奖励</span>
            </div>

            <div className="grid grid-cols-7 gap-2 md:gap-4">
              {weekData.map((day, idx) => (
                <div key={idx} className="relative flex flex-col items-center gap-3">
                  <div
                    className={`
                      relative w-full aspect-[4/5] rounded-xl border flex flex-col items-center justify-center gap-1 transition-all
                      ${day.status === 'today' && !isCheckedToday ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-105 z-10' : ''}
                      ${day.status === 'checked' ? 'border-green-500/30 bg-green-500/5' : ''}
                      ${day.status === 'missed' ? 'border-red-500/30 bg-red-500/5 opacity-80' : ''}
                      ${day.status === 'future' ? 'border-white/5 bg-white/5' : ''}
                    `}
                  >
                    {day.status === 'checked' && (
                      <div className="absolute top-1 right-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_#22c55e]"></div>
                      </div>
                    )}

                    {day.isMilestone ? (
                      <Gift size={24} className={`${day.status === 'checked' ? 'text-green-400' : 'text-purple-400 animate-bounce-slow'}`} />
                    ) : (
                      <Coins size={20} className={`${day.status === 'checked' ? 'text-green-400' : day.status === 'today' ? 'text-amber-400' : 'text-slate-600'}`} />
                    )}

                    <span className={`text-xs font-bold ${day.status === 'checked' ? 'text-green-400' : 'text-slate-300'}`}>
                      {day.isMilestone ? '大奖' : `+${day.points}`}
                    </span>

                    {day.status === 'missed' && (
                      <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center p-1 group cursor-pointer"
                        onClick={() => handleRetroCheckIn(idx)}
                      >
                        {retroCards > 0 ? (
                          <>
                            <RotateCcw size={16} className="text-white mb-1 group-hover:rotate-180 transition-transform" />
                            <span className="text-[8px] text-white">补签</span>
                          </>
                        ) : (
                          <span className="text-[10px] text-red-400 font-bold">漏签</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <div className={`text-xs ${day.status === 'today' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>{day.dayOfWeek}</div>
                    <div className="text-[10px] text-slate-600">{day.date}</div>
                  </div>

                  {idx < 6 && (
                    <div
                      className={`hidden md:block absolute top-[40%] -right-[50%] w-full h-0.5 z-0 
                        ${weekData[idx + 1].status === 'checked' || weekData[idx + 1].status === 'today' ? 'bg-green-500/30' : 'bg-white/5'}
                      `}
                    />
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Bottom Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 钱包 */}
            <div className="p-6 rounded-2xl bg-[#151520] border border-white/5 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                  <span>我的钱包</span>
                  <span className="text-xs font-normal text-slate-500 bg-white/5 px-2 py-1 rounded">算力需兑换</span>
                </h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                    <Coins size={24} className="text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">积分余额 (可兑换算力)</div>
                    <div className="text-3xl font-bold font-mono text-white tracking-tight">{user?.points || 0}</div>
                  </div>
                  <button
                    onClick={() => navigate('/mall')}
                    className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg border border-white/10 transition-all"
                  >
                    <ArrowRightLeft size={12} /> 兑换算力
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Cpu size={10} /> 当前算力</div>
                    <div className="text-lg font-bold text-purple-400">{user?.computingPower || 0}</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Award size={10} /> 当前等级</div>
                    <div className="text-lg font-bold text-blue-400">
                      {user?.displayLevel} <span className="text-sm text-slate-500 font-normal">（{user?.exp || 0}经验）</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 任务 */}
            <div className="p-6 rounded-2xl bg-[#151520] border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">积分任务</h3>
                <span className="text-xs text-slate-500">做任务得补签卡</span>
              </div>
              <div className="space-y-3">
                <TaskItem title="生成 3 张图片" reward="+50 积分" status="completed" />
                <TaskItem title="分享作品到社区" reward="+20 积分" status="pending" />
                <TaskItem title="邀请一位好友" reward="+100 积分" status="pending" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowSuccessModal(false)}></div>
          <div className="relative w-full max-w-sm bg-[#1a1b26] border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-[60px] pointer-events-none"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-orange-600 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                <Check size={40} className="text-white" strokeWidth={3} />
              </div>
              <h2 className="text-2xl font-black text-white mb-1">
                {rewardMessage.extra === '补签成功' ? '补签成功!' : '签到成功!'}
              </h2>
              <p className="text-slate-400 text-xs mb-6">积分已到账，可用于兑换算力</p>
              <div className="w-full flex gap-3 mb-6">
                <div className="flex-1 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col items-center justify-center gap-1">
                  <Coins size={24} className="text-amber-400 mb-1" />
                  <span className="text-3xl font-black text-amber-400">+{rewardMessage.points}</span>
                  <span className="text-[10px] text-amber-200/60 uppercase font-bold tracking-wider">Points</span>
                </div>
                <div className="w-1/3 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex flex-col items-center justify-center gap-1">
                  <Award size={20} className="text-blue-400 mb-1" />
                  <span className="text-xl font-bold text-blue-400">+{rewardMessage.exp}</span>
                  <span className="text-[10px] text-blue-200/60 uppercase font-bold tracking-wider">EXP</span>
                </div>
              </div>
              {rewardMessage.extra && rewardMessage.extra !== '补签成功' && (
                <div className="w-full bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 mb-6 flex items-center justify-center gap-2">
                  <Gift size={16} className="text-purple-400" />
                  <span className="text-sm font-bold text-purple-300">额外获得: {rewardMessage.extra}</span>
                </div>
              )}
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3 bg-white text-black font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-white/10"
              >
                开心收下
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Helper Components ---
const TaskItem = ({ title, reward, status }: { title: string; reward: string; status: 'completed' | 'pending' }) => (
  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
    <div>
      <div className="text-sm font-medium text-white">{title}</div>
      <div className="text-xs text-amber-400 mt-0.5">{reward}</div>
    </div>
    <button
      disabled={status === 'completed'}
      className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all ${status === 'completed'
        ? 'bg-green-500/20 text-green-400 border-green-500/30'
        : 'bg-white text-black hover:bg-slate-200 border-transparent'
        }`}
    >
      {status === 'completed' ? '已领取' : '去完成'}
    </button>
  </div>
);

export default DailyCheckInPage;