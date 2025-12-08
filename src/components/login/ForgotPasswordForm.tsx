import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Loader2, AlertCircle, KeyRound } from 'lucide-react';

interface ForgotPasswordData {
    email: string;
    newPassword: string;
    confirmNewPassword: string;
    code: string;
}

interface FormErrors {
    email?: string;
    newPassword?: string;
    confirmNewPassword?: string;
    code?: string;
}

interface ForgotPasswordFormProps {
    onSwitchToLogin: () => void;
}

const API_BASE_URL = 'http://localhost:8069/api';

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSwitchToLogin }) => {
    const [formData, setFormData] = useState<ForgotPasswordData>({
        email: '',
        newPassword: '',
        confirmNewPassword: '',
        code: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [apiError, setApiError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
        if (apiError) setApiError('');
    };

    const handleGetCode = async () => {
        if (countdown > 0) return;
        const emailRegex = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            setErrors((prev) => ({ ...prev, email: '请输入有效的邮箱地址' }));
            return;
        }

        setIsSendingCode(true);
        setApiError('');

        try {
            const response = await fetch(`${API_BASE_URL}/auth/sendCode`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, type: 'forgot' }),
            });

            const result = await response.json();
            if (response.ok && result.code === 200) {
                setCountdown(60);
            } else {
                setApiError(result.msg || '验证码发送失败');
            }
        } catch (error) {
            setApiError('网络错误');
        } finally {
            setIsSendingCode(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        const emailRegex = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        const passwordRegex = /^[a-zA-Z0-9]{6,20}$/;
        const codeRegex = /^\d{6}$/;

        if (!emailRegex.test(formData.email)) newErrors.email = '请输入正确的邮箱';
        if (!formData.newPassword) newErrors.newPassword = '密码不可以为空';
        else if (!passwordRegex.test(formData.newPassword)) newErrors.newPassword = '密码格式错误 (6-20位字母或数字)';
        if (!formData.confirmNewPassword) newErrors.confirmNewPassword = '确认密码不可以为空';
        else if (formData.newPassword !== formData.confirmNewPassword) newErrors.confirmNewPassword = '两次输入的密码不一致';
        if (!codeRegex.test(formData.code)) newErrors.code = '请输入6位数字验证码';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/user/resetPassword`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    newPassword: formData.newPassword,
                    confirmNewPassword: formData.confirmNewPassword,
                    code: formData.code
                }),
            });
            const result = await response.json();
            if (response.ok && result.code === 200) {
                setIsSuccess(true);
                setTimeout(() => onSwitchToLogin(), 3000);
            } else {
                setApiError(result.msg || '重置密码失败');
            }
        } catch (error) {
            setApiError('网络连接异常');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="relative z-[100] w-full max-w-[420px] bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-10 border border-white/50 animate-float text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-8 h-8 text-green-600" strokeWidth={3} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">密码重置成功</h2>
                <button onClick={onSwitchToLogin} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-all">立即登录</button>
            </div>
        );
    }

    return (
        // 🔥 修改1：外层加上 z-50
        <div className="relative z-50 w-full max-w-[420px] bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 sm:p-10 border border-white/50 animate-float">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">重置密码</h1>
                <p className="text-gray-400 text-xs mt-2">Reset Password</p>
            </div>

            {apiError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-600">{apiError}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

                <div className="hidden h-0 overflow-hidden opacity-0">
                    <input type="text" name="fake_email" autoComplete="username" />
                    <input type="password" name="fake_password" autoComplete="new-password" />
                </div>
                {/* Email */}
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 ml-1">邮箱地址</label>
                    <input
                        type="email"
                        name="email"
                        // 🔥 修改2：确保 value 永远不为 null
                        value={formData.email || ''}
                        onChange={(e) => {
                            handleInputChange(e);
                            if (countdown > 0) setCountdown(0);
                        }}
                        disabled={isLoading}
                        // 🔥 修改3：加上 relative z-[100] 确保它浮在最上面
                        className={`relative z-[100] w-full px-4 py-3 rounded-lg bg-slate-50 border ${errors.email ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'} focus:outline-none focus:ring-4 transition-all duration-200 text-gray-800 placeholder-gray-400 text-sm`}
                        placeholder="请输入注册邮箱"
                    />
                    {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email}</p>}
                </div>

                {/* Verification Code */}
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 ml-1">验证码*</label>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            maxLength={6}
                            className={`flex-1 px-4 py-3 rounded-lg bg-slate-50 border ${errors.code ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                                } focus:outline-none focus:ring-4 transition-all duration-200 text-gray-800 placeholder-gray-400 text-sm disabled:opacity-50`}
                            placeholder="请输入邮箱收到的验证码"
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
                    {errors.code && <p className="text-xs text-red-500 ml-1">{errors.code}</p>}
                    <p className="text-xs text-gray-500 ml-1 mt-1">
                        验证码将发送到您的邮箱，有效期10分钟
                    </p>
                </div>


                {/* New Password */}
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 ml-1">密码*</label>
                    <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword || ''}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className={`w-full px-4 py-3 rounded-lg bg-slate-50 border ${errors.newPassword ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                            } focus:outline-none focus:ring-4 transition-all duration-200 text-gray-800 placeholder-gray-400 text-sm tracking-widest disabled:opacity-50`}
                        placeholder="至少6位，包含字母和数字"
                    />
                    {errors.newPassword && <p className="text-xs text-red-500 ml-1">{errors.newPassword}</p>}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 ml-1">确认密码*</label>
                    <input
                        type="password"
                        name="confirmNewPassword"
                        value={formData.confirmNewPassword || ''}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className={`relative z-[100] w-full px-4 py-3 rounded-lg bg-slate-50 border ${errors.confirmNewPassword ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                            } focus:outline-none focus:ring-4 transition-all duration-200 text-gray-800 placeholder-gray-400 text-sm tracking-widest disabled:opacity-50`}
                        placeholder="再次输入密码"
                    />
                    {errors.confirmNewPassword && <p className="text-xs text-red-500 ml-1">{errors.confirmNewPassword}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    // 🔥 修改8：按钮也加层级
                    className="relative z-[100] w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-lg shadow-lg hover:shadow-blue-500/50 transition-all mt-4 flex items-center justify-center"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : '重置并登录'}
                </button>
            </form>

            <div className="mt-6 text-center">
                <button
                    onClick={onSwitchToLogin}
                    className="relative z-[100] text-sm text-gray-500 hover:text-gray-800 flex items-center justify-center gap-1 mx-auto transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> 返回登录
                </button>
            </div>
        </div>
    );
};