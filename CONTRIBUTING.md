# Contribuindo

## Estrutura

Este repositório é um monorepo npm com dois workspaces:

- `app`: aplicação Vue/Vite de conciliação de despesas.
- `webcomponents`: biblioteca Lit com os Web Components usados pelo app.

## Desenvolvimento

Instale dependências na raiz:

```sh
npm install
```

Rode a aplicação:

```sh
npm start
```

O `npm start` inicia o workspace `@kuma/app`. Em desenvolvimento, o app importa
os sources de `@kuma/webcomponents/button` e `@kuma/webcomponents/money-card`.
O aviso `Lit is in dev mode` no console é esperado nesse modo.

Para recompilar `webcomponents/dist` enquanto edita a biblioteca:

```sh
npm start -w @kuma/webcomponents
```

## Scripts

Scripts principais da raiz:

- `npm run build`: build de todos os workspaces.
- `npm run preview`: preview do build do app.
- `npm run lint`: ESLint em todos os workspaces.
- `npm run typecheck`: TypeScript em todos os workspaces.
- `npm run format:check`: Prettier em todos os workspaces.
- `npm run precommit`: lint, typecheck, Prettier, testes unitários e e2e.

Scripts relevantes do `app`:

- `npm run test:unit -w @kuma/app`: Vitest para `App.vue`.
- `npm run test:cuj -w @kuma/app`: Playwright e2e do fluxo principal.

Scripts relevantes do `webcomponents`:

- `npm run test:unit -w @kuma/webcomponents`: Playwright em navegador real para
  componentes isolados.

## Testes

O `app` usa Vitest para unidade e Playwright para o CUJ e2e.

O `webcomponents` usa Playwright para testes unitários em navegador real porque
Web Components dependem de APIs reais do browser, como `customElements`, Shadow
DOM, slots, atributos refletidos e estilos encapsulados. Essa escolha também
prepara o caminho para regressão visual futura com
`expect(locator).toHaveScreenshot(...)`.

## Diretrizes

- Mantenha lógica de aplicação no workspace `app`.
- Mantenha componentes reutilizáveis no workspace `webcomponents`.
- Antes de abrir PR ou publicar, rode `npm run precommit`.
- Não versionar saídas geradas como `dist`, `playwright-report` e
  `test-results`.
- Se mudar o caminho público da aplicação, ajuste `base` em
  `app/vite.config.ts`.
