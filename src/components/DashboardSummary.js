import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { useExpenses } from "../contexts/ExpenseContext";
import "../styles/DashboardSummary.css";

const DashboardSummary = ({ salary }) => {
  const { expenses } = useExpenses();

  // Dados para o mês atual
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Filtrar despesas do mês atual
  const currentMonthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return (
      expenseDate.getMonth() === currentMonth &&
      expenseDate.getFullYear() === currentYear
    );
  });

  // Calcular total gasto este mês
  const totalSpent = currentMonthExpenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  // Calcular percentual do salário gasto
  const percentageSpent = salary > 0 ? (totalSpent / salary) * 100 : 0;

  // Calcular dias restantes no mês
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysRemaining = daysInMonth - currentDate.getDate();

  // Agrupar por categoria para o gráfico
  const categoryData = {};
  currentMonthExpenses.forEach((expense) => {
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
  ];

  // Formatar moeda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  // Calcular média diária de gasto
  const daysPassed = currentDate.getDate();
  const dailyAverage = daysPassed > 0 ? totalSpent / daysPassed : 0;

  // Projeção até o fim do mês
  const projectedTotal = totalSpent + dailyAverage * daysRemaining;
  const willOverspend = projectedTotal > salary;

  return (
    <div className="dashboard-summary">
      <h2>Resumo do Mês Atual</h2>

      <div className="summary-cards">
        <div className="summary-card">
          <h3>Gasto até agora</h3>
          <div className="amount">{formatCurrency(totalSpent)}</div>
          <div className="percentage">
            {percentageSpent.toFixed(1)}% do salário
          </div>
        </div>

        <div className="summary-card">
          <h3>Média diária</h3>
          <div className="amount">{formatCurrency(dailyAverage)}</div>
          <div className="info">Baseado nos últimos {daysPassed} dias</div>
        </div>

        <div className={`summary-card ${willOverspend ? "warning" : ""}`}>
          <h3>Projeção do mês</h3>
          <div className="amount">{formatCurrency(projectedTotal)}</div>
          <div className="info">
            {willOverspend
              ? `Você excederá o orçamento em ${formatCurrency(
                  projectedTotal - salary
                )}`
              : `Você economizará ${formatCurrency(salary - projectedTotal)}`}
          </div>
        </div>
      </div>

      <div className="chart-section">
        <h3>Gastos por Categoria</h3>
        {chartData.length > 0 ? (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={85}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value">
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{
                    paddingTop: "20px",
                    width: "100%",
                  }}
                  formatter={(value, entry, index) => {
                    const category = chartData[index].name;
                    const amount = chartData[index].value;
                    const percent =
                      ((amount / totalSpent) * 100).toFixed(0) + "%";
                    return (
                      <span className="custom-legend-item">
                        <span className="category-name">{category}:</span>
                        <span className="category-percent">{percent}</span>
                        <span className="category-amount">
                          ({formatCurrency(amount)})
                        </span>
                      </span>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="no-data">Nenhum gasto registrado este mês</p>
        )}
      </div>

      <div className="tips-section">
        <h3>Dicas Financeiras</h3>
        {willOverspend ? (
          <div className="tip warning-tip">
            ⚠️ No ritmo atual, você gastará mais do que seu orçamento este mês.
            Considere reduzir despesas na categoria{" "}
            {Object.entries(categoryData)
              .sort((a, b) => b[1] - a[1])
              .map(([category]) => category)[0] || "principal"}
            .
          </div>
        ) : percentageSpent > 75 ? (
          <div className="tip caution-tip">
            ⚠️ Você já gastou mais de 75% do seu orçamento. Atente-se aos gastos
            nas próximas semanas.
          </div>
        ) : (
          <div className="tip success-tip">
            ✅ Você está controlando bem seus gastos este mês! Continue assim.
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardSummary;
