# Gerenciamento de Finanças

Sistema de gerenciamento de finanças pessoais desenvolvido com React e Firebase.

## Funcionalidades

- Controle de despesas
- Gerenciamento de salário
- Histórico de alterações salariais
- Relatórios mensais e anuais
- Autenticação de usuários

## Tecnologias

- React.js
- Firebase (Autenticação e Firestore)
- Netlify para deploy

## Configuração do Ambiente

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```
3. Copie o arquivo `.env.example` para `.env` e configure suas variáveis
4. Execute o projeto:
```bash
npm start
```

## Deploy

O projeto está configurado para deploy no Netlify:
```bash
npm run netlify-deploy
```

## Estrutura do Projeto

```
src/
  ├── components/    # Componentes React
  ├── contexts/     # Contextos (Auth, etc)
  ├── firebase/     # Configuração e utils do Firebase
  ├── styles/       # Arquivos CSS
  └── utils/        # Funções utilitárias
```
