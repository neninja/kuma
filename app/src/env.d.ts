import type { KumaButtonType, KumaButtonVariant } from '@kuma/webcomponents';

declare module 'vue' {
  export interface GlobalComponents {
    'kuma-button': HTMLElement & {
      disabled?: boolean;
      type?: KumaButtonType;
      variant?: KumaButtonVariant;
    };
  }
}

export {};
