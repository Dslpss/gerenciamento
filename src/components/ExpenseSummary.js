import React, { useMemo, useState } from "react";
import "../styles/ExpenseSummary.css";

const ExpenseSummary = ({ expenses, salary, isMonthlyView, filters }) => {
  // Alterar o estado inicial para false para começar oculto
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);

  // Verificar se estamos visualizando um mês específico
  const isSpecificMonth = filters && filters.month !== "todos";

  // Formatar valor para exibição
  const formatAmount = (amount) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount || 0);
  };

  // Função para formatar valor sensível
  const formatSensitiveAmount = (amount) => {
    return showSensitiveInfo ? formatAmount(amount) : "R$ ••••••";
  };

  // Calcular o total gasto
  const totalSpent = expenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  // Calcular percentual do orçamento gasto
  const percentageSpent = salary > 0 ? (totalSpent / salary) * 100 : 0;

  // Calcular o saldo disponível
  const remainingBalance = salary - totalSpent;

  // Calcular a média diária de gasto
  const calculateDailyAverage = () => {
    if (isSpecificMonth) {
      // Se estamos vendo um mês específico, calcular com base nos dias daquele mês
      const year =
        filters.year !== "todos"
          ? parseInt(filters.year)
          : new Date().getFullYear();

      const month = parseInt(filters.month) - 1; // Subtrair 1 porque os meses em JS vão de 0-11

      // Obter o último dia do mês selecionado
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      // Calcular quantos dias já se passaram no mês atual
      let daysElapsed;
      const currentDate = new Date();

      if (
        currentDate.getMonth() === month &&
        currentDate.getFullYear() === year
      ) {
        // Se for o mês atual, usar apenas os dias que já passaram
        daysElapsed = currentDate.getDate();
      } else {
        // Se for um mês diferente, usar todos os dias do mês
        daysElapsed = daysInMonth;
      }

      return daysElapsed > 0 ? totalSpent / daysElapsed : 0;
    } else {
      // Caso contrário, usar uma estimativa simples (dividir pelo número de despesas)
      return expenses.length > 0 ? totalSpent / expenses.length : 0;
    }
  };

  const dailyAverage = calculateDailyAverage();

  // Melhorar a função para obter nome do mês para casos onde filters pode ser undefined
  const getMonthName = () => {
    if (!filters || filters.month === "todos") return "Geral";

    const monthNames = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];

    const monthIndex = parseInt(filters.month) - 1;
    if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
      return "Atual";
    }

    return monthNames[monthIndex];
  };

  // Título dinâmico com base nos filtros
  let summaryTitle = "Resumo de Gastos";

  if (isMonthlyView && filters) {
    const monthName = getMonthName();
    const yearText = filters.year !== "todos" ? ` ${filters.year}` : "";
    summaryTitle = `Orçamento de ${monthName}${yearText}`;
  }

  // Agrupar despesas por categoria para mostrar a distribuição
  const categoryDistribution = useMemo(() => {
    const categories = {};

    expenses.forEach((expense) => {
      const category = expense.category || "Outros";
      if (!categories[category]) {
        categories[category] = 0;
      }
      categories[category] += expense.amount;
    });

    // Ordenar por valor (do maior para o menor)
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  // Função para calcular a largura da barra baseada no valor
  const getBarWidth = (value) => {
    if (!totalSpent) return 0;
    return Math.max(5, (value / totalSpent) * 100);
  };

  return (
    <div className="expense-summary">
      <h2>
        {summaryTitle}
        <button
          className="toggle-sensitive-info"
          onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
          aria-label={
            showSensitiveInfo ? "Ocultar valores" : "Mostrar valores"
          }>
          <i className={`fas fa-eye${showSensitiveInfo ? "" : "-slash"}`}></i>
        </button>
      </h2>

      <div className="summary-grid">
        <div className="summary-item">
          <div className="summary-label">Orçamento</div>
          <div className="summary-value">{formatSensitiveAmount(salary)}</div>
        </div>

        <div className="summary-item">
          <div className="summary-label">Total Gasto</div>
          <div className="summary-value expense">
            {formatSensitiveAmount(totalSpent)}
          </div>
        </div>

        <div className="summary-item">
          <div className="summary-label">Disponível</div>
          <div
            className={`summary-value ${
              remainingBalance < 0 ? "negative" : "positive"
            }`}>
            {formatSensitiveAmount(remainingBalance)}
          </div>
        </div>

        <div className="summary-item">
          <div className="summary-label">Média Diária</div>
          <div className="summary-value">
            {formatSensitiveAmount(dailyAverage)}
          </div>
        </div>
      </div>

      <div className="budget-bar-container">
        <div className="budget-label">
          <span>{percentageSpent.toFixed(1)}% do orçamento utilizado</span>
        </div>
        <div className="budget-bar">
          <div
            className={`budget-progress ${
              percentageSpent > 100 ? "exceeded" : ""
            }`}
            style={{ width: `${percentageSpent}%` }}></div>
        </div>
      </div>

      {/* Nova seção de estatísticas em barras */}
      <div className="stats-section">
        <h3>Distribuição de Gastos</h3>

        <div className="category-bars">
          {categoryDistribution.slice(0, 5).map((category, index) => (
            <div key={index} className="category-bar-item">
              <div className="bar-info">
                <span className="bar-label">{category.name}</span>
                <span className="bar-value">
                  {formatAmount(category.value)}
                </span>
              </div>
              <div className="bar-container">
                <div
                  className="bar-fill"
                  style={{
                    width: `${getBarWidth(category.value)}%`,
                    backgroundColor: getColorForCategory(category.name, index),
                  }}></div>
              </div>
              <div className="bar-percent">
                {totalSpent
                  ? ((category.value / totalSpent) * 100).toFixed(1) + "%"
                  : "0%"}
              </div>
            </div>
          ))}
        </div>

        {/* Seção de métricas adicionais */}
        <div className="metric-columns">
          <div className="metric-column">
            <div className="metric-box">
              <div className="metric-title">Maior Gasto</div>
              <div className="metric-value">
                {categoryDistribution.length > 0
                  ? formatAmount(categoryDistribution[0].value)
                  : formatAmount(0)}
              </div>
              <div className="metric-label">
                {categoryDistribution.length > 0
                  ? categoryDistribution[0].name
                  : "Nenhum"}
              </div>
            </div>
          </div>

          <div className="metric-column">
            <div className="metric-box">
              <div className="metric-title">Situação do Orçamento</div>
              <div
                className={`metric-value ${
                  remainingBalance >= 0 ? "positive" : "negative"
                }`}>
                {formatAmount(Math.abs(remainingBalance))}
              </div>
              <div className="metric-label">
                {remainingBalance >= 0 ? "de sobra" : "de excesso"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Função para obter cor baseada na categoria ou índice
const getColorForCategory = (category, index) => {
  const colors = [
    "#3498db", // azul
    "#2ecc71", // verde
    "#e74c3c", // vermelho
    "#f39c12", // laranja
    "#9b59b6", // roxo
    "#1abc9c", // verde água
    "#e67e22", // laranja escuro
    "#34495e", // azul escuro
  ];

  // Categorias específicas com cores fixas
  const categoryColors = {
    Alimentação: "#e74c3c",
    Moradia: "#3498db",
    Transporte: "#f39c12",
    Lazer: "#2ecc71",
    Saúde: "#9b59b6",
  };

  return categoryColors[category] || colors[index % colors.length];
};

export default ExpenseSummary;
