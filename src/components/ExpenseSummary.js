import React, { useMemo } from "react";

const ExpenseSummary = ({ expenses, salary, isMonthlyView }) => {
  // Calcular totais e estatísticas
  const summary = useMemo(() => {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    const totalByCategory = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.amount;
      return acc;
    }, {});

    const mostExpensiveCategory =
      Object.entries(totalByCategory).sort(([, a], [, b]) => b - a)[0] || [];

    // Cálculos relacionados ao salário
    const percentOfSalary = salary > 0 ? (total / salary) * 100 : 0;
    const remaining = salary > 0 ? salary - total : 0;

    return {
      total,
      count: expenses.length,
      totalByCategory,
      mostExpensiveCategory: mostExpensiveCategory[0],
      mostExpensiveAmount: mostExpensiveCategory[1],
      percentOfSalary,
      remaining,
    };
  }, [expenses, salary]);

  // Formatar valor para exibição
  const formatAmount = (amount) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount || 0);
  };

  // Formatar percentual para exibição
  const formatPercent = (percent) => {
    return `${percent.toFixed(1)}%`;
  };

  return (
    <div>
      <h2>Resumo</h2>
      <div className="summary">
        <div>
          <strong>Total de gastos:</strong> {formatAmount(summary.total)}
        </div>
        <div>
          <strong>Quantidade de gastos:</strong> {summary.count}
        </div>
      </div>

      {salary > 0 && (
        <div className="salary-summary">
          <h3>Comparativo com Salário</h3>
          <div
            className={`summary ${
              summary.percentOfSalary > 100 ? "warning" : ""
            }`}>
            <div>
              <strong>Porcentagem do salário gasto:</strong>{" "}
              {formatPercent(summary.percentOfSalary)}
            </div>
            <div>
              <strong>
                {isMonthlyView
                  ? "Restante do salário:"
                  : "Valor em relação ao salário:"}
              </strong>{" "}
              {formatAmount(summary.remaining)}
            </div>
          </div>

          {summary.percentOfSalary > 100 && isMonthlyView && (
            <div className="alert warning">
              Atenção! Seus gastos excederam o valor do seu salário neste mês.
            </div>
          )}

          {summary.percentOfSalary > 80 &&
            summary.percentOfSalary <= 100 &&
            isMonthlyView && (
              <div className="alert warning">
                Cuidado! Seus gastos estão próximos do limite do seu salário.
              </div>
            )}
        </div>
      )}

      {summary.mostExpensiveCategory && (
        <div className="summary">
          <div>
            <strong>Categoria mais cara:</strong>{" "}
            {summary.mostExpensiveCategory}
          </div>
          <div>
            <strong>Valor:</strong> {formatAmount(summary.mostExpensiveAmount)}
          </div>
        </div>
      )}

      <h3>Gastos por categoria</h3>
      {Object.entries(summary.totalByCategory).length > 0 ? (
        Object.entries(summary.totalByCategory)
          .sort(([, a], [, b]) => b - a)
          .map(([category, amount]) => (
            <div key={category} className="expense-item">
              <div>{category}</div>
              <div>
                {formatAmount(amount)}
                {salary > 0 && (
                  <span className="category-percent">
                    {" "}
                    ({formatPercent((amount / salary) * 100)} do salário)
                  </span>
                )}
              </div>
            </div>
          ))
      ) : (
        <p>Nenhum dado disponível</p>
      )}
    </div>
  );
};

export default ExpenseSummary;
