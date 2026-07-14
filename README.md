# Kuma

Kuma é uma aplicação frontend de conciliação de despesas. A aplicação não tem
backend: tudo roda no navegador e o estado é salvo em `localStorage`.

O nome do projeto vem de Bartholomew Kuma, personagem do One Piece que consegue
remover a dor de outras pessoas.

## Publicação

1. Instale as dependências:

```sh
npm install
```

2. Gere o build de produção:

```sh
npm run build
```

3. Valide o bundle localmente:

```sh
npm run preview
```

4. Publique o conteúdo de `app/dist` em uma hospedagem estática.

O Vite do app está configurado com `base: '/kuma/'` em
`app/vite.config.ts`. Se a aplicação for publicada em outro caminho, ajuste esse
`base` antes do build.

## Documentação

- [CONTRIBUTING.md](./CONTRIBUTING.md): desenvolvimento, scripts, escolhas e
  diretrizes.
- [AGENTS.md](./AGENTS.md): contexto útil para agentes de IA.
- [PRD.md](./PRD.md): resumo sucinto do produto.
