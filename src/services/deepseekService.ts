// deepseekService.ts

import type { FormData, OrderDetails } from "../types";

export interface PaymentRequest {
  orderId: string;
  amount: number;
  description: string;
  userId: string;
  userName: string;
}

export interface PaymentResponse {
  success: boolean;
  orderId: string;
  qrCodeUrl: string;
  paymentUrl?: string;
  expiresAt?: string;
}

export interface PaymentStatusResponse {
  orderId: string;
  status: 'pending' | 'success' | 'failed' | 'expired';
  paidAt?: string;
  amount?: number;
}

// 生成微信支付二维码
export async function generateWechatQRCode(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
  const TEST_MODE = true;
  
  if (TEST_MODE) {
    // 测试模式下返回模拟数据
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          orderId: paymentRequest.orderId,
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
            `weixin://wxpay/bizpayurl?pr=${Math.random().toString(36).substr(2, 9)}`
          )}`,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        });
      }, 1000);
    });
  }
  
  // 生产环境调用真实API
  try {
    const response = await fetch('/api/payment/wechat/qrcode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentRequest)
    });
    
    if (!response.ok) {
      throw new Error(`支付请求失败: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('微信支付请求失败:', error);
    throw error;
  }
}

// 检查支付状态
export async function checkPaymentStatus(orderId: string): Promise<PaymentStatusResponse['status']> {
  const TEST_MODE = true;
  
  if (TEST_MODE) {
    // 测试模式下模拟支付状态
    return new Promise(resolve => {
      setTimeout(() => {
        // 模拟随机支付成功
        const random = Math.random();
        if (random > 0.7) {
          resolve('success');
        } else if (random > 0.9) {
          resolve('failed');
        } else {
          resolve('pending');
        }
      }, 1000);
    });
  }
  
  // 生产环境调用真实API
  try {
    const response = await fetch(`/api/payment/status/${orderId}`);
    
    if (!response.ok) {
      throw new Error(`支付状态查询失败: ${response.status}`);
    }
    
    const data: PaymentStatusResponse = await response.json();
    return data.status;
  } catch (error) {
    console.error('支付状态查询失败:', error);
    return 'failed';
  }
}

// 取消支付订单
export async function cancelPayment(orderId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/payment/cancel/${orderId}`, {
      method: 'POST'
    });
    
    return response.ok;
  } catch (error) {
    console.error('取消支付失败:', error);
    return false;
  }
}

export async function generateInvoiceSummary(
  formData: FormData,
  orderDetails: OrderDetails
): Promise<string> {
  
  // 前端测试阶段：直接返回模拟数据，不调用API
  // 如果你想测试API调用，可以临时将 TEST_MODE 设置为 false
  const TEST_MODE = true;
  
  if (TEST_MODE) {
    // 返回模拟的账单摘要
    return generateMockInvoiceSummary(formData, orderDetails);
  }
  
  // 生产环境：实际调用API
  try {
    const response = await fetch("/api/generate-invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        formData,
        orderDetails
      })
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    return data.summary || "服务器返回的摘要为空";
    
  } catch (error) {
    console.error("调用AI生成摘要失败:", error);
    
    // 如果API调用失败，返回一个友好的默认摘要
    return generateMockInvoiceSummary(formData, orderDetails);
  }
}

// 生成模拟账单摘要的函数
function generateMockInvoiceSummary(formData: FormData, orderDetails: OrderDetails): string {
  const now = new Date();
  const formattedDate = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  // 根据不同的订阅方案生成不同的摘要
  let planDescription = "";
  let features = "";
  
  switch (orderDetails.id) {
    case 'week':
      planDescription = "7天体验会员";
      features = "体验期内可享受所有高级功能，帮助您快速了解产品价值。";
      break;
    case 'month':
      planDescription = "月度会员";
      features = "解锁所有核心功能，适合需要灵活订阅的用户。";
      break;
    case 'year':
      planDescription = "年度会员";
      features = "最划算的选择，节省大量费用，包含所有高级功能和优先支持。";
      break;
    default:
      planDescription = orderDetails.planName;
      features = "享受产品提供的所有功能和服务。";
  }
  
  // 构建个性化的摘要
  const summary = `
尊敬的 ${formData.lastName}${formData.firstName} 先生/女士：

感谢您选择我们的 ${planDescription} 服务！

📋 订单详情：
• 订阅方案：${orderDetails.planName}
• 订单金额：${orderDetails.currency}${orderDetails.price.toFixed(2)}
• 订阅周期：${orderDetails.period}
• 订单时间：${formattedDate}

✨ 服务亮点：
${features}

${orderDetails.originalPrice ? `🎉 优惠信息：原价 ${orderDetails.currency}${orderDetails.originalPrice.toFixed(2)}，您节省了 ${orderDetails.currency}${(orderDetails.originalPrice - orderDetails.price).toFixed(2)}` : ''}

💡 温馨提示：
1. 服务将在支付成功后立即生效
2. ${orderDetails.billingText}
3. 如需帮助，请联系客服

再次感谢您的信任！
Loblok Saas UPC 团队
  `.trim();
  
  return summary;
}

// 可选：如果你想更简单地切换模式，可以导出这个函数
export function setTestMode(enabled: boolean) {
  // 你可以创建一个全局配置对象或使用环境变量
  console.log(`测试模式已${enabled ? '启用' : '禁用'}`);
}