import React from "react";

const ExpenseList = ({ expenses, onDelete, onEdit }) => {
  // Ordenar gastos por data (mais recente primeiro)
  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Formatar data para exibição
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  // Formatar valor para exibição
  const formatAmount = (amount) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  return (
    <div>
      <h2>Lista de Gastos</h2>
      {sortedExpenses.length === 0 ? (
        <p>Nenhum gasto encontrado.</p>
      ) : (
        <div>
          {sortedExpenses.map((expense) => (
            <div key={expense.id} className="expense-item">
              <div>
                <h3>{expense.description}</h3>
                <p>
                  <strong>Categoria:</strong> {expense.category} |
                  <strong> Data:</strong> {formatDate(expense.date)}
                </p>
              </div>
              <div>
                <div>{formatAmount(expense.amount)}</div>
                <div className="actions">
                  <button className="edit" onClick={() => onEdit(expense)}>
                    Editar
                  </button>
                  <button
                    className="delete"
                    onClick={() => onDelete(expense.id)}>
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
