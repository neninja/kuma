# Kuma

Monorepo frontend usando npm workspaces para uma aplicacao local de divisao de
despesas. A aplicacao roda inteira no navegador, sem backend e sem login.

## Workspaces

- `webcomponents`: biblioteca de Web Components com Lit.
- `app`: aplicacao Vue de conciliacao de despesas que consome os Web Components.

## Scripts

```sh
npm install
npm start
npm run build
npm run preview
```

O comando `npm start` inicia a aplicacao Vue em modo de desenvolvimento. Nesse
modo, o Vite importa os sources de `@kuma/webcomponents/button` e
`@kuma/webcomponents/money-card` antes da aplicacao montar, e o Lit pode exibir
o aviso `Lit is in dev mode` no console.

O comando `npm run build` gera o bundle de producao em `app/dist`. Para validar
esse bundle localmente, use `npm run preview`; abrir a aplicacao pelo servidor de
desenvolvimento depois do build continua usando modo de desenvolvimento.

Para manter o pacote `webcomponents/dist` atualizado enquanto edita os Web
Components, rode em outro terminal:

```sh
npm start -w @kuma/webcomponents
```
