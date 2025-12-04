
import React, { useState } from 'react';
import type { FormData, OrderDetails } from '../../types';
import {
  Printer,
  Download,
  ChevronDown,
  CreditCard,
  AlertCircle,
  MessageCircle,
  ShieldCheck,
  Ban,
  X,
  Loader,
  CheckCircle,
  QrCode
} from 'lucide-react';

import { generateWechatQRCode, checkPaymentStatus } from '../../services/deepseekService';

interface InvoiceViewProps {
  formData: FormData;
  orderDetails: OrderDetails;
  invoiceSummary?: string;
  onBack: () => void;
}

const PaymentDropdown = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { id: 'wechat', label: '微信支付 WeChat Pay' },
    { id: 'alipay', label: 'Alipay支付' },
    { id: 'card', label: 'Credit Card' },
    { id: 'paypal', label: 'PayPal' },
    { id: 'CNYt', label: 'CNYT' },
  ];

  const selectedLabel = options.find(o => o.id === value)?.label || value;

  return (
    <div className="relative mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-800/50 border border-slate-600 text-white rounded-lg px-4 py-3 flex items-center justify-between hover:border-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      >
        <span className="flex items-center gap-2">
          <CreditCard size={16} className="text-slate-400" />
          {selectedLabel}
        </span>
        <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-20 overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.id}
              className="w-full text-left px-4 py-3 text-slate-200 hover:bg-slate-700 transition-colors flex items-center gap-2"
              onClick={() => {
                onChange(opt.id);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const InvoiceView: React.FC<InvoiceViewProps> = ({ formData, orderDetails, invoiceSummary, onBack }) => {
  const [paymentMethod, setPaymentMethod] = useState(formData.paymentMethod);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [invoiceStatus, setInvoiceStatus] = useState<'unpaid' | 'paid'>('unpaid');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'failed'>('idle');
  const [orderId, setOrderId] = useState<string>('');
  const invoiceId = React.useMemo(() => Math.floor(Math.random() * 8999999) + 1000000, []);


  // 处理立即支付按钮点击
  const handlePayNow = async () => {
    if (paymentMethod === 'wechat') {
      setShowPaymentModal(true);
      setPaymentStatus('loading');

      try {
        // 调用后端接口生成微信支付订单和二维码
        const paymentData = await generateWechatQRCode({
          orderId: `INV-${invoiceId}`,
          amount: orderDetails.price,
          description: orderDetails.planName,
          userId: formData.email,
          userName: `${formData.lastName}${formData.firstName}`
        });

        setQrCodeUrl(paymentData.qrCodeUrl);
        setOrderId(paymentData.orderId);
        setPaymentStatus('idle');

        // 开始轮询支付状态
        startPollingPaymentStatus(paymentData.orderId);

      } catch (error) {
        console.error('生成支付二维码失败:', error);
        setPaymentStatus('failed');
      }
    } else {
      // 处理其他支付方式
      alert(`正在跳转到${paymentMethod === 'alipay' ? '支付宝' : '其他'}支付`);
    }
  };

  // 轮询支付状态
  const startPollingPaymentStatus = (orderId: string) => {
    const intervalId = setInterval(async () => {
      try {
        const status = await checkPaymentStatus(orderId);

        if (status === 'success') {
          clearInterval(intervalId);
          setPaymentStatus('success');

          // 更新账单状态为已支付
          setInvoiceStatus('paid');
          // 支付成功后3秒关闭模态框
          setTimeout(() => {
            setShowPaymentModal(false);
            // 可以跳转到成功页面或更新账单状态
            alert('支付成功！');
          }, 3000);
        } else if (status === 'failed') {
          clearInterval(intervalId);
          setPaymentStatus('failed');
        }
        // 如果状态还是pending，继续轮询
      } catch (error) {
        console.error('检查支付状态失败:', error);
      }
    }, 3000); // 每3秒检查一次

    // 组件卸载时清理定时器
    return () => clearInterval(intervalId);
  };

  // 支付模态框组件
  const PaymentModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">

        {/* 关闭按钮 */}
        <button
          onClick={() => setShowPaymentModal(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white z-10"
        >
          <X size={24} />
        </button>

        {/* 头部 */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <QrCode className="text-green-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">微信扫码支付</h2>
              <p className="text-slate-400 text-sm">请使用微信扫描下方二维码完成支付</p>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-6">
          {/* 支付信息 */}
          <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400">订单号</span>
              <span className="text-white font-mono">{orderId || `INV-${invoiceId}`}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">支付金额</span>
              <span className="text-2xl font-bold text-green-400">
                {orderDetails.currency}{orderDetails.price.toFixed(2)}
              </span>
            </div>
          </div>

          {/* 二维码区域 */}
          <div className="flex flex-col items-center">
            {paymentStatus === 'loading' ? (
              <div className="w-64 h-64 flex items-center justify-center bg-slate-800/50 rounded-xl">
                <Loader className="animate-spin text-indigo-400" size={48} />
                <p className="mt-4 text-slate-400">正在生成支付二维码...</p>
              </div>
            ) : paymentStatus === 'failed' ? (
              <div className="w-64 h-64 flex flex-col items-center justify-center bg-red-500/10 rounded-xl border border-red-500/30">
                <AlertCircle className="text-red-400 mb-4" size={48} />
                <p className="text-red-400">生成二维码失败</p>
                <button
                  onClick={handlePayNow}
                  className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  重试
                </button>
              </div>
            ) : paymentStatus === 'success' ? (
              <div className="w-64 h-64 flex flex-col items-center justify-center bg-green-500/10 rounded-xl border border-green-500/30">
                <CheckCircle className="text-green-400 mb-4" size={48} />
                <p className="text-green-400 text-lg font-bold">支付成功！</p>
                <p className="text-slate-400 mt-2">正在跳转...</p>
              </div>
            ) : qrCodeUrl ? (
              <>
                <div className="w-64 h-64 p-4 bg-white rounded-xl shadow-lg">
                  <img
                    src={qrCodeUrl}
                    alt="微信支付二维码"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="mt-4 flex items-center gap-2 text-yellow-400 bg-yellow-500/10 px-4 py-2 rounded-lg">
                  <AlertCircle size={16} />
                  <span className="text-sm">二维码有效时间：15分钟</span>
                </div>
              </>
            ) : null}

            {/* 支付状态提示 */}
            <div className="mt-6 text-center">
              <p className="text-slate-400 text-sm">
                {paymentStatus === 'idle' && qrCodeUrl && "请使用微信扫描二维码支付"}
                {paymentStatus === 'loading' && "正在处理支付请求..."}
              </p>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="mt-8 flex gap-3">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="flex-1 py-3 px-4 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors"
            >
              取消支付
            </button>
            <button
              onClick={handlePayNow}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:opacity-90 transition-opacity font-medium"
            >
              刷新二维码
            </button>
          </div>
        </div>

        {/* 底部提示 */}
        <div className="p-4 bg-slate-900/50 border-t border-slate-700">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={12} />
            <span>本支付由微信支付提供安全加密服务</span>
          </div>
        </div>
      </div>
    </div>
  );
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + 1);
  const dueDateStr = dueDate.toISOString().split('T')[0];

  // Calculate end date for subscription
  const subEndDate = new Date(today);
  subEndDate.setMonth(subEndDate.getMonth() + 1);
  const subEndDateStr = subEndDate.toISOString().split('T')[0];

  const amount = orderDetails.price.toFixed(2);
  const total = amount;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 lg:p-8 font-sans relative overflow-x-hidden">

      {/* 支付模态框 */}
      {showPaymentModal && <PaymentModal />}
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none fixed"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none fixed"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none fixed"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">

        {/* Left Column: Invoice Details (Approx 70%) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-8 shadow-2xl relative overflow-hidden group">
            {/* Top Glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>

            {/* Header */}
            // 修改 Header 部分的代码
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/5 pb-8">
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
                  账单 <span className="text-slate-500">#{invoiceId}</span>
                </h1>
                <p className="text-slate-400 text-sm">
                  账单日期: {dateStr}
                  <span className="mx-2 text-slate-600">|</span>
                  {invoiceStatus === 'paid' ? (
                    <span className="text-green-400">
                      ✓ 已支付
                    </span>
                  ) : (
                    <span>缴费期限: {dueDateStr}</span>
                  )}
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                {invoiceStatus === 'paid' ? (
                  <div className="px-6 py-2 bg-green-500/10 border border-green-500/50 text-green-400 font-bold text-lg rounded md:rounded-lg tracking-wider shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                    已支付
                  </div>
                ) : (
                  <div className="px-6 py-2 bg-red-500/10 border border-red-500/50 text-red-400 font-bold text-lg rounded md:rounded-lg tracking-wider shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse-slow">
                    未付款
                  </div>
                )}
              </div>
            </div>

            {/* Addresses */}
            <div className="grid md:grid-cols-2 gap-12 mb-12">
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">支付给</h3>
                <div className="space-y-1 text-slate-200">
                  <p className="font-bold text-lg text-white">Loblok Saas UPC.</p>
                  <p>25 Broadway, 9th Floor</p>
                  <p>New York, NY 10004</p>
                  <p>United States</p>
                  <p className="text-indigo-400 mt-2">+1 (646) 389-3827</p>
                  <p className="text-indigo-400">https://loblok.io</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">付款人</h3>
                <div className="space-y-1 text-slate-200">
                  <p className="font-bold text-lg text-white">{formData.lastName} {formData.firstName}</p>
                  <p>{formData.email}</p>
                  <p className="text-slate-500 italic mt-2">China</p>
                  {invoiceSummary && (
                    <div className="mt-4 p-3 bg-indigo-900/20 border border-indigo-500/30 rounded text-xs text-indigo-200 leading-relaxed">
                      <span className="font-bold block mb-1 text-indigo-400">智能摘要:</span>
                      {invoiceSummary}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="mb-8">
              <div className="flex justify-between text-sm font-semibold text-slate-500 uppercase tracking-wider pb-4 border-b border-white/10">
                <span>描述</span>
                <span>单价</span>
              </div>
              <div className="py-6 border-b border-white/5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-medium text-lg mb-1">{orderDetails.planName} - 订阅服务</p>
                    <p className="text-slate-400 text-sm">
                      ({dateStr} - {subEndDateStr})
                    </p>
                    <p className="text-slate-500 text-xs mt-1">
                      devicefree: 0 x 1 Device {orderDetails.currency}0.30
                    </p>
                  </div>
                  <div className="text-white font-medium text-lg">
                    {orderDetails.currency}{amount} CNY
                  </div>
                </div>
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-3 pb-8 border-b border-white/5">
              <div className="flex justify-between text-slate-300">
                <span>小计</span>
                <span>{orderDetails.currency}{amount} CNY</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>账户余额</span>
                <span>{orderDetails.currency}0.00 CNY</span>
              </div>
            </div>

            <div className="flex justify-between items-center py-6 border-b border-white/5 bg-slate-800/30 -mx-8 px-8 mt-4">
              <span className="font-bold text-white">合计</span>
              <span className="font-bold text-xl text-white">{orderDetails.currency}{total} CNY</span>
            </div>

            {/* Transaction Grid */}
            <div className="grid grid-cols-4 gap-4 py-8 text-center text-sm border-b border-white/5 text-slate-400">
              <div>
                <p className="font-semibold text-slate-300 mb-1">交易日期</p>
                <p>{dateStr}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-300 mb-1">付款方式</p>
                <p className="uppercase">
                  {invoiceStatus === 'paid' ? '已支付' : paymentMethod}
                </p>
              </div>
              <div>
                <p className="font-semibold text-slate-300 mb-1">交易 ID</p>
                <p>{invoiceStatus === 'paid' ? `PAID-${invoiceId}` : `TXN-${Math.floor(Math.random() * 100000)}`}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-300 mb-1">支付状态</p>
                <p className={invoiceStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'}>
                  {invoiceStatus === 'paid' ? '已完成' : '待支付'}
                </p>
              </div>
            </div>

            <div className="py-6 text-center text-slate-500 text-sm">
              {invoiceStatus === 'paid'
                ? '支付已完成，感谢您的订阅！'
                : '找不到任何与此账单有关的交易'}
            </div>

            {/* Final Balance */}
            <div className="flex justify-between items-center pt-6 border-t border-white/10">
              <span className="font-bold text-slate-200">
                {invoiceStatus === 'paid' ? '已支付金额' : '未缴金额'}
              </span>
              <span className={`text-3xl font-bold ${invoiceStatus === 'paid' ? 'text-green-400' : 'text-white'}`}>
                {orderDetails.currency}{total} CNY
              </span>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-8">
              <button className="flex items-center gap-2 px-4 py-2 rounded border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors text-sm">
                <Printer size={16} /> 列印
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors text-sm">
                <Download size={16} /> 下载
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Actions (Approx 30%) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Payment Card */}
          <div className="bg-white rounded-xl p-6 shadow-xl border border-slate-200">
            {invoiceStatus === 'paid' ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="text-green-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">支付完成</h3>
                    <p className="text-slate-500 text-sm">您的订阅已激活</p>
                  </div>
                </div>
                <button
                  onClick={onBack}
                  className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg shadow-green-500/30 transition-all duration-300 hover:-translate-y-0.5 mb-2"
                >
                  返回上一步
                </button>
              </>
            ) : (
              <>
                <PaymentDropdown value={paymentMethod} onChange={setPaymentMethod} />
                <button
                  onClick={handlePayNow}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5 mb-2"
                >
                  立即支付
                </button>
              </>
            )}
            <p className="text-center text-xs text-slate-400 mt-2">
              {invoiceStatus === 'paid' ? '支付已完成' : '安全加密支付'}
            </p>
          </div>

          {/* Cancel Order Card */}
          <div className="bg-white rounded-xl p-6 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Ban size={18} className="text-slate-400" />
              取消订单
            </h3>
            <button
              onClick={onBack}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-red-500/20 transition-all duration-300 hover:-translate-y-0.5"
            >
              取消
            </button>
          </div>

          {/* Security Note */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
            <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-emerald-400 font-semibold text-sm">安全保障</h4>
              <p className="text-emerald-200/70 text-xs mt-1">
                您的交易受 256 位 SSL 加密保护。我们不会存储您的完整支付信息。
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Chat Widget */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/40 hover:scale-110 transition-transform duration-300 text-white">
          <MessageCircle size={28} />
        </button>
      </div>
    </div>
  );
};
