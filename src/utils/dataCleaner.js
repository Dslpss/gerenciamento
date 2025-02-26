import { loadFromLocalStorage, saveToLocalStorage } from "./storage";

export const cleanupStorageData = () => {
  try {
    console.log("Iniciando limpeza dos dados...");

    // Carregar dados existentes com valores padrão mais seguros
    const rawExpenses = loadFromLocalStorage("expenses", []);
    const rawSalary = loadFromLocalStorage("salary", 0);
    const rawMonthlySalaries = loadFromLocalStorage("monthlySalaries", {});
    const rawSalaryHistory = loadFromLocalStorage("salaryHistory", []);

    console.log("Dados carregados:", {
      rawExpenses,
      rawSalary,
      rawMonthlySalaries,
      rawSalaryHistory,
    });

    // Validar cada despesa
    const validExpenses = rawExpenses
      .filter((expense) => {
        if (
          !expense ||
          !expense.id ||
          !expense.description ||
          expense.amount === undefined
        ) {
          return false;
        }
        return true;
      })
      .map((expense) => ({
        ...expense,
        amount: Number(expense.amount),
        date: expense.date || new Date().toISOString(),
      }));

    // Garantir que o salário é um número válido
    const salary =
      typeof rawSalary === "number" && !isNaN(rawSalary) ? rawSalary : 0;
    console.log("Salário carregado:", salary);

    // Validar salários mensais
    const monthlySalaries = {};
    Object.entries(rawMonthlySalaries).forEach(([key, value]) => {
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        monthlySalaries[key] = numValue;
      }
    });

    // Validar histórico de salários
    const salaryHistory = (rawSalaryHistory || [])
      .filter((item) => item && item.date && !isNaN(Number(item.amount)))
      .map((item) => ({
        ...item,
        amount: Number(item.amount),
        date: new Date(item.date).toISOString(),
      }));

    // Salvar dados validados
    const cleanData = {
      expenses: validExpenses,
      salary,
      monthlySalaries,
      salaryHistory,
    };

    console.log("Dados limpos:", cleanData);

    // Salvar cada conjunto de dados separadamente
    saveToLocalStorage("expenses", validExpenses);
    saveToLocalStorage("salary", salary);
    saveToLocalStorage("monthlySalaries", monthlySalaries);
    saveToLocalStorage("salaryHistory", salaryHistory);

    return cleanData;
  } catch (error) {
    console.error("Erro ao limpar dados:", error);
    return {
      expenses: [],
      salary: 0,
      monthlySalaries: {},
      salaryHistory: [],
    };
  }
};

/**
 * Cria uma nova despesa com valores padrão seguros
 */
export const createSafeExpense = (expenseData) => {
  const now = new Date();

  return {
    id: expenseData?.id || Date.now().toString(),
    description: expenseData?.description || "Nova despesa",
    amount: Number(expenseData?.amount) || 0,
    date: (() => {
      try {
        if (!expenseData?.date) return now.toISOString();

        const date = new Date(expenseData.date);
        return isNaN(date.getTime()) ? now.toISOString() : date.toISOString();
      } catch {
        return now.toISOString();
      }
    })(),
    category: expenseData?.category || "Outros",
  };
};
