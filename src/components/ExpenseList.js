import React from "react";
import { useExpenses } from "../contexts/ExpenseContext";

const ExpenseList = ({ onEdit }) => {
  const { expenses, deleteExpense, loading } = useExpenses();

  // Ordenar gastos por data (mais recente primeiro)
  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Verificar e corrigir IDs duplicados
  const uniqueExpenses = [];
  const idSet = new Set();
  
  // Filtrar para garantir IDs únicos
  sortedExpenses.forEach(expense => {
    // Se o ID não existir ou já estiver no conjunto, gere um novo ID
    if (!expense.id || idSet.has(expense.id)) {
      expense = {
        ...expense,
        id: `${expense.id || ''}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    }
    
    idSet.add(expense.id);
    uniqueExpenses.push(expense);
  });

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

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir o item");
    }
  };

  const handleEdit = (expense) => {
    if (onEdit) {
      onEdit(expense);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <h2>Lista de Gastos</h2>
      {uniqueExpenses.length === 0 ? (
        <p>Nenhum gasto encontrado.</p>
      ) : (
        <div>
          {uniqueExpenses.map((expense) => (
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
                  <button className="edit" onClick={() => handleEdit(expense)}>
                    Editar
                  </button>
                  <button
                    className="delete"
                    onClick={() => handleDelete(expense.id)}>
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
