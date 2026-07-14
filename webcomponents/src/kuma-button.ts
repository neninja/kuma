import { LitElement, css, html } from 'lit';

export type KumaButtonVariant = 'primary' | 'secondary' | 'danger';
export type KumaButtonType = 'button' | 'submit' | 'reset';

export class KumaButton extends LitElement {
  static properties = {
    disabled: { type: Boolean, reflect: true },
    type: { type: String },
    variant: { type: String, reflect: true }
  };

  static styles = css`
    :host {
      display: inline-block;
      --kuma-button-bg: #24594d;
      --kuma-button-border: #24594d;
      --kuma-button-color: #ffffff;
      --kuma-button-hover-bg: #1d493f;
      --kuma-button-focus: #d87a4a;
    }

    :host([variant='secondary']) {
      --kuma-button-bg: #ffffff;
      --kuma-button-border: #b7c5be;
      --kuma-button-color: #24332e;
      --kuma-button-hover-bg: #edf3f0;
    }

    :host([variant='danger']) {
      --kuma-button-bg: #9f3939;
      --kuma-button-border: #9f3939;
      --kuma-button-color: #ffffff;
      --kuma-button-hover-bg: #823030;
    }

    button {
      align-items: center;
      background: var(--kuma-button-bg);
      border: 1px solid var(--kuma-button-border);
      border-radius: 8px;
      color: var(--kuma-button-color);
      cursor: pointer;
      display: inline-flex;
      font: inherit;
      font-weight: 700;
      gap: 0.5rem;
      justify-content: center;
      min-height: 2.75rem;
      min-width: 7rem;
      padding: 0.7rem 1rem;
      transition:
        background-color 160ms ease,
        border-color 160ms ease,
        box-shadow 160ms ease,
        transform 160ms ease;
      white-space: nowrap;
    }

    button:hover:not(:disabled) {
      background: var(--kuma-button-hover-bg);
      transform: translateY(-1px);
    }

    button:focus-visible {
      outline: 3px solid var(--kuma-button-focus);
      outline-offset: 2px;
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }
  `;

  declare disabled: boolean;
  declare type: KumaButtonType;
  declare variant: KumaButtonVariant;

  constructor() {
    super();
    this.disabled = false;
    this.type = 'button';
    this.variant = 'primary';
  }

  render() {
    return html`
      <button type=${this.type} ?disabled=${this.disabled}>
        <slot></slot>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'kuma-button': KumaButton;
  }
}

if (!customElements.get('kuma-button')) {
  customElements.define('kuma-button', KumaButton);
}
