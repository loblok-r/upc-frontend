import React, { useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';
import type { LoginFormData, FormErrors } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface LoginLocationState {
  from?: string;
  returnTab?: string;
}

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
   const navigate = useNavigate();
   const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
    captcha: '',
    rememberMe: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Handle countdown for "Get Verification Code"
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleGetCode = () => {
    if (countdown === 0) {
      // Simulate API call to get code
      setCountdown(60);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FormErrors = {};

    if (!formData.username) newErrors.username = '请输入用户名或邮箱';
    if (!formData.password) newErrors.password = '请输入密码';
    if (!formData.captcha) newErrors.captcha = '请输入验证码';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setIsLoading(true);
    try {

      const requestBody = {
        username: formData.username,
        password: formData.password,
        captcha: formData.captcha, // 关键：前端 captcha 对应后端 code 字段
        // 注意：不需要 rememberMe 字段
      };

      // 调试信息：打印请求体
      console.log('登录请求体:', JSON.stringify(requestBody));
      console.log('发送到:', 'http://localhost:8069/api/user/login');
      // 调用登录 API
      const response = await fetch('http://localhost:8069/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      console.log('响应状态:', response.status);
      console.log('响应状态文本:', response.statusText);
      // 解析响应
      const result = await response.json();

      if (response.ok && result.code === 200) {
        console.log('登录成功，token:', result.data.token);

        // 调用全局 login 函数，更新状态
        login(result.data.token, result.data);
        //导航回原页面或首页
        const state = location.state as LoginLocationState | null;
        const from = state?.from || '/';
        const returnTab = state?.returnTab;
        navigate(from, { 
          replace: true, // 使用 replace 防止用户点浏览器的“后退”又回到登录页
          state: returnTab ? { activeTab: returnTab } : undefined 
        });
        
      } else {
        // 处理错误
        alert(result.msg || `登录失败: ${response.status}`);
      }
    } catch (error) {
      console.error('登录请求失败:', error);
      alert('网络请求失败，请检查网络连接');
    } finally {
      setIsLoading(false);
    }
    
  };

  return (
    <div className="relative w-full max-w-[420px] bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 sm:p-10 border border-white/50 animate-float">
      {/* Logo Section */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent select-none drop-shadow-sm">
          UPC
        </h1>
        <p className="text-gray-400 text-xs mt-2 tracking-widest uppercase">
          Universal Picture Composer
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Username Input */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700 ml-1">
            邮箱或用户名
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg bg-slate-50 border ${errors.username ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
              } focus:outline-none focus:ring-4 transition-all duration-200 text-gray-800 placeholder-gray-400 text-sm`}
            placeholder="example@upc.com"
          />
          {errors.username && <p className="text-xs text-red-500 ml-1">{errors.username}</p>}
        </div>

        {/* Password Input */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center ml-1">
            <label className="block text-sm font-medium text-gray-700">
              密码
            </label>
            <a href="#" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
              忘记密码?
            </a>
          </div>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg bg-slate-50 border ${errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
              } focus:outline-none focus:ring-4 transition-all duration-200 text-gray-800 placeholder-gray-400 text-sm tracking-widest`}
            placeholder="••••••••••••"
          />
          {errors.password && <p className="text-xs text-red-500 ml-1">{errors.password}</p>}
        </div>

        {/* Verification Code */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700 ml-1">
            验证码
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              name="captcha"
              value={formData.captcha}
              onChange={handleInputChange}
              className={`flex-1 px-4 py-3 rounded-lg bg-slate-50 border ${errors.captcha ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                } focus:outline-none focus:ring-4 transition-all duration-200 text-gray-800 placeholder-gray-400 text-sm`}
              placeholder="输入验证码"
            />
            <button
              type="button"
              onClick={handleGetCode}
              disabled={countdown > 0}
              className={`px-4 py-2 rounded-lg text-sm font-medium min-w-[110px] transition-all duration-200 ${countdown > 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                }`}
            >
              {countdown > 0 ? `${countdown}s 后重试` : '获取验证码'}
            </button>
          </div>
          {errors.captcha && <p className="text-xs text-red-500 ml-1">{errors.captcha}</p>}
        </div>

        {/* Remember Me & Register Link */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center space-x-2 cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="peer h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer appearance-none border transition-colors checked:bg-blue-600 checked:border-transparent"
              />
              <Check className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity left-0.5 top-0.5" strokeWidth={3} />
            </div>
            <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
              记住登录状态?
            </span>
          </label>

          <div className="text-sm">
            <span className="text-gray-400">新用户? </span>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onSwitchToRegister(); }}
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              注册账号
            </a>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform active:scale-[0.98] transition-all duration-200 flex items-center justify-center mt-4"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            '立即登录'
          )}
        </button>
      </form>

      {/* Footer Disclaimer */}
      <div className="mt-8 text-center space-y-2">
        <p className="text-[10px] text-gray-400">
          注册&登录即表示同意本站 <a href="#" className="hover:text-gray-600 underline">用户协议</a>、<a href="#" className="hover:text-gray-600 underline">隐私政策</a>
        </p>
        <p className="text-[10px] text-gray-300 font-light">
          &copy; 2025 upc All rights reserved
        </p>
      </div>
    </div>
  );
};