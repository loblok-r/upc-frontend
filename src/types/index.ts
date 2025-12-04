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
