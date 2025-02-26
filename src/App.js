import React, { useState, useEffect } from "react";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import ExpenseSummary from "./components/ExpenseSummary";
import ExpenseFilter from "./components/ExpenseFilter";
import SalaryManager from "./components/SalaryManager";
import AnnualReport from "./components/AnnualReport";
import DataManager from "./components/DataManager";
import { saveToLocalStorage } from "./utils/storage";
import Navbar from "./components/Navbar";
import { createSafeExpense } from "./utils/dataCleaner";
import { useAuth } from "./contexts/AuthContext";
import AuthScreen from "./components/AuthScreen";
import {
  salvarDespesaFirestore,
  atualizarDadosSalario,
  carregarDadosIniciais,
} from "./firebase/firebaseUtils";

function App() {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filters, setFilters] = useState({
    category: "todas",
    month: "todos",
    year: new Date().getFullYear().toString(),
  });
  const [salary, setSalary] = useState(0);
  const [monthlySalaries, setMonthlySalaries] = useState({});
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const carregarDados = async () => {
      if (!currentUser) return;

      try {
        const dados = await carregarDadosIniciais(currentUser.uid);

        if (dados.salario !== undefined) {
          setSalary(dados.salario);
        }

        setMonthlySalaries(dados.monthlySalaries || {});
        setSalaryHistory(dados.salaryHistory || []);
        setExpenses(dados.expenses || []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };

    carregarDados();
  }, [currentUser]);

  // Salvar dados quando alterados
  useEffect(() => {
    if (!currentUser) return; // Não salvar se não houver usuário

    try {
      console.log("Salvando expenses:", expenses);
      saveToLocalStorage("expenses", expenses);
    } catch (error) {
      console.error("Erro ao salvar expenses:", error);
    }
  }, [expenses, currentUser]);

  useEffect(() => {
    try {
      console.log("Salvando salary:", salary);
      saveToLocalStorage("salary", salary);
    } catch (error) {
      console.error("Erro ao salvar salary:", error);
    }
  }, [salary]);

  useEffect(() => {
    try {
      console.log("Salvando monthlySalaries:", monthlySalaries);
      saveToLocalStorage("monthlySalaries", monthlySalaries);
    } catch (error) {
      console.error("Erro ao salvar monthlySalaries:", error);
    }
  }, [monthlySalaries]);

  useEffect(() => {
    try {
      console.log("Salvando salaryHistory:", salaryHistory);
      saveToLocalStorage("salaryHistory", salaryHistory);
    } catch (error) {
      console.error("Erro ao salvar salaryHistory:", error);
    }
  }, [salaryHistory]);

  // Atualizar o salário padrão
  const updateSalary = async (newSalary) => {
    try {
      if (!currentUser) {
        throw new Error("Usuário não autenticado");
      }

      console.log("Atualizando salário para:", newSalary);

      // Atualizar no Firestore
      await atualizarDadosSalario(currentUser.uid, {
        defaultSalary: newSalary,
        monthlySalaries,
        salaryHistory,
      });

      // Atualizar estado local
      setSalary(newSalary);

      console.log("Salário atualizado com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar salário:", error);
    }
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

  // Adicionar um novo gasto com validação
  const addExpense = async (expense) => {
    try {
      if (!currentUser) {
        throw new Error("Usuário não autenticado");
      }

      const newExpense = createSafeExpense({
        ...expense,
        id: Date.now().toString(),
      });

      // Salvar no Firestore
      await salvarDespesaFirestore(newExpense, currentUser.uid);

      // Atualizar estado local
      setExpenses((prev) => [...prev, newExpense]);

      console.log("Despesa salva com sucesso");
    } catch (error) {
      console.error("Erro ao adicionar despesa:", error);
    }
  };

  // Atualizar um gasto existente com validação
  const updateExpense = (updatedExpense) => {
    try {
      // Criar um objeto de despesa seguro com valores validados
      const safeExpense = createSafeExpense(updatedExpense);

      const updatedExpenses = expenses.map((expense) =>
        expense.id === updatedExpense.id ? safeExpense : expense
      );

      setExpenses(updatedExpenses);
      setEditingExpense(null);
    } catch (error) {
      console.error("Erro ao atualizar despesa:", error);
    }
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

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="page-content">
            <ExpenseSummary
              expenses={filteredExpenses}
              salary={getApplicableSalary()}
              isMonthlyView={true}
            />
            <div className="recent-expenses-section">
              <ExpenseList
                expenses={filteredExpenses.slice(0, 5)}
                onDelete={deleteExpense}
                onEdit={startEditExpense}
              />
            </div>
          </div>
        );

      case "expenses":
        return (
          <div className="page-content">
            <ExpenseFilter filters={filters} setFilters={setFilters} />
            <ExpenseList
              expenses={filteredExpenses}
              onDelete={deleteExpense}
              onEdit={startEditExpense}
            />
          </div>
        );

      case "reports":
        return (
          <div className="page-content">
            <AnnualReport
              expenses={expenses}
              monthlySalaries={monthlySalaries}
              defaultSalary={salary}
            />
          </div>
        );

      case "settings":
        return (
          <div className="page-content">
            <SalaryManager
              salary={salary}
              monthlySalaries={monthlySalaries}
              salaryHistory={salaryHistory}
              updateSalary={updateSalary}
              updateMonthlySalary={updateMonthlySalary}
              addSalaryHistoryEntry={addSalaryHistoryEntry}
            />
            <DataManager />
          </div>
        );

      default:
        return null;
    }
  };

  // Se não houver usuário autenticado, mostra a tela de autenticação
  if (!currentUser) {
    return (
      <AuthScreen onLoginSuccess={() => console.log("Usuário autenticado")} />
    );
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>Gerenciamento</h1>
      </div>

      <main className="main-content">
        {editingExpense ? (
          <div className="modal">
            <ExpenseForm
              addExpense={addExpense}
              editingExpense={editingExpense}
              updateExpense={updateExpense}
              onClose={() => setEditingExpense(null)}
            />
          </div>
        ) : (
          renderContent()
        )}
      </main>

      {activeTab === "expenses" && !editingExpense && (
        <button className="fab" onClick={() => setEditingExpense({})}>
          +
        </button>
      )}

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;
