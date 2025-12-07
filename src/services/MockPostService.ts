import { MOCK_POSTS } from '../data/constants_community'; 
import type { Post } from '../types/community';
// ==========================================
// 1. 新增：Mock Post Service (模拟后台帖子接口)
// ==========================================
const MockPostService = {
  /**
   * 根据 Tab 类型获取帖子列表
   */
  getPosts: (type: 'RECOMMEND' | 'FOLLOWING' | 'LATEST'): Promise<Post[]> => {
    return new Promise((resolve) => {
      // 模拟网络延迟 600~1000ms
      const delay = Math.random() * 400 + 600;

      setTimeout(() => {
        let results = [...MOCK_POSTS];

        if (type === 'FOLLOWING') {
          // 模拟：只筛选出 ID 为偶数的帖子，假装是关注的人
          results = results.filter((_, index) => index % 2 === 0);
        } else if (type === 'LATEST') {
          // 模拟：将数组反转，或者重新打乱，假装是按时间排序
          results = results.reverse(); 
        } else {
          // RECOMMEND: 默认返回原列表 (或者你可以打乱顺序)
          // results = results.sort(() => Math.random() - 0.5);
        }
        
        resolve(results);
      }, delay);
    });
  }
};
export default MockPostService;