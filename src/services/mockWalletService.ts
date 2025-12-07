import type { PointTransaction, Coupon, OrderItem, BenefitItem } from '../types/index';
import  { WalletTabId } from '../types/index';
import { MOCK_TRANSACTIONS } from '../data/constants'; 

// 统一的返回类型
export type WalletData = PointTransaction[] | Coupon[] | OrderItem[] | BenefitItem[] | any[];

// --- Mock Service ---

export const MockWalletService = {
  /**
   * 模拟登录接口
   */
  login: (): Promise<boolean> => {
    return new Promise((resolve) => {
      console.log('正在调用登录接口...');
      setTimeout(() => {
        console.log('登录成功');
        resolve(true);
      }, 1500); // 模拟 1.5s 的网络请求
    });
  },

  /**
   * 根据 Tab ID 获取对应数据
   */
  fetchTabContent: (tabId: WalletTabId): Promise<WalletData> => {
    return new Promise((resolve) => {
      const delay = Math.random() * 500 + 500; // 500-1000ms 随机延迟

      setTimeout(() => {
        switch (tabId) {
          case WalletTabId.POINTS:
            resolve(MOCK_TRANSACTIONS);
            break;

          case WalletTabId.COUPONS:
            resolve([
              { id: 'c1', title: '算力充值 8 折券', discount: '20% OFF', expiry: '2025-12-31', type: 'discount', status: 'active' },
              { id: 'c2', title: '新用户 50 积分', discount: '50 PT', expiry: '2025-10-01', type: 'cash', status: 'active' },
              { id: 'c3', title: '画廊免广告卡', discount: 'FREE', expiry: '2024-01-01', type: 'discount', status: 'expired' },
            ] as Coupon[]);
            break;

          case WalletTabId.PHYSICAL_ITEMS:
            resolve([
              { id: 'o1', name: '限量版 AI 艺术画册', status: 'shipping', date: '2024-05-20', image: 'https://picsum.photos/seed/artbook/100/100' },
              { id: 'o2', name: '极客定制 T恤', status: 'delivered', date: '2023-11-11', image: 'https://picsum.photos/seed/shirt/100/100' },
            ] as OrderItem[]);
            break;
          
          case WalletTabId.BENEFITS:
            resolve([
              { id: 'b1', title: '高清下载', description: '支持 4K 分辨率图片下载', level: 'Lv.1', isUnlocked: true },
              { id: 'b2', title: '优先生成', description: '排队优先级提升 50%', level: 'Lv.2', isUnlocked: true },
              { id: 'b3', title: '专属客服', description: '1对1 技术支持', level: 'Lv.3', isUnlocked: false },
            ] as BenefitItem[]);
            break;

          default:
            // 其他 Tab 返回空数组模拟无数据
            resolve([]); 
        }
      }, delay);
    });
  }
};