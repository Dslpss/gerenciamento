import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useExpenses } from "../contexts/ExpenseContext";
import "../styles/DashboardSummary.css";

const DashboardSummary = ({ salary, salaryDay = 5 }) => {
  const { expenses } = useExpenses();
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);

  // Dados para o mês atual
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const currentDay = currentDate.getDate();

  // Determinar início e fim do ciclo atual de salário
  const determinarCiclo = () => {
    // Data de início do ciclo atual (dia do salário do mês atual ou mês anterior)
    let inicio = new Date(currentYear, currentMonth, salaryDay);

    // Se ainda não chegamos no dia do pagamento deste mês, o ciclo começou no mês anterior
    if (currentDay < salaryDay) {
      inicio = new Date(currentYear, currentMonth - 1, salaryDay);
    }

    // Data de fim do ciclo é o dia anterior ao próximo pagamento
    let fim = new Date(
      currentYear,
      currentMonth + (currentDay >= salaryDay ? 1 : 0),
      salaryDay - 1
    );

    // Calcular dias totais do ciclo e dias passados
    const diasTotais = Math.round((fim - inicio) / (1000 * 60 * 60 * 24)) + 1;
    const diasPassados =
      Math.round((currentDate - inicio) / (1000 * 60 * 60 * 24)) + 1;
    const diasRestantes = diasTotais - diasPassados;

    return { inicio, fim, diasTotais, diasPassados, diasRestantes };
  };

  const ciclo = determinarCiclo();

  // Filtrar despesas do ciclo atual
  const currentCycleExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= ciclo.inicio && expenseDate <= currentDate;
  });

  // Calcular total gasto neste ciclo
  const totalSpent = currentCycleExpenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  // Calcular percentual do salário gasto
  const percentageSpent = salary > 0 ? (totalSpent / salary) * 100 : 0;

  // Agrupar por categoria para o gráfico
  const categoryData = {};
  currentCycleExpenses.forEach((expense) => {
    const category = expense.category || "Outros";
    if (!categoryData[category]) {
      categoryData[category] = 0;
    }
    categoryData[category] += expense.amount;
  });

  // Formatar para o gráfico
  const chartData = Object.keys(categoryData).map((category) => ({
    name: category,
    value: categoryData[category],
  }));

  // Cores para o gráfico
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
    "#a4de6c",
    "#d0ed57",
  ];

  // Formatar moeda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  // Calcular média diária de gasto baseada nos gastos do ciclo atual
  const dailyAverage =
    ciclo.diasPassados > 0 ? totalSpent / ciclo.diasPassados : 0;

  // Limitar a projeção para evitar valores absurdos
  const calcularProjecaoRealista = () => {
    // Projeção básica
    const projecaoBasica = dailyAverage * ciclo.diasRestantes;

    // Aplicar limites na projeção para evitar valores absurdos
    // 1. Limite baseado no histórico: não projetar mais que 2x o valor já gasto
    const limiteHistorico = totalSpent * 2;

    // 2. Limite baseado no salário: não projetar mais que 80% do salário restante
    const salarioRestante = salary - totalSpent;
    const limiteSalario = salarioRestante > 0 ? salarioRestante * 0.8 : 0;

    // 3. Limite absoluto: não projetar mais que 3x a média diária multiplicado pelos dias restantes
    const limiteAbsoluto = dailyAverage * 3 * ciclo.diasRestantes;

    // Escolher o menor dos limites para aplicar
    const limiteProjecao = Math.min(
      limiteHistorico,
      limiteSalario,
      limiteAbsoluto
    );

    // Aplicar o limite
    return Math.min(projecaoBasica, limiteProjecao);
  };

  // Projeção de gastos APENAS para os dias restantes do ciclo
  const projectionForRemainingDays = calcularProjecaoRealista();
  const projectedTotal = totalSpent + projectionForRemainingDays;

  // Verifica se ultrapassará o orçamento do ciclo
  const willOverspend = projectedTotal > salary;
  const saldoFinal = salary - projectedTotal;

  // Formatar data para exibição
  const formatDate = (date) => {
    return date.toLocaleDateString("pt-BR");
  };

  // Função para formatar valor sensível
  const formatSensitiveAmount = (amount) => {
    return showSensitiveInfo ? formatCurrency(amount) : "R$ ••••••";
  };

  // Detectar se é mobile
  const isMobile = window.innerWidth <= 480;

  return (
    <div className="dashboard-summary">
      <h2>
        Resumo do Ciclo Atual
        <button
          className="toggle-sensitive-info"
          onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
          aria-label={
            showSensitiveInfo ? "Ocultar valores" : "Mostrar valores"
          }>
          <i className={`fas fa-eye${showSensitiveInfo ? "" : "-slash"}`}></i>
        </button>
      </h2>

      <div className="cycle-info">
        <span>
          Ciclo: {formatDate(ciclo.inicio)} até {formatDate(ciclo.fim)}
        </span>
        <span className="cycle-progress">
          {ciclo.diasPassados} de {ciclo.diasTotais} dias
        </span>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <h3>Gasto até agora</h3>
          <div className="amount">{formatSensitiveAmount(totalSpent)}</div>
          <div className="percentage">
            {percentageSpent.toFixed(1)}% do salário
          </div>
        </div>

        <div className="summary-card">
          <h3>Média diária</h3>
          <div className="amount">{formatSensitiveAmount(dailyAverage)}</div>
          <div className="info">
            Com base nos últimos {ciclo.diasPassados} dias
          </div>
        </div>

        <div className={`summary-card ${willOverspend ? "warning" : ""}`}>
          <h3>Projeção do ciclo</h3>
          <div className="amount">{formatSensitiveAmount(projectedTotal)}</div>
          <div className="info">
            {willOverspend
              ? `Você excederá o orçamento em ${formatSensitiveAmount(
                  -saldoFinal
                )}`
              : `Você economizará ${formatSensitiveAmount(saldoFinal)}`}
          </div>
          <div className="projection-detail">
            <span className="actual">
              Atual: {formatSensitiveAmount(totalSpent)}
            </span>
            <span className="plus">+</span>
            <span className="projected">
              Projeção: {formatSensitiveAmount(projectionForRemainingDays)}
            </span>
          </div>
        </div>
      </div>

      <div className="chart-section">
        <h3>Gastos por Categoria</h3>
        {chartData.length > 0 ? (
          <>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={isMobile ? 60 : 80}
                    innerRadius={isMobile ? 20 : 30}
                    fill="#8884d8"
                    dataKey="value">
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Substituir Legend por nosso próprio componente de legenda */}
            <div className="legend-container">
              {chartData.map((entry, index) => {
                const percent = ((entry.value / totalSpent) * 100).toFixed(0);
                return (
                  <div
                    key={`legend-${index}`}
                    className="custom-legend-item"
                    style={{
                      borderLeft: `4px solid ${COLORS[index % COLORS.length]}`,
                    }}>
                    <span className="category-name">{entry.name}</span>
                    <div>
                      <span className="category-percent">{percent}%</span>
                      <span className="category-amount">
                        {isMobile
                          ? formatCurrency(entry.value)
                          : ` (${formatCurrency(entry.value)})`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="no-data">Nenhum gasto registrado este mês</p>
        )}
      </div>

      <div className="tips-section">
        <h3>Dicas Financeiras</h3>
        {willOverspend ? (
          <div className="tip warning-tip">
            ⚠️ No ritmo atual, você gastará mais do que seu orçamento neste
            ciclo. Considere reduzir despesas na categoria{" "}
            {Object.entries(categoryData)
              .sort((a, b) => b[1] - a[1])
              .map(([category]) => category)[0] || "principal"}
            .
          </div>
        ) : percentageSpent > 75 ? (
          <div className="tip caution-tip">
            ⚠️ Você já gastou mais de 75% do seu salário neste ciclo. Atente-se
            aos gastos nos próximos {ciclo.diasRestantes} dias.
          </div>
        ) : (
          <div className="tip success-tip">
            ✅ Você está controlando bem seus gastos neste ciclo! Continue assim
            para os próximos {ciclo.diasRestantes} dias.
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardSummary;
