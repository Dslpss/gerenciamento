import React, { useState, useMemo } from "react";
import "../styles/AnnualReport.css"; // Adicione esta linha para importar os estilos

const AnnualReport = ({ expenses, monthlySalaries, defaultSalary }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);

  // Anos disponíveis com base nos dados existentes
  const availableYears = useMemo(() => {
    const yearsSet = new Set();
    const currentYear = new Date().getFullYear();

    // Adicionar anos dos gastos
    expenses.forEach((expense) => {
      const year = new Date(expense.date).getFullYear();
      yearsSet.add(year);
    });

    // Adicionar anos dos salários
    Object.keys(monthlySalaries).forEach((key) => {
      const year = parseInt(key.split("-")[0]);
      yearsSet.add(year);
    });

    // Garantir que o ano atual está incluído
    yearsSet.add(currentYear);

    return Array.from(yearsSet).sort((a, b) => b - a); // Ordenar decrescente
  }, [expenses, monthlySalaries]);

  // Meses
  const months = useMemo(
    () => [
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
    ],
    []
  );

  // Calcula dados mensais para o ano selecionado
  const annualData = useMemo(() => {
    const monthlyData = [];

    for (let month = 1; month <= 12; month++) {
      // Filtrar despesas para o mês/ano específico
      const monthExpenses = expenses.filter((expense) => {
        const expenseDate = new Date(expense.date);
        return (
          expenseDate.getFullYear() === selectedYear &&
          expenseDate.getMonth() + 1 === month
        );
      });

      // Calcular total de gastos do mês
      const totalExpense = monthExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

      // Obter o salário para este mês ou usar o salário padrão
      const key = `${selectedYear}-${month}`;
      const monthlySalary = monthlySalaries[key] || defaultSalary;

      // Agrupar gastos por categoria
      const expensesByCategory = monthExpenses.reduce((acc, expense) => {
        if (!acc[expense.category]) {
          acc[expense.category] = 0;
        }
        acc[expense.category] += expense.amount;
        return acc;
      }, {});

      monthlyData.push({
        month,
        monthName: months[month - 1],
        totalExpense,
        monthlySalary,
        balance: monthlySalary - totalExpense,
        percentOfSalary:
          monthlySalary > 0 ? (totalExpense / monthlySalary) * 100 : 0,
        expensesByCategory,
      });
    }

    // Calcular totais anuais
    const annualExpense = monthlyData.reduce(
      (sum, data) => sum + data.totalExpense,
      0
    );
    const annualSalary = monthlyData.reduce(
      (sum, data) => sum + data.monthlySalary,
      0
    );
    const annualBalance = annualSalary - annualExpense;
    const annualPercentOfSalary =
      annualSalary > 0 ? (annualExpense / annualSalary) * 100 : 0;

    // Agrupar gastos anuais por categoria
    const annualExpensesByCategory = expenses
      .filter(
        (expense) => new Date(expense.date).getFullYear() === selectedYear
      )
      .reduce((acc, expense) => {
        if (!acc[expense.category]) {
          acc[expense.category] = 0;
        }
        acc[expense.category] += expense.amount;
        return acc;
      }, {});

    return {
      monthlyData,
      annualExpense,
      annualSalary,
      annualBalance,
      annualPercentOfSalary,
      annualExpensesByCategory,
    };
  }, [expenses, monthlySalaries, defaultSalary, selectedYear, months]);

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

  // Função para formatar valor sensível
  const formatSensitiveAmount = (amount) => {
    return showSensitiveInfo ? formatAmount(amount) : "R$ ••••••";
  };

  // Na parte do gráfico de barras, vamos adicionar detecção para dispositivos móveis:
  const isMobileDevice = window.innerWidth <= 480;

  return (
    <div className="annual-report">
      <h2>
        Relatório Anual de Gastos
        <button
          className="toggle-sensitive-info"
          onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
          aria-label={
            showSensitiveInfo ? "Ocultar valores" : "Mostrar valores"
          }>
          <i className={`fas fa-eye${showSensitiveInfo ? "" : "-slash"}`}></i>
        </button>
      </h2>

      <div className="filter-container">
        <label htmlFor="year-select">Selecione o ano: </label>
        <select
          id="year-select"
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="annual-summary">
        <h3>Resumo Anual - {selectedYear}</h3>
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-title">Total Ganho</div>
            <div className="summary-value">
              {formatSensitiveAmount(annualData.annualSalary)}
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-title">Total Gasto</div>
            <div className="summary-value">
              {formatSensitiveAmount(annualData.annualExpense)}
            </div>
          </div>
          <div className="summary-card">
            <div
              className={`summary-title ${
                annualData.annualBalance < 0 ? "negative" : "positive"
              }`}>
              Balanço
            </div>
            <div
              className={`summary-value ${
                annualData.annualBalance < 0 ? "negative" : "positive"
              }`}>
              {formatSensitiveAmount(annualData.annualBalance)}
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-title">% dos Ganhos Gastos</div>
            <div className="summary-value">
              {formatPercent(annualData.annualPercentOfSalary)}
            </div>
          </div>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-wrapper">
          <h3>Gastos vs. Salários Mensais</h3>
          <div className="simple-chart">
            {annualData.monthlyData.map((data) => {
              // Encontrar o maior valor para normalizar as barras
              const maxValue = Math.max(
                ...annualData.monthlyData.map((d) =>
                  Math.max(d.monthlySalary, d.totalExpense)
                )
              );

              // Calcular larguras proporcionais com base no valor máximo
              const salaryWidth =
                maxValue > 0
                  ? Math.max(
                      10,
                      Math.min(90, (data.monthlySalary / maxValue) * 90)
                    )
                  : 0;

              const expenseWidth =
                maxValue > 0
                  ? Math.max(
                      10,
                      Math.min(90, (data.totalExpense / maxValue) * 90)
                    )
                  : 0;

              return (
                <div key={data.month} className="chart-bar-container">
                  <div className="chart-bar-label">{data.monthName}</div>
                  <div className="chart-bars">
                    <div
                      className="chart-bar salary-bar"
                      style={{ width: `${salaryWidth}%` }}
                      title={`Salário: ${formatSensitiveAmount(
                        data.monthlySalary
                      )}`}>
                      {formatSensitiveAmount(data.monthlySalary)}
                    </div>
                    <div
                      className={`chart-bar expense-bar ${
                        data.totalExpense > data.monthlySalary ? "exceeded" : ""
                      }`}
                      style={{ width: `${expenseWidth}%` }}
                      title={`Gastos: ${formatSensitiveAmount(
                        data.totalExpense
                      )}`}>
                      {formatSensitiveAmount(data.totalExpense)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="chart-wrapper">
          <h3>Distribuição de Gastos por Categoria</h3>
          <div className="category-distribution">
            {Object.entries(annualData.annualExpensesByCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => {
                const percentage = (amount / annualData.annualExpense) * 100;
                return (
                  <div key={category} className="category-item">
                    <div className="category-label">
                      {category} ({formatPercent(percentage)})
                    </div>
                    <div className="category-bar-container">
                      <div
                        className="category-bar"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                        title={formatSensitiveAmount(amount)}>
                        {percentage > (isMobileDevice ? 15 : 10)
                          ? isMobileDevice
                            ? formatSensitiveAmount(amount).replace("R$", "")
                            : formatSensitiveAmount(amount)
                          : ""}
                      </div>
                      {percentage <= 10 && (
                        <div className="outside-bar-value">
                          {formatSensitiveAmount(amount)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <div className="monthly-details">
        <h3>Detalhes Mensais</h3>
        <table className="monthly-table">
          <thead>
            <tr>
              <th>Mês</th>
              <th>Salário</th>
              <th>Gastos</th>
              <th>Saldo</th>
              <th>% Gasto</th>
            </tr>
          </thead>
          <tbody>
            {annualData.monthlyData.map((data) => (
              <tr
                key={data.month}
                className={data.balance < 0 ? "negative-row" : ""}>
                <td>{data.monthName}</td>
                <td>{formatSensitiveAmount(data.monthlySalary)}</td>
                <td>{formatSensitiveAmount(data.totalExpense)}</td>
                <td>{formatSensitiveAmount(data.balance)}</td>
                <td>{formatPercent(data.percentOfSalary)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="total-row">
              <td>Total Anual</td>
              <td>{formatSensitiveAmount(annualData.annualSalary)}</td>
              <td>{formatSensitiveAmount(annualData.annualExpense)}</td>
              <td>{formatSensitiveAmount(annualData.annualBalance)}</td>
              <td>{formatPercent(annualData.annualPercentOfSalary)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default AnnualReport;
