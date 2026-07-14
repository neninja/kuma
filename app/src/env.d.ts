import type { KumaButtonType, KumaButtonVariant } from '@kuma/webcomponents/button';
import type { KumaMoneyCardTone } from '@kuma/webcomponents/money-card';

declare module 'vue' {
  export interface GlobalComponents {
    'kuma-button': HTMLElement & {
      disabled?: boolean;
      type?: KumaButtonType;
      variant?: KumaButtonVariant;
    };
    'kuma-money-card': HTMLElement & {
      detail?: string;
      label?: string;
      tone?: KumaMoneyCardTone;
      value?: string;
    };
  }
}

export {};
