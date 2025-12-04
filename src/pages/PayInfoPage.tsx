import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Lock,
  User,
  Mail,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Input, TextArea } from '../components/Input';
import { InvoiceView } from '../components/InvoiceView';
import { PaymentSelector } from '../components/PaymentSelector';
import { generateInvoiceSummary } from '../services/deepseekService';
import type { FormData, OrderDetails } from '../types';

const PayInfoPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedPlan } = location.state || {};

  const [formData, setFormData] = useState<FormData>({
    firstName: '特曼',
    lastName: '奥',
    email: 'cjz0329@163.com',
    notes: '',
    paymentMethod: 'alipay',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceSummary, setInvoiceSummary] = useState<string>('');

  // Use passed plan details or fallback to defaults
  const orderDetails: OrderDetails = selectedPlan || {
    id: 'month',
    planName: '月度会员',
    price: 19.99,
    originalPrice: 29.99,
    currency: '￥',
    billingText: '下个月自动续费',
    period: '月',
    badge: '省 34%',
    isPopular: false,
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentSelect = (id: string) => {
    setFormData(prev => ({ ...prev, paymentMethod: id }));
  };

  const handleSubmit = async () => {

    // 校验支付方式 - 只允许微信支付
    if (formData.paymentMethod !== 'wechat') {
      alert('目前只支持微信支付，请选择微信支付方式');
      return;
    }

    setIsLoading(true);
    try {
      // 调用AI生成账单摘要
      const result = await generateInvoiceSummary(formData, orderDetails);
      setInvoiceSummary(result || '感谢您的订阅！我们会尽快为您开通服务。');
    } catch (e) {
      console.error(e);
      // AI生成失败时，使用默认摘要
      setInvoiceSummary('感谢您的订阅！我们会尽快为您开通服务。');
    } finally {
      setIsLoading(false);
      // 无论成功失败，都显示账单页面
      setShowInvoice(true);
    }
  };

  const handleBack = () => {
    setShowInvoice(false);
    setInvoiceSummary('');
  };

  const handleBackClick = () => {
    navigate('/work');
  };

  // 如果显示账单页面 - 这是主要的渲染分支
  if (showInvoice) {
    return (
      <InvoiceView
        formData={formData}
        orderDetails={orderDetails}
        invoiceSummary={invoiceSummary}
        onBack={handleBack}
      />
    );
  }

  // 正常支付信息页面渲染（不再有 invoiceResult 的条件渲染）
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 font-sans">

      {/* Left Column: Order Summary (Dark Theme) */}
      <div className="w-full lg:w-[45%] bg-ai-dark text-white relative overflow-hidden flex flex-col p-6 lg:p-12">
        {/* Background Visuals */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-950 to-slate-950 z-0"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-20 z-0"></div>
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 z-0"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600 rounded-full blur-[120px] opacity-10 z-0"></div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div
            onClick={handleBackClick}
            className="flex items-center gap-4 mb-10 text-slate-400 hover:text-white cursor-pointer transition-colors w-fit"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium tracking-wide">返回</span>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-400 to-pink-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <RefreshCw size={16} className="text-white animate-spin-slow" />
              </div>
              <span className="font-semibold text-lg tracking-tight">订阅 {orderDetails.planName}</span>

              {/* 显示折扣标签 */}
              {orderDetails.badge && (
                <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-2 py-0.5 rounded border border-orange-500/20 ml-2">
                  {orderDetails.badge}
                </span>
              )}

              {/* 显示热门标签 */}
              {orderDetails.isPopular && (
                <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full ml-2">
                  最受欢迎
                </span>
              )}
            </div>

            <div className="mt-2 mb-12">
              <h1 className="text-5xl font-bold text-white tracking-tight flex items-baseline gap-2">
                {orderDetails.currency}{orderDetails.price.toFixed(2)}
                <span className="text-lg text-slate-400 font-normal">/ {orderDetails.period}</span>
              </h1>

              {/* 显示原价（如果有） */}
              {orderDetails.originalPrice && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-slate-400 line-through decoration-slate-400">
                    原价: {orderDetails.currency}{orderDetails.originalPrice.toFixed(2)}
                  </span>
                  {orderDetails.badge && (
                    <span className="text-xs text-orange-400 font-medium">
                      {orderDetails.badge}
                    </span>
                  )}
                </div>
              )}

              {/* 显示计费说明 */}
              <p className="text-sm text-slate-400 mt-3">
                {orderDetails.billingText}
              </p>
            </div>

            {/* Line Item */}
            <div className="flex justify-between items-center py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-white text-slate-900 font-bold flex items-center justify-center text-xs">
                  {orderDetails.id === 'year' ? '年' : orderDetails.id === 'month' ? '月' : '周'}
                </div>
                <div>
                  <p className="font-medium text-slate-100">{orderDetails.planName}</p>
                  <p className="text-xs text-slate-400">{orderDetails.billingText}</p>
                </div>
              </div>
              <span className="font-medium">{orderDetails.currency}{orderDetails.price.toFixed(2)}</span>
            </div>

            {/* Subtotal */}
            <div className="flex justify-between items-center py-4 text-slate-300">
              <span>小计</span>
              <span>{orderDetails.currency}{orderDetails.price.toFixed(2)}</span>
            </div>

            {/* Promo Code */}
            <div className="mt-4 flex gap-3">
              <input
                type="text"
                placeholder="添加促销码"
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-500 flex-1 focus:outline-none focus:border-indigo-400 transition-colors"
              />
              <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10 transition-colors">
                应用
              </button>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
              <span className="text-slate-300">今日应付合计</span>
              <span className="text-2xl font-bold text-white">{orderDetails.currency}{orderDetails.price.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-12 text-xs text-slate-500">
            © 2025 Loblok Saas UPC. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Column: Payment Form (Light/Glass Tech Theme) */}
      <div className="w-full lg:w-[55%] p-6 lg:p-16 overflow-y-auto bg-slate-50 flex flex-col">

        <div className="max-w-xl mx-auto w-full space-y-10">

          {/* Section: Payment Info */}
          <section>
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
              支付详细信息
            </h2>
            <PaymentSelector
              selected={formData.paymentMethod}
              onSelect={handlePaymentSelect}
            />

            {/* 添加支付方式提示 */}
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2 text-amber-700 text-sm">
                <div className="bg-amber-100 p-1 rounded">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">重要提示</p>
                  <p className="text-amber-600 text-xs mt-0.5">
                    目前测试阶段仅支持微信支付。选择其他支付方式将无法完成支付。
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Personal Info */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
              个人信息
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="名字"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="San"
                icon={User}
              />
              <Input
                label="姓氏"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Zhang"
              />
            </div>
            <Input
              label="电子邮件地址"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="example@email.com"
              icon={Mail}
            />
          </section>

          {/* Section: Notes */}
          <section>
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
              附加备注
            </h2>
            <TextArea
              placeholder="您可以在此输入任何您希望提供与此订单相关的备注资讯..."
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
            />
          </section>

          {/* Security Badge */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-4 flex items-center gap-3 text-emerald-800 text-sm">
            <div className="bg-emerald-100 p-2 rounded-full">
              <Lock size={16} className="text-emerald-600" />
            </div>
            <span>该订单将在安全的网络环境下进行，以确保资讯安全。</span>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`
                w-full py-4 px-6 rounded-xl font-bold text-white text-lg tracking-wide shadow-lg
                transform transition-all duration-300
                bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500
                hover:shadow-indigo-500/25 hover:-translate-y-0.5 active:translate-y-0
                disabled:opacity-70 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 relative overflow-hidden group
              `}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="animate-spin" />
                  生成账单
                </>
              ) : (
                <>
                  <span className="relative z-10">生成账单</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </>
              )}
            </button>
            <p className="text-xs text-slate-400 text-center mt-4 px-4 leading-relaxed">
              点击生成账单即表示您授权 Loblok Saas UPC 根据条款向您收费，直至您取消订阅。
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-center items-center gap-6 text-xs text-slate-400 mt-8 pb-8">
            <div className="flex items-center gap-1">
              <ShieldCheck size={12} />
              <span>Powered by <strong className="text-slate-600">Stripe</strong></span>
            </div>
            <a href="#" className="hover:text-indigo-500 transition-colors">条款</a>
            <a href="#" className="hover:text-indigo-500 transition-colors">隐私</a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PayInfoPage;