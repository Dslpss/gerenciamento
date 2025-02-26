import React, { useState, useEffect, useCallback } from "react";

const SalaryManager = ({
  salary,
  monthlySalaries,
  salaryHistory,
  updateSalary,
  updateMonthlySalary,
  addSalaryHistoryEntry,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [historyMode, setHistoryMode] = useState(false);
  const [salaryInput, setSalaryInput] = useState(salary || "");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [increaseReason, setIncreaseReason] = useState("");
  const [applyFromNow, setApplyFromNow] = useState(true);

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

  // Anos disponíveis (atual e 2 anteriores)
  const currentYear = new Date().getFullYear();
  const years = [
    currentYear,
    currentYear + 1,
    currentYear,
    currentYear - 1,
    currentYear - 2,
  ];

  // Obter salário para o mês e ano específicos com useCallback
  const getMonthlySalary = useCallback(
    (month, year) => {
      const key = `${year}-${month}`;
      return monthlySalaries[key] || 0;
    },
    [monthlySalaries]
  );

  useEffect(() => {
    // Buscar valor do salário para o mês/ano selecionado
    const monthlySalaryValue = getMonthlySalary(selectedMonth, selectedYear);
    setSalaryInput(monthlySalaryValue || salary || "");
  }, [selectedMonth, selectedYear, salary, getMonthlySalary]);

  // Lidar com envio do formulário de salário
  const handleSalarySubmit = (e) => {
    e.preventDefault();
    const parsedSalary = parseFloat(salaryInput);

    if (!isNaN(parsedSalary) && parsedSalary >= 0) {
      // Registrar o histórico de alteração salarial
      const previousValue =
        getMonthlySalary(selectedMonth, selectedYear) || salary;
      const isIncrease = parsedSalary > previousValue;
      const changeType = isIncrease
        ? "Aumento"
        : parsedSalary < previousValue
        ? "Redução"
        : "Ajuste";

      // Adicionar ao histórico
      const historyEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        previousValue: previousValue,
        newValue: parsedSalary,
        month: selectedMonth,
        year: selectedYear,
        type: changeType,
        reason: increaseReason || "Atualização de salário",
        percentChange:
          previousValue > 0
            ? ((parsedSalary - previousValue) / previousValue) * 100
            : 0,
      };

      addSalaryHistoryEntry(historyEntry);

      // Atualiza o salário padrão para futuros meses
      updateSalary(parsedSalary);

      // Atualiza o salário específico para o mês/ano selecionado
      updateMonthlySalary(selectedMonth, selectedYear, parsedSalary);

      // Se for um aumento e o usuário optou por aplicar daqui para frente
      if (isIncrease && applyFromNow) {
        applyIncreaseFromNow(parsedSalary);
      }

      // Limpar e fechar formulário
      setIncreaseReason("");
      setApplyFromNow(true);
      setEditMode(false);
    }
  };

  // Aplicar aumento a todos os meses futuros
  const applyIncreaseFromNow = (newSalary) => {
    const startMonth = selectedMonth;
    const startYear = selectedYear;

    // Aplicar novo salário para todos os meses futuros no mesmo ano
    for (let month = startMonth; month <= 12; month++) {
      updateMonthlySalary(month, startYear, newSalary);
    }

    // Aplicar para todos os meses no próximo ano
    const nextYear = startYear + 1;
    for (let month = 1; month <= 12; month++) {
      updateMonthlySalary(month, nextYear, newSalary);
    }
  };

  // Calcular salário acumulado do ano
  const calculateYearlySalary = (year) => {
    let total = 0;
    for (let i = 1; i <= 12; i++) {
      total += getMonthlySalary(i, year);
    }
    return total;
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

          <div className="form-check">
            <input
              type="checkbox"
              id="apply-future"
              checked={applyFromNow}
              onChange={(e) => setApplyFromNow(e.target.checked)}
            />
            <label htmlFor="apply-future">
              Aplicar este valor em todos os meses futuros
            </label>
          </div>

          <div className="form-buttons">
            <button type="submit">Salvar</button>
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
        <h2>Histórico de Alterações Salariais</h2>
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
                  <tr key={entry.id}>
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
                    <td>{formatAmount(entry.previousValue)}</td>
                    <td>{formatAmount(entry.newValue)}</td>
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
  const currentMonthSalary = getMonthlySalary(
    new Date().getMonth() + 1,
    currentYear
  );
  const annualSalary = calculateYearlySalary(currentYear);
  const nextYearSalary = calculateYearlySalary(currentYear + 1);

  return (
    <div className="salary-manager">
      <h2>Seus Salários</h2>
      <div className="salary-summary">
        <div className="salary-item">
          <strong>Salário do mês atual: </strong>
          {currentMonthSalary
            ? formatAmount(currentMonthSalary)
            : "Não definido"}
        </div>

        <div className="salary-item">
          <strong>Salário anual acumulado ({currentYear}): </strong>
          {formatAmount(annualSalary)}
        </div>

        <div className="salary-item">
          <strong>Projeção para {currentYear + 1}: </strong>
          {formatAmount(nextYearSalary)}
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
    </div>
  );
};

export default SalaryManager;
