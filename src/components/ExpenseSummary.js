import React, { useMemo } from "react";
import { useExpenses } from "../contexts/ExpenseContext";
import "../styles/ExpenseSummary.css";

const ExpenseSummary = ({
  expenses: propExpenses,
  salary,
  isMonthlyView = false,
}) => {
  // Usar os expenses do contexto, caso não sejam fornecidos via props
  const { expenses: contextExpenses } = useExpenses(); // Remover lastUpdate da desestruturação

  // Usar os expenses das props, se fornecidos, caso contrário do contexto
  const expenses = propExpenses || contextExpenses;

  // Recalcular os valores sempre que as despesas ou o salário mudarem
  const { totalAmount, remainingBudget, percentageSpent, categorySummary } =
    useMemo(() => {
      // Calcular o total de gastos
      const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

      // Calcular orçamento restante
      const remaining = Math.max(0, salary - total);

      // Calcular percentuais
      const percentSpent = salary > 0 ? (total / salary) * 100 : 0;
      const percentRemaining = salary > 0 ? (remaining / salary) * 100 : 0;

      // Calcular resumo por categoria
      const categories = {};
      expenses.forEach((expense) => {
        const category = expense.category || "Outros";
        if (!categories[category]) {
          categories[category] = { total: 0, count: 0, percentage: 0 };
        }
        categories[category].total += expense.amount;
        categories[category].count += 1;
      });

      // Calcular percentuais por categoria
      Object.keys(categories).forEach((category) => {
        categories[category].percentage =
          total > 0 ? (categories[category].total / total) * 100 : 0;
      });

      return {
        totalAmount: total,
        remainingBudget: remaining,
        percentageSpent: percentSpent,
        percentageRemaining: percentRemaining,
        categorySummary: categories,
      };
    }, [expenses, salary]); // Remover lastUpdate das dependências

  // Formatação de valores monetários
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  // Determinar classe CSS com base no percentual gasto
  const getBudgetStatusClass = () => {
    if (percentageSpent >= 90) return "danger";
    if (percentageSpent >= 75) return "warning";
    return "good";
  };

  // Renderizar barras de progresso para o orçamento
  const renderBudgetProgressBars = () => {
    return (
      <div className="budget-progress">
        <div className="progress-container">
          <div
            className={`progress-bar ${getBudgetStatusClass()}`}
            style={{ width: `${Math.min(percentageSpent, 100)}%` }}>
            {percentageSpent > 10 && <span>{percentageSpent.toFixed(0)}%</span>}
          </div>
        </div>
        <div className="budget-labels">
          <span className="spent-label">
            Gasto: {formatCurrency(totalAmount)}
          </span>
          <span className="remaining-label">
            Disponível: {formatCurrency(remainingBudget)}
          </span>
        </div>
      </div>
    );
  };

  // Renderizar resumo por categoria
  const renderCategorySummary = () => {
    if (Object.keys(categorySummary).length === 0) {
      return <p>Nenhum gasto registrado.</p>;
    }

    // Ordenar categorias por valor total (maior para menor)
    const sortedCategories = Object.entries(categorySummary).sort(
      ([, a], [, b]) => b.total - a.total
    );

    return (
      <div className="category-summary">
        <h3>Gastos por Categoria</h3>
        {sortedCategories.map(([category, data]) => (
          <div key={category} className="category-item">
            <div className="category-header">
              <span className="category-name">{category}</span>
              <span className="category-amount">
                {formatCurrency(data.total)}
              </span>
            </div>
            <div className="category-progress-container">
              <div
                className="category-progress-bar"
                style={{ width: `${data.percentage}%` }}></div>
            </div>
            <div className="category-stats">
              <span>{data.percentage.toFixed(1)}%</span>
              <span>{data.count} item(s)</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="expense-summary">
      <div className="budget-section">
        <h3>
          {isMonthlyView ? "Orçamento Mensal" : "Resumo Financeiro"}:{" "}
          {formatCurrency(salary)}
        </h3>
        {renderBudgetProgressBars()}
        <div className="budget-status" data-status={getBudgetStatusClass()}>
          {percentageSpent >= 90
            ? "Orçamento excedido!"
            : percentageSpent >= 75
            ? "Atenção! Orçamento quase esgotado."
            : "Orçamento saudável."}
        </div>
      </div>

      {renderCategorySummary()}
    </div>
  );
};

export default ExpenseSummary;
