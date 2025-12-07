import { MOCK_USERS } from '../data/constants_community';
const MockApiService = {
  /**
   * 模拟关注/取消关注接口
   */
  toggleFollow: (currentUserId: string, targetUserId: string, isFollowing: boolean): Promise<boolean> => {
    return new Promise((resolve) => {
      // 模拟网络延迟 600ms
      setTimeout(() => {
        resolve(true); 
      }, 600);
    });
  },

  /**
   * 模拟用户搜索接口
   * @param query 搜索关键词
   */
  searchUsers: (query: string): Promise<any[]> => {
    return new Promise((resolve) => {
      console.log(`[API] Searching for: "${query}"...`);
      
      // 模拟网络延迟 500ms
      setTimeout(() => {
        if (!query.trim()) {
          resolve(MOCK_USERS); // 如果为空，返回推荐列表（或者空列表，看需求）
          return;
        }

        const lowerQuery = query.toLowerCase();
        // 简单的模糊匹配逻辑
        const results = MOCK_USERS.filter(user => 
          user.name.toLowerCase().includes(lowerQuery) || 
          user.handle.toLowerCase().includes(lowerQuery)
        );
        
        resolve(results);
      }, 500);
    });
  }
};
export default MockApiService;