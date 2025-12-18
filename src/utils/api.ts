// api.ts - 修改拦截器的类型定义
import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

interface Result<T = any> {
  code: number;
  message: string;
  data: T;
}

// 创建 axios 实例
const api = axios.create({
  baseURL: import.meta.env.PROD ? '/api' : 'http://localhost:8069/api', 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  const tenantId = 'default';
  config.headers['X-Tenant-ID'] = tenantId;
  
  return config;
});

// 关键修改：明确声明拦截器返回类型
api.interceptors.response.use(
  (response: AxiosResponse<Result<any>>) => {
    const { code, message, data } = response.data;

    if (code === 200) {
      return data; // 成功，只返回 data
    } else {
      const err = new Error(message || '请求失败');
      (err as any).response = {
        data: response.data, // 保留完整的 { code, message, data }
        status: response.status,
        headers: response.headers,
      };
      return Promise.reject(err);
    }
  },
  (error) => {
    // 网络错误、超时等（非业务错误）
    if (error.response) {
       if (error.response.status === 401) {
         console.warn('用户未登录或 Token 已过期');
       } else {
      // 注意：这里可能是 HTTP 500/404 等，不是业务 code ≠ 200
            const msg = error.response.data?.message || `服务器错误 ${error.response.status}`;
            alert(msg);
       }
    } else if (error.request) {
      alert('网络异常，请检查连接');
    } else {
      alert('请求配置错误');
      console.error('请求配置错误', error.message);
    }
    return Promise.reject(error); // 原样抛出
  }
);
export default api;