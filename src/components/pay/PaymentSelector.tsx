import React from 'react';
import type { PaymentMethod } from '../../types';
import { CreditCard, Wallet, QrCode, Banknote } from 'lucide-react';

interface PaymentSelectorProps {
  selected: string;
  onSelect: (id: string) => void;
}

export const PaymentSelector: React.FC<PaymentSelectorProps> = ({ selected, onSelect }) => {
  const methods: PaymentMethod[] = [
    { id: 'alipay', label: 'Alipay支付' },
    { id: 'paypal', label: 'PayPal' },
    { id: 'card', label: 'Credit Card' },
    { id: 'wechat', label: 'WeChat Pay' },
    { id: 'usdt', label: 'USDT' },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {methods.map((method) => {
        const isSelected = selected === method.id;
        return (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelect(method.id)}
            className={`
              flex-1 min-w-[100px] px-4 py-3 rounded-lg text-sm font-medium border
              transition-all duration-300 flex items-center justify-center gap-2
              ${isSelected 
                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }
            `}
          >
            {method.label}
          </button>
        );
      })}
    </div>
  );
};