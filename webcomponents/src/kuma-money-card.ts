import { LitElement, css, html } from 'lit';

export type KumaMoneyCardTone = 'neutral' | 'accent' | 'positive' | 'warning';

export class KumaMoneyCard extends LitElement {
  static properties = {
    detail: { type: String },
    label: { type: String },
    tone: { type: String, reflect: true },
    value: { type: String }
  };

  static styles = css`
    :host {
      display: block;
      min-width: 0;
      --kuma-card-bg: #ffffff;
      --kuma-card-border: #d8e0dc;
      --kuma-card-label: #5d6b64;
      --kuma-card-value: #1f2a26;
      --kuma-card-detail: #6d7b74;
      --kuma-card-rail: #53786e;
    }

    :host([tone='accent']) {
      --kuma-card-bg: #f3f8f5;
      --kuma-card-border: #c7d7d0;
      --kuma-card-value: #24594d;
      --kuma-card-rail: #24594d;
    }

    :host([tone='positive']) {
      --kuma-card-bg: #f3fbf7;
      --kuma-card-border: #bfdccb;
      --kuma-card-value: #1c6b42;
      --kuma-card-rail: #2f8b59;
    }

    :host([tone='warning']) {
      --kuma-card-bg: #fff8ed;
      --kuma-card-border: #efd4aa;
      --kuma-card-value: #925f16;
      --kuma-card-rail: #d9912b;
    }

    article {
      background: var(--kuma-card-bg);
      border: 1px solid var(--kuma-card-border);
      border-left: 4px solid var(--kuma-card-rail);
      border-radius: 8px;
      display: grid;
      gap: 0.45rem;
      min-height: 7.25rem;
      padding: 1rem;
    }

    span {
      color: var(--kuma-card-label);
      font-size: 0.76rem;
      font-weight: 800;
      letter-spacing: 0;
      line-height: 1.2;
      text-transform: uppercase;
    }

    strong {
      color: var(--kuma-card-value);
      display: block;
      font-size: 2rem;
      line-height: 1.05;
      overflow-wrap: anywhere;
    }

    @media (max-width: 520px) {
      strong {
        font-size: 1.65rem;
      }
    }

    small {
      color: var(--kuma-card-detail);
      font-size: 0.92rem;
      line-height: 1.35;
      min-height: 1.25rem;
    }
  `;

  declare detail: string;
  declare label: string;
  declare tone: KumaMoneyCardTone;
  declare value: string;

  constructor() {
    super();
    this.detail = '';
    this.label = '';
    this.tone = 'neutral';
    this.value = '';
  }

  render() {
    return html`
      <article>
        <span>${this.label}</span>
        <strong>${this.value}</strong>
        <small>${this.detail}</small>
      </article>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'kuma-money-card': KumaMoneyCard;
  }
}

if (!customElements.get('kuma-money-card')) {
  customElements.define('kuma-money-card', KumaMoneyCard);
}
