import React, { useState, useEffect } from 'react';
import { Check, Loader2, AlertCircle } from 'lucide-react'; // 新增图标
import type { LoginFormData, FormErrors } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api'; 

interface LoginLocationState {
  from?: string;
  returnTab?: string;
}

interface LoginFormProps {

  onSwitchToForgot: () => void; // 新增
  onSwitchToRegister: () => void;
  // 可选：接收注册页传过来的预填充邮箱
  initialEmail?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onSwitchToForgot,
  onSwitchToRegister,
  initialEmail = ''
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    username: initialEmail || '', // 如果有传参，自动填充
    password: '',
    captcha: '',
    rememberMe: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isSendingCode, setIsSendingCode] = useState(false);

  // UI 反馈状态
  const [successMessage, setSuccessMessage] = useState('');
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 当 props 中的 initialEmail 变化时更新表单（可选）
  useEffect(() => {
    if (initialEmail) {
      setFormData(prev => ({ ...prev, username: initialEmail }));
    }
  }, [initialEmail]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // 输入时清除对应的字段错误
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    // 输入时清除全局 API 错误
    if (apiError) setApiError('');
  };

  // 获取验证码
  const handleGetCode = async () => {
    if (countdown > 0) return;

    // 这里假设逻辑是：验证码必须发送到邮箱。
    // 如果允许用户名登录，你需要判断用户输入的是不是邮箱。
    // 如果输入的是用户名，通常后端无法发送验证码（除非后端能通过用户名查到邮箱）。
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.username) {
      setErrors(prev => ({ ...prev, username: '请输入邮箱地址' }));
      return;
    }

    if (!emailRegex.test(formData.username)) {
      setErrors(prev => ({ ...prev, username: '获取验证码需要输入有效的邮箱地址' }));
      return;
    }

    setIsSendingCode(true);
    setApiError(''); // 清除旧错误

    try {
        // api.post 自动处理 JSON stringify 和 header
          const result = await api.post('/auth/sendCode', {
            email: formData.username as string,
            type: 'register'
          }) as any;
          
        setCountdown(60);
        setSuccessMessage('验证码已发送，请查收');
        setTimeout(() => setSuccessMessage(''), 5000);
      
    } catch (error) {
      setApiError('网络连接失败，无法发送验证码');
    } finally {
      setIsSendingCode(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 逻辑调整：如果是"邮箱或用户名"，这里不应该强校验 emailRegex
    // 但鉴于你的后端接口字段叫 `email`，且有验证码逻辑，暂时保留严格校验
    // 建议：如果你想支持用户名登录，这里要放宽逻辑，并且后端接口要支持传 username
    if (!formData.username.trim()) {
      newErrors.username = '请输入账号';
    } else if (!emailRegex.test(formData.username)) {
      // 如果你确定只支持邮箱登录，请把 Label 改成 "邮箱"
      newErrors.username = '请输入有效的邮箱地址';
    }

    if (!formData.password) {
      newErrors.password = '请输入密码';
    }

    if (!formData.captcha.trim()) {
      newErrors.captcha = '请输入验证码';
    } else if (!/^\d{4,6}$/.test(formData.captcha)) {
      newErrors.captcha = '验证码格式错误';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const requestBody = {
        email: formData.username, // 注意：如果后端支持用户名，这里字段名可能需要改
        password: formData.password,
        code: formData.captcha,
      };

      // 使用 api.ts 进行登录请求
      const result = await api.post('/user/login', requestBody) as any;
      console.log(result);
      
      console.log('登录成功');
      login(result.token, result);
      const state = location.state as LoginLocationState | null;
      const from = state?.from || '/';
      const returnTab = state?.returnTab;

      navigate(from, {
        replace: true,
        state: returnTab ? { activeTab: returnTab } : undefined
      });
    } catch (error: any) {
      console.error('登录请求失败:', error);
      const errorMsg = error.response?.data?.message || error.message || '网络连接异常，请稍后重试';
      setApiError(errorMsg);
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

      {apiError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-600">{apiError}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-600">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Username Input */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700 ml-1">
            邮箱账号
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


        <div className="space-y-1.5">
          <div className="flex justify-between items-center ml-1">
            <label className="block text-sm font-medium text-gray-700">密码</label>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSwitchToForgot();
              }}
              className="text-xs text-gray-500 hover:text-blue-600 transition-colors"
            >
              忘记密码?
            </a>
          </div>
          
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg bg-slate-50 border ${
              errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
            } focus:outline-none focus:ring-4 transition-all duration-200 text-gray-800 placeholder-gray-400 text-sm tracking-widest`}
            placeholder="••••••••••••"
          />
          {errors.password && <p className="text-xs text-red-500 ml-1">{errors.password}</p>}
        </div>

        {/* Verification Code */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700 ml-1">验证码</label>
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
              disabled={countdown > 0 || isSendingCode || isLoading}
              className={`px-4 py-2 rounded-lg text-sm font-medium min-w-[110px] transition-all duration-200 ${countdown > 0 || isSendingCode || isLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-100 hover:bg-blue-200 text-blue-600 hover:text-blue-700'
                }`}
            >
              {isSendingCode ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : countdown > 0 ? (
                `${countdown}s 重试`
              ) : (
                '获取验证码'
              )}
            </button>
          </div>
          {errors.captcha && <p className="text-xs text-red-500 ml-1">{errors.captcha}</p>}
        </div>

        {/* Footer Actions */}
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
              记住登录状态
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform active:scale-[0.98] transition-all duration-200 flex items-center justify-center mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : '立即登录'}
        </button>
      </form>

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