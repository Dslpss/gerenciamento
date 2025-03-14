import React, { useState, useEffect, useCallback } from "react";
import { useExpenses } from "../contexts/ExpenseContext";
import { useAuth } from "../contexts/AuthContext";
import { useFinancialGoals } from "../contexts/FinancialGoalsContext"; // Adicionar este import
import {
  collection,
  doc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/config";
import "../styles/SalaryManager.css";
import SalaryAdvanceManager from "./SalaryAdvanceManager";

const SalaryManager = ({
  salary,
  monthlySalaries,
  salaryHistory,
  updateSalary,
  updateMonthlySalary,
  addSalaryHistoryEntry,
  salaryDay = 5,
  updateSalaryDay,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [historyMode, setHistoryMode] = useState(false);
  const [salaryInput, setSalaryInput] = useState(salary || "");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [increaseReason, setIncreaseReason] = useState("");
  const [applyFromNow, setApplyFromNow] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState("success"); // ou "warning"
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSalaryDay, setNewSalaryDay] = useState(salaryDay.toString());
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);
  const [extraIncome, setExtraIncome] = useState("");
  const [extraIncomeDescription, setExtraIncomeDescription] = useState("");
  const [editingExtraIncome, setEditingExtraIncome] = useState(null);
  const { extraIncomes, addExtraIncome, removeExtraIncome, updateExtraIncome } =
    useExpenses();
  const { currentUser } = useAuth(); // Adicionar hook useAuth
  const [salaryDeductions, setSalaryDeductions] = useState([]);
  const { removeSalaryDeduction } = useFinancialGoals();
  const [confirmDeleteDeduction, setConfirmDeleteDeduction] = useState(null);

  // Meses para seleção
  const months = [
    { value: 1, label: "Janeiro" },
    { value: 2, label: "Fevereiro" },
    { value: 3, label: "Março" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Maio" },
    { value: 6, label: "Junho" },
    { value: 7, label: "Julho" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Setembro" },
    { value: 10, label: "Outubro" },
    { value: 11, label: "Novembro" },
    { value: 12, label: "Dezembro" },
  ];

  // Anos disponíveis (atual e anteriores/posteriores)
  const currentYear = new Date().getFullYear();
  const years = [
    currentYear + 1,
    currentYear,
    currentYear - 1,
    currentYear - 2,
  ];

  // Obter salário para o mês e ano específicos com useCallback
  const getMonthlySalary = useCallback(
    (month, year) => {
      const key = `${year}-${month}`;
      const monthlySalary = monthlySalaries[key];
      return monthlySalary !== undefined ? monthlySalary : salary;
    },
    [monthlySalaries, salary]
  );

  useEffect(() => {
    // Buscar valor do salário para o mês/ano selecionado
    const monthlySalaryValue = getMonthlySalary(selectedMonth, selectedYear);
    setSalaryInput(monthlySalaryValue || salary || "");
  }, [selectedMonth, selectedYear, salary, getMonthlySalary]);

  // Atualizar o estado local quando o salário muda
  useEffect(() => {
    setSalaryInput(salary || "");
  }, [salary]);

  // Adicionar useEffect para carregar deduções
  useEffect(() => {
    if (!currentUser?.uid) return;

    const userRef = doc(db, "users", currentUser.uid);
    const deductionsRef = collection(userRef, "salaryDeductions");
    const q = query(deductionsRef, orderBy("date", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const deductions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSalaryDeductions(deductions);
      },
      (error) => {
        console.error("Erro ao carregar deduções:", error);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]); // Adicionado currentUser.uid como dependência

  // Função para mostrar feedback temporário
  const showTemporaryFeedback = (message, type = "success") => {
    setFeedbackMessage(message);
    setFeedbackType(type);
    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
    }, 3000); // feedback desaparece após 3 segundos
  };

  // Função para lidar com a mudança no checkbox
  const handleApplyFutureChange = (e) => {
    setApplyFromNow(e.target.checked);
  };

  // Lidar com envio do formulário de salário
  const handleSalarySubmit = async (e) => {
    e.preventDefault();
    const parsedSalary = parseFloat(salaryInput);

    if (!isNaN(parsedSalary) && parsedSalary >= 0) {
      try {
        setIsSubmitting(true);

        // Criar entrada do histórico
        const historyEntry = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          previousValue: salary,
          newValue: parsedSalary,
          type: parsedSalary > salary ? "Aumento" : "Ajuste",
          reason: increaseReason || "Atualização de salário",
          percentChange:
            salary > 0 ? ((parsedSalary - salary) / salary) * 100 : 0,
        };

        // Atualizar salário (isso vai salvar no Firestore)
        await updateSalary(parsedSalary);

        // Adicionar ao histórico
        await addSalaryHistoryEntry(historyEntry);

        // Se marcou para aplicar em meses futuros
        if (applyFromNow) {
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth() + 1;
          const currentYear = currentDate.getFullYear();

          for (let year = currentYear; year <= currentYear + 1; year++) {
            const startMonth = year === currentYear ? currentMonth : 1;
            for (let month = startMonth; month <= 12; month++) {
              await updateMonthlySalary(month, year, parsedSalary);
            }
          }
        }

        setIncreaseReason("");
        setApplyFromNow(true);
        setEditMode(false);
        showTemporaryFeedback("Salário atualizado com sucesso!");
      } catch (error) {
        console.error("Erro ao atualizar salário:", error);
        showTemporaryFeedback("Erro ao atualizar salário", "error");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Calcular salário acumulado do ano
  const calculateYearlySalary = useCallback(
    (year) => {
      let total = 0;
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();

      for (let month = 1; month <= 12; month++) {
        // Para o ano atual, usar dados reais até o mês atual
        if (year === currentYear) {
          const currentMonth = currentDate.getMonth() + 1;
          const monthSalary = getMonthlySalary(month, year);
          if (month <= currentMonth) {
            total += monthSalary || 0;
          } else {
            // Para meses futuros do ano atual, usar o salário atual
            total += salary || 0;
          }
        }
        // Para anos futuros, sempre usar o salário atual
        else if (year > currentYear) {
          total += salary || 0;
        }
        // Para anos passados, usar os dados históricos
        else {
          const monthSalary = getMonthlySalary(month, year);
          total += monthSalary || 0;
        }
      }
      return total;
    },
    [getMonthlySalary, salary]
  );

  // Função para obter o salário do mês atual
  const getCurrentMonthSalary = useCallback(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    return getMonthlySalary(currentMonth, currentYear);
  }, [getMonthlySalary]);

  // Função para calcular salário líquido (com deduções)
  const calculateNetSalary = (grossSalary, month, year) => {
    const monthDeductions = salaryDeductions.filter((deduction) => {
      const deductionDate = deduction.date?.toDate() || new Date();
      return (
        deductionDate.getMonth() === month - 1 &&
        deductionDate.getFullYear() === year
      );
    });

    const totalDeductions = monthDeductions.reduce(
      (sum, deduction) => sum + deduction.amount,
      0
    );

    return grossSalary - totalDeductions;
  };

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

  // Formatar data para exibição
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const handleSaveSalaryDay = () => {
    const day = parseInt(newSalaryDay);
    if (!isNaN(day) && day >= 1 && day <= 31) {
      updateSalaryDay(day);
      addSalaryHistoryEntry({
        date: new Date().toISOString(),
        type: "salaryDayUpdate",
        value: day,
        previous: salaryDay,
      });
      setFeedbackMessage("Dia de pagamento atualizado com sucesso!");
      setFeedbackType("success");
      setShowFeedback(true);
    } else {
      setFeedbackMessage("Por favor, insira um dia válido (1-31)");
      setFeedbackType("error");
      setShowFeedback(true);
    }
  };

  // Função para formatar valor sensível
  const formatSensitiveAmount = (amount) => {
    return showSensitiveInfo ? formatAmount(amount) : "R$ ••••••";
  };

  // Função para adicionar ganho extra
  const handleAddExtraIncome = () => {
    const amount = parseFloat(extraIncome);
    if (!amount || amount <= 0 || !extraIncomeDescription) return;

    const newEntry = {
      amount,
      description: extraIncomeDescription,
      date: new Date().toISOString(),
    };

    addExtraIncome(newEntry);
    setExtraIncome("");
    setExtraIncomeDescription("");
    showTemporaryFeedback("Ganho extra registrado com sucesso!");
  };

  // Função para remover ganho extra
  const handleRemoveExtraIncome = (id) => {
    removeExtraIncome(id);
    showTemporaryFeedback("Ganho extra removido!", "warning");
  };

  // Função para iniciar edição de ganho extra
  const handleEditExtraIncome = (entry) => {
    setEditingExtraIncome(entry);
    setExtraIncome(entry.amount.toString());
    setExtraIncomeDescription(entry.description);
  };

  // Função para atualizar ganho extra
  const handleUpdateExtraIncome = () => {
    const amount = parseFloat(extraIncome);
    if (!amount || amount <= 0 || !extraIncomeDescription) return;

    updateExtraIncome(editingExtraIncome.id, {
      amount,
      description: extraIncomeDescription,
      updatedAt: new Date().toISOString(),
    });

    setExtraIncome("");
    setExtraIncomeDescription("");
    setEditingExtraIncome(null);
    showTemporaryFeedback("Ganho extra atualizado com sucesso!");
  };

  // Calcular total de ganhos extras
  const totalExtraIncome = extraIncomes.reduce(
    (sum, entry) => sum + entry.amount,
    0
  );

  // Adicionar função para remover dedução
  const handleRemoveDeduction = async (id) => {
    if (confirmDeleteDeduction !== id) {
      setConfirmDeleteDeduction(id);
      return;
    }

    try {
      await removeSalaryDeduction(id);
      setConfirmDeleteDeduction(null);
      showTemporaryFeedback("Dedução removida com sucesso");
    } catch (error) {
      console.error("Erro ao remover dedução:", error);
      showTemporaryFeedback("Erro ao remover dedução", "error");
    }
  };

  // Interface de formulário
  if (editMode) {
    return (
      <div className="salary-manager">
        <h2>Configurar Salário</h2>
        <form onSubmit={handleSalarySubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="month">Mês:</label>
              <select
                id="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="year">Ano:</label>
              <select
                id="year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="salary">Valor do salário mensal (R$):</label>
            <input
              type="number"
              id="salary"
              min="0"
              step="0.01"
              value={salaryInput}
              onChange={(e) => setSalaryInput(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reason">Motivo da alteração (opcional):</label>
            <input
              type="text"
              id="reason"
              placeholder="Ex: Aumento anual, promoção, etc."
              value={increaseReason}
              onChange={(e) => setIncreaseReason(e.target.value)}
            />
          </div>

          <div className="form-check custom-checkbox">
            <input
              type="checkbox"
              id="apply-future"
              checked={applyFromNow}
              onChange={handleApplyFutureChange}
            />
            <label htmlFor="apply-future">
              Aplicar este valor em todos os meses futuros
            </label>
          </div>

          <div className="form-buttons">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => setEditMode(false)}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Interface de histórico
  if (historyMode && salaryHistory && salaryHistory.length > 0) {
    return (
      <div className="salary-manager">
        <h2>
          Histórico de Alterações Salariais
          <button
            className="toggle-sensitive-info"
            onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
            aria-label={
              showSensitiveInfo ? "Ocultar valores" : "Mostrar valores"
            }>
            <i className={`fas fa-eye${showSensitiveInfo ? "" : "-slash"}`}></i>
          </button>
        </h2>
        <div className="salary-history">
          <table className="history-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>De</th>
                <th>Para</th>
                <th>Variação</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {salaryHistory
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((entry) => (
                  <tr key={entry.id || entry.date}>
                    <td>{formatDate(entry.date)}</td>
                    <td
                      className={
                        entry.type === "Aumento"
                          ? "positive"
                          : entry.type === "Redução"
                          ? "negative"
                          : ""
                      }>
                      {entry.type}
                    </td>
                    <td>{formatSensitiveAmount(entry.previousValue)}</td>
                    <td>{formatSensitiveAmount(entry.newValue)}</td>
                    <td
                      className={
                        entry.percentChange > 0
                          ? "positive"
                          : entry.percentChange < 0
                          ? "negative"
                          : ""
                      }>
                      {formatPercent(entry.percentChange)}
                    </td>
                    <td>{entry.reason}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <button
            type="button"
            className="secondary"
            onClick={() => setHistoryMode(false)}>
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // Interface padrão
  if (!editMode && !historyMode) {
    const currentMonthSalary = getCurrentMonthSalary();
    const currentYear = new Date().getFullYear();
    const annualSalary = calculateYearlySalary(currentYear);
    const nextYearSalary = salary * 12; // Simplificando a projeção para usar o salário atual

    return (
      <div className="salary-manager">
        <h2>
          Seus Salários
          <button
            className="toggle-sensitive-info"
            onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
            aria-label={
              showSensitiveInfo ? "Ocultar valores" : "Mostrar valores"
            }>
            <i className={`fas fa-eye${showSensitiveInfo ? "" : "-slash"}`}></i>
          </button>
        </h2>
        {showFeedback && (
          <div className={`alert ${feedbackType}`}>{feedbackMessage}</div>
        )}
        <div className="salary-summary">
          <div className="salary-item">
            <strong>Salário do mês atual: </strong>
            <span className="salary-value">
              {formatSensitiveAmount(currentMonthSalary || salary)}
            </span>
          </div>

          <div className="salary-item">
            <strong>Salário anual acumulado ({currentYear}): </strong>
            <span className="salary-value">
              {formatSensitiveAmount(annualSalary)}
            </span>
          </div>

          <div className="salary-item">
            <strong>Projeção para {currentYear + 1}: </strong>
            <span className="salary-value">
              {formatSensitiveAmount(nextYearSalary)}
            </span>
          </div>

          <div className="salary-item">
            <strong>Salário base definido: </strong>
            <span className="salary-value">
              {formatSensitiveAmount(salary)}
            </span>
          </div>

          <div className="salary-item">
            <strong>Salário bruto do mês atual: </strong>
            <span className="salary-value">
              {formatSensitiveAmount(currentMonthSalary)}
            </span>
          </div>
          <div className="salary-item">
            <strong>Vales e deduções: </strong>
            <div className="deductions-list">
              {salaryDeductions
                .filter((d) => {
                  const deductionDate = d.date?.toDate() || new Date();
                  return (
                    deductionDate.getMonth() === new Date().getMonth() &&
                    deductionDate.getFullYear() === new Date().getFullYear()
                  );
                })
                .map((deduction) => (
                  <div key={deduction.id} className="deduction-item">
                    <span>{formatSensitiveAmount(deduction.amount)}</span>
                    <button
                      onClick={() => handleRemoveDeduction(deduction.id)}
                      className={`remove-deduction ${
                        confirmDeleteDeduction === deduction.id ? "confirm" : ""
                      }`}
                      title={
                        confirmDeleteDeduction === deduction.id
                          ? "Confirmar remoção"
                          : "Remover"
                      }>
                      {confirmDeleteDeduction === deduction.id ? "✓" : "×"}
                    </button>
                  </div>
                ))}
            </div>
          </div>
          <div className="salary-item">
            <strong>Salário líquido do mês atual: </strong>
            <span className="salary-value">
              {formatSensitiveAmount(
                calculateNetSalary(
                  currentMonthSalary,
                  new Date().getMonth() + 1,
                  new Date().getFullYear()
                )
              )}
            </span>
          </div>

          <div className="salary-section">
            <h3>Dia de Recebimento do Salário</h3>
            <div className="input-group">
              <label>Dia do mês:</label>
              <div className="input-with-button">
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={newSalaryDay}
                  onChange={(e) => setNewSalaryDay(e.target.value)}
                  placeholder="Dia do pagamento"
                />
                <button onClick={handleSaveSalaryDay}>Salvar</button>
              </div>
            </div>
            <p className="help-text">
              Esse é o dia do mês em que você normalmente recebe seu salário.
              Essa informação ajuda a melhorar a projeção financeira do mês.
            </p>
          </div>

          <div className="salary-actions">
            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="edit">
              {salary ? "Atualizar Salário" : "Definir Salário"}
            </button>

            {salaryHistory && salaryHistory.length > 0 && (
              <button
                type="button"
                onClick={() => setHistoryMode(true)}
                className="history-button">
                Ver Histórico
              </button>
            )}
          </div>
        </div>

        <div className="extra-income-section">
          <h3>Ganhos Extras</h3>
          <div className="extra-income-form">
            <div className="input-group">
              <input
                type="number"
                value={extraIncome}
                onChange={(e) => setExtraIncome(e.target.value)}
                placeholder="Valor (R$)"
              />
              <input
                type="text"
                value={extraIncomeDescription}
                onChange={(e) => setExtraIncomeDescription(e.target.value)}
                placeholder="Descrição (ex: Freelance)"
              />
              {editingExtraIncome ? (
                <>
                  <button onClick={handleUpdateExtraIncome}>Atualizar</button>
                  <button
                    className="cancel-button"
                    onClick={() => {
                      setEditingExtraIncome(null);
                      setExtraIncome("");
                      setExtraIncomeDescription("");
                    }}>
                    Cancelar
                  </button>
                </>
              ) : (
                <button onClick={handleAddExtraIncome}>Adicionar</button>
              )}
            </div>
          </div>

          {extraIncomes.length > 0 && (
            <div className="extra-income-history">
              <h4>Histórico de Ganhos Extras</h4>
              <div className="extra-income-total">
                Total de ganhos extras:{" "}
                {formatSensitiveAmount(totalExtraIncome)}
              </div>
              <div className="extra-income-list">
                {extraIncomes.map((entry) => (
                  <div key={entry.id} className="extra-income-item">
                    <div className="extra-income-info">
                      <strong>{formatSensitiveAmount(entry.amount)}</strong>
                      <span>{entry.description}</span>
                      <small>
                        {new Date(entry.date).toLocaleDateString("pt-BR")}
                      </small>
                    </div>
                    <div className="extra-income-actions">
                      <button
                        className="edit-extra-income"
                        onClick={() => handleEditExtraIncome(entry)}
                        title="Editar">
                        ✎
                      </button>
                      <button
                        className="remove-extra-income"
                        onClick={() => handleRemoveExtraIncome(entry.id)}
                        title="Remover">
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="salary-section">
          <SalaryAdvanceManager salary={salary} />
        </div>
      </div>
    );
  }
};

export default SalaryManager;
