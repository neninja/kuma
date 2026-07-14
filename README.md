# Kuma

Monorepo frontend usando npm workspaces.

## Workspaces

- `webcomponents`: biblioteca de Web Components com Lit.
- `app`: aplicacao Vue que consome os Web Components.

## Scripts

```sh
npm install
npm start
npm run build
```

O comando `npm start` inicia a aplicacao Vue. Em desenvolvimento, o Vite importa
o source de `@kuma/webcomponents` e registra o componente `kuma-button` antes da
aplicacao montar.

Para manter o pacote `webcomponents/dist` atualizado enquanto edita os Web
Components, rode em outro terminal:

```sh
npm start -w @kuma/webcomponents
```
