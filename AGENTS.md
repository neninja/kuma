# AGENTS

Contexto rápido para agentes de IA trabalhando neste repositório.

## Monorepo

O projeto usa npm workspaces:

- `app`: Vue 3 + Vite. Consome os Web Components e implementa a experiência de
  conciliação de despesas.
- `webcomponents`: Lit. Exporta `@kuma/webcomponents/button` e
  `@kuma/webcomponents/money-card`.

## Pontos de atenção

- O app é 100% frontend, sem backend e sem autenticação.
- O estado do app fica em `localStorage` na chave
  `kuma:expense-splitter:v1`.
- O app usa `base: '/kuma/'` em `app/vite.config.ts`.
- O compilador Vue trata tags `kuma-*` como custom elements.
- Os testes Playwright usam servidores Vite locais:
  - `app`: porta `4173`, caminho `/kuma/`.
  - `webcomponents`: porta `4174`, fixture em `tests/fixtures/index.html`.

## Comandos úteis

- `npm start`: roda o app em desenvolvimento.
- `npm run build`: build de todos os workspaces.
- `npm run precommit`: validação completa esperada antes de entrega.
- `npm run test:unit -w @kuma/app`: unidade do app.
- `npm run test:cuj -w @kuma/app`: e2e do app.
- `npm run test:unit -w @kuma/webcomponents`: unidade dos Web Components em
  browser real.

## Convenções

- Preferir alterações pequenas e localizadas ao workspace correto.
- Não editar arquivos gerados em `dist`, `playwright-report` ou `test-results`.
- Para novos Web Components, adicionar export em `webcomponents/package.json`,
  registrar o custom element e cobrir com teste Playwright isolado.
- Para novos fluxos críticos do app, cobrir com Playwright no workspace `app`.
