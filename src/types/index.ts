export interface LoginFormData {
  username: string;
  password: string;
  captcha: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  captcha: string;
  agreeToTerms: boolean;
}

export interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  captcha?: string;
  agreeToTerms?: string;
}


export interface NavItem {
  label: string;
  href: string;
}

export interface HeroState {
  text: string;
  subText: string;
}

export const GenerationStatus = {
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR'
} as const;
export type GenerationStatus = typeof GenerationStatus[keyof typeof GenerationStatus];

export interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}

export const SidebarState = {
  EXPANDED: 'expanded',
  COLLAPSED: 'collapsed',
} as const;
export type SidebarState = typeof SidebarState[keyof typeof SidebarState];

export interface NavItem {
  id: string;
  label: string;
  icon: string;
}

export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingTier {
  name: string;
  type: 'Free' | 'Pro';
  features: PricingFeature[];
}

export interface ProductCard {
  id: string;
  title: string;
  subtitle: string;
  icon: string; // Name of lucide icon or image url
  color: string; // Tailwind color class for glow/icon
  badge?: string;
}

export interface Winner {
  username: string;
  prize: string;
  time: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export const LayoutSection = {
  HERO: 'hero',
  INFO: 'info',
} as const;
export type LayoutSection = typeof LayoutSection[keyof typeof LayoutSection];


export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  billingText: string;
  badge?: string;
  isPopular?: boolean;
}

export interface Benefit {
  title: string;
  description: string;
}

export interface PaymentMethod {
  id: string;
  label: string;
  icon?: string;
}

export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  notes: string;
  paymentMethod: string;
}

export interface OrderDetails extends SelectedPlan {
}

export interface SelectedPlan {
  planName: string;
  price: number;
  originalPrice?: number;
  currency: string;
  billingText: string;
  period: string;
  badge?: string;
  isPopular?: boolean;
  id: string;
}

// 支付相关类型
export interface PaymentData {
  orderId: string;
  qrCodeUrl: string;
  paymentUrl?: string;
  expiresAt: string;
  amount: number;
}

export const AppMode = {
  TEXT_CHAT: 'text_chat',
  AI_WRITING:'ai_writing',
  SMART_PRESENTATION: 'smart_presentation',
  DEEP_SEARCH: 'deep_search',
  AI_DRAWING: 'ai_drawing',
  PODCAST: 'podcast',
  MORE_TOOLS: 'more_tools',
} as const;
export type AppMode = typeof AppMode[keyof typeof AppMode];
export const Sender = {
  USER: 'User',
  AI: 'AI'
} as const;
export type Sender = typeof Sender[keyof typeof Sender];

export interface Message {
  id: string;
  sender: Sender;
  content: string;
  timestamp: number;
  type: 'text' | 'image' | 'loading';
  imageUrl?: string;
  meta?: {
    model?: string;
    latency?: number;
  };
}

export interface ServiceResponse {
  success: boolean;
  data: any;
  message?: string;
}