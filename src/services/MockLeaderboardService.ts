import { LEADERBOARD_DATA } from '../data/constants_community';
import type { LeaderboardData, LeaderboardItem } from '../types/community';

// 模拟排行榜数据变化的服务
const MockLeaderboardService = {
  /**
   * 获取排行榜数据
   * @param category 类别 ('creators' | 'remixes')
   * @param timeRange 时间范围 ('all' | 'week' | 'month' | 'year')
   */
  getLeaderboardData: (
    category: 'creators' | 'remixes' = 'creators',
    timeRange: 'all' | 'week' | 'month' | 'year' = 'all'
  ): Promise<LeaderboardData> => {
    return new Promise((resolve) => {
      // 模拟网络延迟 500-800ms
      const delay = Math.random() * 300 + 500;

      setTimeout(() => {
        // 基于时间范围调整数据
        let creatorsData = [...LEADERBOARD_DATA.creators];
        let remixesData = [...LEADERBOARD_DATA.remixes];

        // 模拟数据变化（根据时间范围调整排名）
        if (timeRange !== 'all') {
          // 为不同时间范围生成不同的随机数据
          creatorsData = creatorsData.map((item, index) => {
            // 根据时间范围调整分数和排名
            let modifier = 1;
            switch (timeRange) {
              case 'week':
                modifier = 0.7 + Math.random() * 0.6; // 0.7-1.3倍变化
                break;
              case 'month':
                modifier = 0.5 + Math.random() * 1.0; // 0.5-1.5倍变化
                break;
              case 'year':
                modifier = 0.3 + Math.random() * 1.4; // 0.3-1.7倍变化
                break;
            }
            
            // 计算新的分数
            const newScore = Math.max(0, Math.round(item.score * modifier * 10) / 10);
            
            return {
              ...item,
              score: newScore
            };
          });

          remixesData = remixesData.map((item, index) => {
            // 根据时间范围调整分数和排名
            let modifier = 1;
            switch (timeRange) {
              case 'week':
                modifier = 0.7 + Math.random() * 0.6;
                break;
              case 'month':
                modifier = 0.5 + Math.random() * 1.0;
                break;
              case 'year':
                modifier = 0.3 + Math.random() * 1.4;
                break;
            }
            
            // 计算新的分数
            const newScore = Math.max(0, Math.round(item.score * modifier));
            
            return {
              ...item,
              score: newScore
            };
          });

          // 重新排序
          creatorsData.sort((a, b) => b.score - a.score);
          remixesData.sort((a, b) => b.score - a.score);

          // 更新排名
          creatorsData = creatorsData.map((item, index) => ({
            ...item,
            rank: index + 1
          }));

          remixesData = remixesData.map((item, index) => ({
            ...item,
            rank: index + 1
          }));
        }

        resolve({
          creators: creatorsData,
          remixes: remixesData
        });
      }, delay);
    });
  }
};

export default MockLeaderboardService;