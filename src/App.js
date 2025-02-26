import React, { useState, useEffect } from "react";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import ExpenseSummary from "./components/ExpenseSummary";
import ExpenseFilter from "./components/ExpenseFilter";
import SalaryManager from "./components/SalaryManager";
import AnnualReport from "./components/AnnualReport";
import DataManager from "./components/DataManager";
import { loadFromLocalStorage, saveToLocalStorage } from "./utils/storage";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filters, setFilters] = useState({
    category: "todas",
    month: "todos",
    year: new Date().getFullYear().toString(),
  });
  const [salary, setSalary] = useState(0);
  const [monthlySalaries, setMonthlySalaries] = useState({});
  const [showAnnualReport, setShowAnnualReport] = useState(false);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [showDataManager, setShowDataManager] = useState(false);

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const savedExpenses = loadFromLocalStorage("expenses", []);
    const savedSalary = loadFromLocalStorage("salary", 0);
    const savedMonthlySalaries = loadFromLocalStorage("monthlySalaries", {});
    const savedSalaryHistory = loadFromLocalStorage("salaryHistory", []);

    setExpenses(savedExpenses);
    setSalary(savedSalary);
    setMonthlySalaries(savedMonthlySalaries);
    setSalaryHistory(savedSalaryHistory);
  }, []);

  // Salvar gastos no localStorage quando alterados
  useEffect(() => {
    saveToLocalStorage("expenses", expenses);
  }, [expenses]);

  // Salvar salário no localStorage quando alterado
  useEffect(() => {
    saveToLocalStorage("salary", salary);
  }, [salary]);

  // Salvar salários mensais no localStorage quando alterados
  useEffect(() => {
    saveToLocalStorage("monthlySalaries", monthlySalaries);
  }, [monthlySalaries]);

  // Salvar histórico de salário
  useEffect(() => {
    saveToLocalStorage("salaryHistory", salaryHistory);
  }, [salaryHistory]);

  // Atualizar o salário padrão
  const updateSalary = (newSalary) => {
    setSalary(newSalary);
  };

  // Atualizar um salário mensal específico
  const updateMonthlySalary = (month, year, amount) => {
    const key = `${year}-${month}`;
    setMonthlySalaries((prev) => ({
      ...prev,
      [key]: amount,
    }));
  };

  // Adicionar entrada ao histórico de salário
  const addSalaryHistoryEntry = (entry) => {
    setSalaryHistory((prevHistory) => [...prevHistory, entry]);
  };

  // Obter salário para um mês e ano específicos
  const getMonthlySalary = (month, year) => {
    const key = `${year}-${month}`;
    return monthlySalaries[key] || salary;
  };

  // Adicionar um novo gasto
  const addExpense = (expense) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString(),
      date: new Date(expense.date).toISOString(),
    };
    setExpenses([...expenses, newExpense]);
  };

  // Atualizar um gasto existente
  const updateExpense = (updatedExpense) => {
    const updatedExpenses = expenses.map((expense) =>
      expense.id === updatedExpense.id ? updatedExpense : expense
    );
    setExpenses(updatedExpenses);
    setEditingExpense(null);
  };

  // Remover um gasto
  const deleteExpense = (id) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };

  // Iniciar edição de um gasto
  const startEditExpense = (expense) => {
    setEditingExpense(expense);
  };

  // Filtrar os gastos com base nos filtros aplicados
  const filteredExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    const expenseMonth = expenseDate.getMonth() + 1;
    const expenseYear = expenseDate.getFullYear().toString();

    return (
      (filters.category === "todas" || expense.category === filters.category) &&
      (filters.month === "todos" ||
        expenseMonth.toString() === filters.month) &&
      (filters.year === "todos" || expenseYear === filters.year)
    );
  });

  // Determinar se estamos visualizando dados de um mês específico
  const isViewingMonthData = filters.month !== "todos";

  // Obter o salário aplicável com base nos filtros
  const getApplicableSalary = () => {
    if (isViewingMonthData && filters.year !== "todos") {
      return getMonthlySalary(parseInt(filters.month), parseInt(filters.year));
    }
    return salary;
  };

  // Alternar exibição do relatório anual
  const toggleAnnualReport = () => {
    setShowAnnualReport(!showAnnualReport);
  };

  return (
    <div className="container">
      <h1>Gerenciamento de Gastos</h1>

      <div className="card">
        <SalaryManager
          salary={salary}
          monthlySalaries={monthlySalaries}
          salaryHistory={salaryHistory}
          updateSalary={updateSalary}
          updateMonthlySalary={updateMonthlySalary}
          addSalaryHistoryEntry={addSalaryHistoryEntry}
        />
        <div className="report-actions">
          <button
            type="button"
            onClick={toggleAnnualReport}
            className="report-button">
            {showAnnualReport
              ? "Voltar ao Gerenciamento"
              : "Ver Relatório Anual"}
          </button>

          <button
            type="button"
            onClick={() => setShowDataManager(!showDataManager)}
            className={showDataManager ? "secondary" : "data-button"}>
            {showDataManager ? "Ocultar" : "Gerenciar"} Dados
          </button>
        </div>

        {showDataManager && <DataManager />}
      </div>

      {showAnnualReport ? (
        <div className="card">
          <AnnualReport
            expenses={expenses}
            monthlySalaries={monthlySalaries}
            defaultSalary={salary}
          />
        </div>
      ) : (
        <>
          <div className="card">
            <ExpenseForm
              addExpense={addExpense}
              editingExpense={editingExpense}
              updateExpense={updateExpense}
            />
          </div>

          <div className="card">
            <ExpenseFilter filters={filters} setFilters={setFilters} />
          </div>

          <div className="card">
            <ExpenseSummary
              expenses={filteredExpenses}
              salary={getApplicableSalary()}
              isMonthlyView={isViewingMonthData}
            />
          </div>

          <div className="card">
            <ExpenseList
              expenses={filteredExpenses}
              onDelete={deleteExpense}
              onEdit={startEditExpense}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
