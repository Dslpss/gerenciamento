# Sistema de Gerenciamento de Gastos

Um aplicativo React simples para gerenciar seus gastos pessoais.

## Funcionalidades

- Adicionar, editar e excluir gastos
- Categorizar gastos
- Filtrar por categoria, mês e ano
- Visualizar resumo de gastos
- Dados persistidos no localStorage do navegador

## Como executar o projeto

1. Clone este repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Execute o projeto:
   ```
   npm start
   ```
4. Acesse no navegador: `http://localhost:3000`

## Tecnologias utilizadas

- React.js
- JavaScript (ES6+)
- HTML5
- CSS3
- LocalStorage para persistência dos dados

## Estrutura do projeto

- `src/App.js`: Componente principal que gerencia o estado e as funções principais
- `src/components/`: Pasta contendo os componentes da aplicação
  - `ExpenseForm.js`: Formulário para adicionar e editar gastos
  - `ExpenseList.js`: Lista de gastos com opções de edição e exclusão
  - `ExpenseSummary.js`: Resumo e estatísticas dos gastos
  - `ExpenseFilter.js`: Filtros para a lista de gastos

## Melhorias futuras

- Implementar autenticação de usuários
- Adicionar banco de dados para armazenamento permanente
- Gerar relatórios e gráficos
- Adicionar categorias personalizadas
- Implementar funcionalidade de orçamento mensal
