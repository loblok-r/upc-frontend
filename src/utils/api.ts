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
  baseURL: 'http://localhost:8069/api',
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
  // 第一个参数：成功处理函数
  (response: AxiosResponse<Result<any>>) => {
    const { code, message, data } = response.data;

    if (code === 200) {
      // 返回 data，并告诉 TypeScript 这是 any 类型
      return data as any;
    } else {
      return Promise.reject(new Error(message || '请求失败'));
    }
  },
  // 第二个参数：错误处理函数
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const msg = data?.message || `请求错误 ${status}`;
      alert(msg);
    } else if (error.request) {
      alert('网络异常，请检查连接');
    } else {
      alert('请求配置错误');
    }
    return Promise.reject(error);
  }
);

export default api;