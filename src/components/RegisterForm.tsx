import React, { useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';
import type{ RegisterFormData, FormErrors } from '../types';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
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
  const [countdown, setCountdown] = useState(0);

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
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleGetCode = () => {
    if (countdown === 0) {
      setCountdown(60);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: FormErrors = {};

    if (!formData.username) newErrors.username = '请输入用户名';
    if (!formData.email) newErrors.email = '请输入邮箱地址';
    if (!formData.password) newErrors.password = '请输入密码';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = '两次密码输入不一致';
    if (!formData.captcha) newErrors.captcha = '请输入验证码';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = '请阅读并同意用户协议';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('模拟注册成功! (Simulated Registration Success)');
      onSwitchToLogin();
    }, 1500);
  };

  return (
    <div className="relative w-full max-w-[420px] bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 sm:p-10 border border-white/50 animate-float">
      {/* Logo Section */}
      <div className="text-center mb-6">
        <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent select-none drop-shadow-sm">
          UPC
        </h1>
        <p className="text-gray-400 text-xs mt-2 tracking-widest uppercase">
          Universal Picture Composer
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Username */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 ml-1">用户名*</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg bg-slate-50 border ${
              errors.username ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
            } focus:outline-none focus:ring-4 transition-all duration-200 text-gray-800 placeholder-gray-400 text-sm`}
            placeholder="设置您的用户名"
          />
          {errors.username && <p className="text-xs text-red-500 ml-1">{errors.username}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 ml-1">邮箱*</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg bg-slate-50 border ${
              errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
            } focus:outline-none focus:ring-4 transition-all duration-200 text-gray-800 placeholder-gray-400 text-sm`}
            placeholder="example@upc.com"
          />
          {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 ml-1">密码*</label>
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

        {/* Confirm Password */}
        <div className="space-y-1">
           <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg bg-slate-50 border ${
              errors.confirmPassword ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
            } focus:outline-none focus:ring-4 transition-all duration-200 text-gray-800 placeholder-gray-400 text-sm tracking-widest`}
            placeholder="确认输入密码"
          />
           {errors.confirmPassword && <p className="text-xs text-red-500 ml-1">{errors.confirmPassword}</p>}
        </div>

        {/* Verification Code */}
        <div className="space-y-1">
          <div className="flex gap-3">
            <input
              type="text"
              name="captcha"
              value={formData.captcha}
              onChange={handleInputChange}
              className={`flex-1 px-4 py-3 rounded-lg bg-slate-50 border ${
                errors.captcha ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
              } focus:outline-none focus:ring-4 transition-all duration-200 text-gray-800 placeholder-gray-400 text-sm`}
              placeholder="验证码"
            />
            <button
              type="button"
              onClick={handleGetCode}
              disabled={countdown > 0}
              className={`px-4 py-2 rounded-lg text-sm font-medium min-w-[110px] transition-all duration-200 ${
                countdown > 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
              }`}
            >
              {countdown > 0 ? `${countdown}s 重试` : '获取验证码'}
            </button>
          </div>
          {errors.captcha && <p className="text-xs text-red-500 ml-1">{errors.captcha}</p>}
        </div>

        {/* Footer Links */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center space-x-2 cursor-pointer group">
             <div className="relative flex items-center">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="peer h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer appearance-none border transition-colors checked:bg-blue-600 checked:border-transparent"
              />
              <Check className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity left-0.5 top-0.5" strokeWidth={3} />
            </div>
            <span className="text-xs text-gray-600 group-hover:text-gray-800 transition-colors">
              同意用户协议
            </span>
          </label>
           
          <div className="text-sm">
            <span className="text-gray-400">已有账号? </span>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}
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
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform active:scale-[0.98] transition-all duration-200 flex items-center justify-center mt-2"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : '立即注册'}
        </button>
      </form>

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