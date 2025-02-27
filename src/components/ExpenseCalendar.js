import React, { useMemo, useState } from "react";
import { useExpenses } from "../contexts/ExpenseContext";
import "../styles/ExpenseCalendar.css";
import { parseLocalDate } from "../utils/dateUtils";

const ExpenseCalendar = ({ onDayClick }) => {
  const { expenses } = useExpenses();
  const today = new Date();

  // Estado para controlar qual mês/ano está sendo exibido
  const [displayMonth, setDisplayMonth] = useState(today.getMonth());
  const [displayYear, setDisplayYear] = useState(today.getFullYear());

  // Calcular dias no mês e dia da semana do primeiro dia
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(displayYear, displayMonth, 1).getDay();

  // Nomes dos dias da semana
  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // Nome do mês
  const monthNames = [
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
  ];

  // Função para navegar para o mês anterior
  const goToPrevMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
  };

  // Função para navegar para o próximo mês
  const goToNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
  };

  // Função para retornar ao mês atual
  const goToCurrentMonth = () => {
    setDisplayMonth(today.getMonth());
    setDisplayYear(today.getFullYear());
  };

  // Agrupar despesas por dia
  const expensesByDay = useMemo(() => {
    const groupedExpenses = {};

    expenses.forEach((expense) => {
      try {
        // Se não tem data, pular esta despesa
        if (!expense.date) {
          console.warn("Despesa sem data:", expense);
          return;
        }

        // Garantir que a data está no formato correto usando a função de utilidade
        let expenseDate = parseLocalDate(expense.date);

        // Verificar se a data é válida
        if (isNaN(expenseDate.getTime())) {
          console.error("Data inválida na despesa:", expense);
          return; // Pular esta despesa
        }

        // Obter os componentes da data
        const expenseMonth = expenseDate.getMonth();
        const expenseYear = expenseDate.getFullYear();
        const expenseDay = expenseDate.getDate();

        // Debug para verificar processamento de datas
        console.debug(
          "Processando despesa:",
          expense.description,
          "Data original:",
          expense.date,
          "Data processada:",
          expenseDate.toLocaleDateString("pt-BR"),
          "Dia:",
          expenseDay
        );

        // Verificar se a despesa é do mês/ano exibido
        if (expenseMonth === displayMonth && expenseYear === displayYear) {
          if (!groupedExpenses[expenseDay]) {
            groupedExpenses[expenseDay] = {
              total: 0,
              items: [],
            };
          }

          groupedExpenses[expenseDay].total += expense.amount || 0;
          groupedExpenses[expenseDay].items.push(expense);
        }
      } catch (error) {
        console.error(
          "Erro ao processar despesa para o calendário:",
          error,
          expense
        );
      }
    });

    return groupedExpenses;
  }, [expenses, displayMonth, displayYear]);

  // Calcular totais do mês
  const monthlyTotal = useMemo(() => {
    return Object.values(expensesByDay).reduce(
      (total, day) => total + day.total,
      0
    );
  }, [expensesByDay]);

  // Formatar moeda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  // Determinar classe CSS baseada no valor gasto no dia
  const getDayClass = (dayExpenses) => {
    if (!dayExpenses) return "";

    const total = dayExpenses.total;
    if (total > 500) return "day-high";
    if (total > 100) return "day-medium";
    return "day-low";
  };

  // Verificar se uma data é hoje
  const isToday = (day) => {
    return (
      day === today.getDate() &&
      displayMonth === today.getMonth() &&
      displayYear === today.getFullYear()
    );
  };

  // Função para lidar com o clique em um dia
  const handleDayClick = (day, expenses) => {
    if (onDayClick && expenses?.items?.length > 0) {
      onDayClick(new Date(displayYear, displayMonth, day), expenses.items);
    }
  };

  // Gerar células do calendário
  const generateCalendarCells = () => {
    const cells = [];

    // Adicionar células vazias para o início do mês
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(
        <div key={`empty-${i}`} className="calendar-cell empty"></div>
      );
    }

    // Adicionar dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const dayExpenses = expensesByDay[day];
      const todayClass = isToday(day) ? "today" : "";
      const hasExpenses = dayExpenses ? "has-expenses" : "";

      cells.push(
        <div
          key={`day-${day}`}
          className={`calendar-cell ${getDayClass(
            dayExpenses
          )} ${todayClass} ${hasExpenses}`}
          onClick={() => handleDayClick(day, dayExpenses)}>
          <div className="day-number">{day}</div>
          {dayExpenses && (
            <div className="day-expenses">
              <div className="expense-total">
                {formatCurrency(dayExpenses.total)}
              </div>
              <div className="expense-count">
                {dayExpenses.items.length} item(s)
              </div>
            </div>
          )}
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="expense-calendar">
      <div className="calendar-header">
        <div className="month-navigation">
          <button onClick={goToPrevMonth} className="month-nav-button">
            &lt;
          </button>
          <h3>
            {monthNames[displayMonth]} {displayYear}
            {(displayMonth !== today.getMonth() ||
              displayYear !== today.getFullYear()) && (
              <button onClick={goToCurrentMonth} className="today-button">
                Hoje
              </button>
            )}
          </h3>
          <button onClick={goToNextMonth} className="month-nav-button">
            &gt;
          </button>
        </div>
        <div className="monthly-total">
          Total do mês: <strong>{formatCurrency(monthlyTotal)}</strong>
        </div>
      </div>

      <div className="weekday-header">
        {weekdays.map((day) => (
          <div key={day} className="weekday-name">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid">{generateCalendarCells()}</div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-color day-high"></span>
          <span>Alto gasto (&gt; R$500)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color day-medium"></span>
          <span>Gasto médio (&gt; R$100)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color day-low"></span>
          <span>Gasto baixo</span>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCalendar;
