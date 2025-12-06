import { AppMode, ServiceResponse } from '../types';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * MOCK LOCAL SERVICE
 * This service simulates a backend API. In a real app, these would be fetch/axios calls.
 */
export const mockAiService = {
  
  // Generic handler to route requests based on mode
  processRequest: async (mode: AppMode, prompt: string): Promise<ServiceResponse> => {
    // Simulate thinking time (2-4 seconds)
    await delay(2500);

    switch (mode) {
      case AppMode.AI_IMAGE:
        return mockAiService.generateImage(prompt);
      case AppMode.TEXT_CHAT:
        return mockAiService.generateText(prompt);
      case AppMode.WRITING_ASSISTANT:
        return { success: true, data: { text: `基于您的输入 "${prompt}" 优化的草稿内容...\n[模拟内容]` } };
      case AppMode.DEEP_SEARCH:
        return { success: true, data: { text: `关于 "${prompt}" 的深度搜索结果：\n1. 来源 A (2024)\n2. 来源 B (权威分析)` } };
      default:
        return { success: true, data: { text: "该功能即将上线。" } };
    }
  },

  // Specific Mock for Image Generation
  generateImage: async (prompt: string): Promise<ServiceResponse> => {
    // Use picsum for random pleasing images, seeded by prompt length to stay consistent-ish
    const width = 800;
    const height = 500;
    // Using a reliable placeholder service
    const imageUrl = `https://picsum.photos/${width}/${height}?random=${Date.now()}`;

    return {
      success: true,
      data: {
        imageUrl: imageUrl,
        description: "图像已生成。",
        model: "Nano Banana Pro" 
      }
    };
  },

  // Specific Mock for Text
  generateText: async (prompt: string): Promise<ServiceResponse> => {
    return {
      success: true,
      data: {
        text: `这是针对 "${prompt}" 的回复。这是一个来自本地服务的模拟文本生成响应。`
      }
    };
  }
};