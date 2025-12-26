import React, { useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';
import type { RegisterFormData, FormErrors } from '../../types';
import api from '../../utils/api'; 

interface RegisterFormProps {
  onSwitchToLogin: (registeredEmail?: string) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    captcha: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [apiError, setApiError] = useState('');
  const [hasRegistered, setHasRegistered] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (hasRegistered) {
      const timer = setTimeout(() => {
        if (onSwitchToLogin) {
          onSwitchToLogin(formData.email);
        }
      }, 2000); 
      
      return () => clearTimeout(timer);
    }
  }, [hasRegistered, onSwitchToLogin]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (apiError) setApiError('');
  };

  const handleGetCode = async () => {
    if (countdown > 0) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      setErrors((prev) => ({ ...prev, email: '请输入有效的邮箱地址' }));
      return;
    }

    setIsSendingCode(true);
    setApiError('');

    try {
      await api.post('/user/sendCode', {
        email: formData.email,
        type: 'register'
      });

      setCountdown(60);
      setSuccessMessage('验证码已发送到您的邮箱，请注意查收');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || '发送验证码失败，请稍后重试';
      setApiError(errorMsg);
    } finally {
      setIsSendingCode(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;

    if (!formData.username.trim()) {
      newErrors.username = '请输入用户名';
    } else if (formData.username.length < 3 || formData.username.length > 20) {
      newErrors.username = '用户名长度应为3-20个字符';
    }

    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱地址';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = '邮箱格式不正确';
    }

    if (!formData.password) {
      newErrors.password = '请输入密码';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = '密码至少6位，需包含字母和数字';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认密码';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次密码输入不一致';
    }

    if (!formData.captcha.trim()) {
      newErrors.captcha = '请输入验证码';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = '请阅读并同意用户协议';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setSuccessMessage('');
    setHasRegistered(false);
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const requestData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        code: formData.captcha.trim(),
      };

      const result = await api.post('/user/register', requestData) as any;

      if (result) {
        const successMsg = result.msg || '注册成功！即将跳转到登录页面...';
        setSuccessMessage(successMsg);
        setHasRegistered(true);
        
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          captcha: '',
          agreeToTerms: false,
        });
        
      } else {
         setApiError(result.msg || '注册失败');
      }
    } catch (error: any) {
      console.error('注册失败:', error);
      let msg = '网络错误';
      if(error.response?.data?.message) msg = error.response.data.message;
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSwitchToLogin = () => {
    if (onSwitchToLogin) {
      onSwitchToLogin();
    }
  };

  return (
    <div className="relative w-full max-w-[420px] bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-6 md:p-10 border border-white/50 animate-float">
      <div className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent select-none drop-shadow-sm">
          UPC
        </h1>
        <p className="text-gray-400 text-xs mt-2 tracking-widest uppercase">
          Universal Picture Composer
        </p>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600 text-center">{successMessage}</p>
          <p className="text-xs text-green-500 text-center mt-1">
            自动切换到登录页面...
          </p>
        </div>
      )}

      {apiError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 text-center">{apiError}</p>
        </div>
      )}

      {!hasRegistered ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 ml-1">用户名*</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              disabled={isLoading}
              className={`w-full px-4 py-3 rounded-lg bg-slate-50 border ${
                errors.username ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
              } focus:outline-none focus:ring-4 transition-all duration-200 text-gray-800 placeholder-gray-400 text-sm disabled:opacity-50`}
              placeholder="3-20个字符"
            />
            {errors.username && <p className="text-xs text-red-500 ml-1">{errors.username}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 ml-1">邮箱*</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isLoading}
              className={`w-full px-4 py-3 rounded-lg bg-slate-50 border ${
                errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
              } focus:outline-none focus:ring-4 transition-all duration-200 text-gray-800 placeholder-gray-400 text-sm disabled:opacity-50`}
              placeholder="example@upc.com"
            />
            {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 ml-1">密码*</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={isLoading}
              className={`w-full px-4 py-3 rounded-lg bg-slate-50 border ${
                errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
              } focus:outline-none focus:ring-4 transition-all duration-200 text-gray-800 placeholder-gray-400 text-sm tracking-widest disabled:opacity-50`}
              placeholder="至少6位"
            />
            {errors.password && <p className="text-xs text-red-500 ml-1">{errors.password}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 ml-1">确认密码*</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={isLoading}
              className={`w-full px-4 py-3 rounded-lg bg-slate-50 border ${
                errors.confirmPassword ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
              } focus:outline-none focus:ring-4 transition-all duration-200 text-gray-800 placeholder-gray-400 text-sm tracking-widest disabled:opacity-50`}
              placeholder="再次输入密码"
            />
            {errors.confirmPassword && <p className="text-xs text-red-500 ml-1">{errors.confirmPassword}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 ml-1">验证码*</label>
            <div className="flex gap-3">
              <input
                type="text"
                name="captcha"
                value={formData.captcha}
                onChange={handleInputChange}
                disabled={isLoading}
                maxLength={6}
                className={`flex-1 px-4 py-3 rounded-lg bg-slate-50 border ${
                  errors.captcha ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                } focus:outline-none focus:ring-4 transition-all duration-200 text-gray-800 placeholder-gray-400 text-sm disabled:opacity-50`}
                placeholder="请输入验证码"
              />
              <button
                type="button"
                onClick={handleGetCode}
                disabled={countdown > 0 || isSendingCode || isLoading}
                className={`px-4 py-2 rounded-lg text-sm font-medium min-w-[100px] md:min-w-[110px] transition-all duration-200 ${
                  countdown > 0 || isSendingCode || isLoading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-100 hover:bg-blue-200 text-blue-600 hover:text-blue-700'
                }`}
              >
                {isSendingCode ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : countdown > 0 ? (
                  `${countdown}s`
                ) : (
                  '获取验证码'
                )}
              </button>
            </div>
            {errors.captcha && <p className="text-xs text-red-500 ml-1">{errors.captcha}</p>}
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="peer h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer appearance-none border transition-colors checked:bg-blue-600 checked:border-transparent disabled:opacity-50"
                />
                <Check className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity left-0.5 top-0.5" strokeWidth={3} />
              </div>
              <span className={`text-xs text-gray-600 group-hover:text-gray-800 transition-colors ${isLoading ? 'opacity-50' : ''}`}>
                同意用户协议
              </span>
            </label>
            
            <div className="text-sm">
              <span className="text-gray-400">已有账号? </span>
              <a 
                href="#" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  handleManualSwitchToLogin();
                }}
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                登录账号
              </a>
            </div>
          </div>
          {errors.agreeToTerms && <p className="text-xs text-center text-red-500">{errors.agreeToTerms}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform active:scale-[0.98] transition-all duration-200 flex items-center justify-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : '立即注册'}
          </button>
        </form>
      ) : (
        <div className="text-center py-8">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" strokeWidth={3} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">注册成功！</h3>
            <p className="text-gray-600 mb-4">您的账号已创建成功</p>
          </div>
        </div>
      )}

      <div className="mt-6 text-center space-y-2">
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