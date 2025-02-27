import React, { useState, useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import ExpenseSummary from "./components/ExpenseSummary";
import ExpenseFilter from "./components/ExpenseFilter";
import SalaryManager from "./components/SalaryManager";
import AnnualReport from "./components/AnnualReport";
import DataManager from "./components/DataManager";
import { saveToLocalStorage } from "./utils/storage";
import Navbar from "./components/Navbar";
import { useAuth } from "./contexts/AuthContext";
import AuthScreen from "./components/AuthScreen";
import {
  atualizarDadosSalario,
  carregarDadosIniciais,
} from "./firebase/firebaseUtils";
import Header from "./components/Header";
import "./styles/Header.css";
import { ExpenseProvider, useExpenses } from "./contexts/ExpenseContext";
import DashboardSummary from "./components/DashboardSummary";
import ExpenseCalendar from "./components/ExpenseCalendar";

function AppContent() {
  const { currentUser } = useAuth();
  const { expenses } = useExpenses();
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
  const [selectedDayExpenses, setSelectedDayExpenses] = useState(null);

  useEffect(() => {
    const carregarDados = async () => {
      if (!currentUser) return;

      try {
        console.log("Iniciando carregamento de dados para", currentUser.email);
        const dados = await carregarDadosIniciais(currentUser.uid);

        if (dados.salario !== undefined) {
          setSalary(dados.salario);
          console.log("Salário carregado:", dados.salario);
        }

        setMonthlySalaries(dados.monthlySalaries || {});
        setSalaryHistory(dados.salaryHistory || []);
        console.log("Dados de salário carregados com sucesso");
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };

    carregarDados();
  }, [currentUser]);

  // Salvar dados quando alterados
  useEffect(() => {
    if (!currentUser) return;

    try {
      console.log("Salvando salary:", salary);
      saveToLocalStorage("salary", salary);
    } catch (error) {
      console.error("Erro ao salvar salary:", error);
    }
    // Adicionando currentUser às dependências
  }, [salary, currentUser]);

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

      // Atualizar estado local primeiro
      setSalary(newSalary);

      // Atualizar no Firestore
      try {
        await atualizarDadosSalario(currentUser.uid, {
          defaultSalary: newSalary,
          monthlySalaries,
          salaryHistory,
        });

        // Atualizar também na coleção userData para garantir compatibilidade
        const { setDoc, doc, serverTimestamp } = require("firebase/firestore");
        const { db } = require("./firebase/config");

        await setDoc(
          doc(db, "userData", currentUser.uid),
          {
            salario: newSalary,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        console.log("Salário atualizado com sucesso no Firestore");
      } catch (firebaseError) {
        console.warn("Falha ao salvar no Firebase:", firebaseError);
        console.log("Salário atualizado apenas localmente");
        // Continuamos com o estado local atualizado mesmo com falha no Firebase
      }
    } catch (error) {
      console.error("Erro ao atualizar salário:", error);
      alert("Erro ao atualizar salário: " + error.message);
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

  // Função para lidar com o clique em um dia do calendário
  const handleCalendarDayClick = (date, dayExpenses) => {
    setSelectedDayExpenses({
      date: date,
      expenses: dayExpenses,
    });
  };

  // Fechar o modal de despesas do dia
  const closeDayExpensesModal = () => {
    setSelectedDayExpenses(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="page-content">
            <DashboardSummary salary={getApplicableSalary()} />
            <ExpenseCalendar onDayClick={handleCalendarDayClick} />
            <ExpenseSummary
              expenses={filteredExpenses}
              salary={getApplicableSalary()}
              isMonthlyView={true}
            />
          </div>
        );
      case "expenses":
        return (
          <div className="page-content">
            <ExpenseFilter filters={filters} setFilters={setFilters} />
            <ExpenseList onEdit={startEditExpense} />
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

  if (!currentUser) {
    return (
      <AuthScreen onLoginSuccess={() => console.log("Usuário autenticado")} />
    );
  }

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        {editingExpense ? (
          <div className="modal">
            <ExpenseForm
              editingExpense={editingExpense}
              onClose={() => setEditingExpense(null)}
            />
          </div>
        ) : selectedDayExpenses ? (
          <div className="modal">
            <div className="day-expenses-modal">
              <div className="modal-header">
                <h3>
                  Gastos de{" "}
                  {selectedDayExpenses.date.toLocaleDateString("pt-BR")}
                </h3>
                <button
                  className="close-button"
                  onClick={closeDayExpensesModal}>
                  &times;
                </button>
              </div>
              <div className="day-expenses-list">
                {selectedDayExpenses.expenses.map((expense) => (
                  <div key={expense.id} className="day-expense-item">
                    <div>
                      <strong>{expense.description}</strong>
                      <div className="expense-category">{expense.category}</div>
                    </div>
                    <div className="expense-amount">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(expense.amount)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="day-expenses-total">
                <span>Total:</span>
                <strong>
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(
                    selectedDayExpenses.expenses.reduce(
                      (total, expense) => total + expense.amount,
                      0
                    )
                  )}
                </strong>
              </div>
              <div className="modal-actions">
                <button className="primary" onClick={closeDayExpensesModal}>
                  Fechar
                </button>
              </div>
            </div>
          </div>
        ) : (
          renderContent()
        )}
      </main>

      {activeTab === "expenses" && !editingExpense && !selectedDayExpenses && (
        <button className="fab" onClick={() => setEditingExpense({})}>
          +
        </button>
      )}

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ExpenseProvider>
        <AppContent />
      </ExpenseProvider>
    </AuthProvider>
  );
}

export default App;
