// Função para calcular média móvel
const calculateMovingAverage = (data, periods = 3) => {
  return data.map((_, index, array) => {
    const start = Math.max(0, index - periods + 1);
    const segment = array.slice(start, index + 1);
    return segment.reduce((sum, num) => sum + num, 0) / segment.length;
  });
};

// Função para detectar sazonalidade
const detectSeasonality = (expenses) => {
  const monthlyTotals = new Array(12).fill(0);
  const monthCount = new Array(12).fill(0);

  expenses.forEach((expense) => {
    const month = new Date(expense.date).getMonth();
    monthlyTotals[month] += expense.amount;
    monthCount[month]++;
  });

  return monthlyTotals.map((total, index) =>
    monthCount[index] > 0 ? total / monthCount[index] : 0
  );
};

// Calcular nível de confiança
const calculateConfidenceLevel = (data) => {
  if (data.length < 6) return "low";
  if (data.length < 12) return "medium";
  return "high";
};

// Análise principal atualizada para incluir renda
export const analyzeTrends = (expenses, baseIncome = 0, extraIncomes = []) => {
  // Garantir que baseIncome seja um número
  const safeBaseIncome = Number(baseIncome) || 0;

  // Agrupar gastos por mês
  const monthlyExpenses = expenses.reduce((acc, expense) => {
    const date = new Date(expense.date);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    if (!acc[key])
      acc[key] = {
        expenses: 0,
        income: safeBaseIncome,
        extraIncome: 0,
      };
    acc[key].expenses += Number(expense.amount) || 0;
    return acc;
  }, {});

  // Adicionar ganhos extras aos meses correspondentes
  extraIncomes.forEach((income) => {
    const date = new Date(income.date);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    if (!monthlyExpenses[key]) {
      monthlyExpenses[key] = {
        expenses: 0,
        income: safeBaseIncome,
        extraIncome: 0,
      };
    }
    monthlyExpenses[key].extraIncome += Number(income.amount) || 0;
  });

  // Converter para array ordenado com valores seguros
  const sortedData = Object.entries(monthlyExpenses)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([_, value]) => ({
      expenses: value.expenses,
      totalIncome: safeBaseIncome + (value.extraIncome || 0),
      balance: safeBaseIncome + (value.extraIncome || 0) - value.expenses,
    }));

  // Se não houver dados históricos suficientes, criar dados iniciais
  if (sortedData.length < 3) {
    const defaultData = {
      expenses: 0,
      totalIncome: safeBaseIncome,
      balance: safeBaseIncome,
    };
    while (sortedData.length < 3) {
      sortedData.push({ ...defaultData });
    }
  }

  // Calcular médias com valores seguros
  const lastThree = sortedData.slice(-3);
  const avgExpenses = lastThree.reduce((a, b) => a + (b.expenses || 0), 0) / 3;
  const avgIncome = Math.max(
    safeBaseIncome,
    lastThree.reduce((a, b) => a + (b.totalIncome || safeBaseIncome), 0) / 3
  );

  // Calcular previsões com valores seguros
  const predictions = Array(3)
    .fill(0)
    .map((_, index) => {
      const targetMonth = (new Date().getMonth() + index + 1) % 12;
      const seasonalFactor = detectSeasonality(expenses)[targetMonth] || 0;
      const predictedExpenses = Math.max(0, avgExpenses + seasonalFactor * 0.3);
      const predictedIncome = Math.max(safeBaseIncome, avgIncome);
      const predictedBalance = predictedIncome - predictedExpenses;

      return {
        month: targetMonth,
        expenses: Number(predictedExpenses.toFixed(2)),
        income: Number(predictedIncome.toFixed(2)),
        balance: Number(predictedBalance.toFixed(2)),
      };
    });

  // Calcular tendências com valores seguros
  const expenseTrend = calculateMovingAverage(
    sortedData.map((d) => d.expenses || 0)
  );
  const incomeTrend = calculateMovingAverage(
    sortedData.map((d) => d.totalIncome || safeBaseIncome)
  );
  const balanceTrend = calculateMovingAverage(
    sortedData.map((d) => d.balance || 0)
  );

  return {
    predictions,
    seasonality: detectSeasonality(expenses),
    trends: {
      expenses: expenseTrend.slice(-12).map((v) => Number(v.toFixed(2))),
      income: incomeTrend.slice(-12).map((v) => Number(v.toFixed(2))),
      balance: balanceTrend.slice(-12).map((v) => Number(v.toFixed(2))),
    },
    confidence: calculateConfidenceLevel(sortedData),
  };
};
