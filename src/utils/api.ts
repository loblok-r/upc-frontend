import axios  from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

// 假设后端返回格式为：
// { code: 200, message: "success", data: {...} }
interface Result<T> {
  code: number;
  message: string;
  data: T;
}

// 创建 axios 实例
const api = axios.create({
   baseURL: 'http://localhost:8069/api', // 所有接口以 /api 开头
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加 token 和 X-Tenant-ID
api.interceptors.request.use((config) => {
  // 从 localStorage 获取 token（请根据你的实际存储方式调整）
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 从 localStorage 或环境变量获取 tenantId
  const tenantId = 'default';
  config.headers['X-Tenant-ID'] = tenantId;

  return config;
});

// 响应拦截器：提取 data，并处理错误
api.interceptors.response.use(
  (response: AxiosResponse<Result<any>>) => {
    const { code, message, data } = response.data;

    // 假设 code === 200 表示成功（根据你的后端约定调整）
    if (code === 200) {
      return data; // 直接返回业务数据
    } else {
      // 抛出错误，可在调用处 catch
      return Promise.reject(new Error(message || '请求失败'));
    }
  },
  (error) => {
    // 网络错误或 HTTP 状态码非 2xx
    if (error.response) {
      // 服务器返回了错误状态（如 401, 500）
      const { status, data } = error.response;
      const msg = data?.message || `请求错误 ${status}`;
      alert(msg); // 可替换为 message.error() 等 UI 提示
    } else if (error.request) {
      alert('网络异常，请检查连接');
    } else {
      alert('请求配置错误');
    }
    return Promise.reject(error);
  }
);

export default api;