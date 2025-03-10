import React from "react";
import { analyzeTrends } from "../services/predictiveAnalysis";
import { useExpenses } from "../contexts/ExpenseContext";
import "../styles/PredictiveAnalysis.css";

const PredictiveAnalysis = ({ salary }) => {
  const { expenses, extraIncomes } = useExpenses();
  const analysis = analyzeTrends(expenses, salary, extraIncomes);

  const months = [
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

  const currentMonth = new Date().getMonth();
  const nextMonths = Array(3)
    .fill(0)
    .map((_, index) => months[(currentMonth + index + 1) % 12]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="predictive-analysis">
      <div className="analysis-header">
        <h3>Previsão Financeira</h3>
        <div className="confidence-badge" data-level={analysis.confidence}>
          Confiança:{" "}
          {analysis.confidence === "high"
            ? "Alta"
            : analysis.confidence === "medium"
            ? "Média"
            : "Baixa"}
        </div>
      </div>

      <div className="predictions-grid">
        {nextMonths.map((month, index) => {
          const prediction = analysis.predictions[index];
          return (
            <div key={month} className="prediction-card">
              <div className="month-label">{month}</div>
              <div className="prediction-details">
                <div className="prediction-item income">
                  <span>Receita Prevista:</span>
                  <span>{formatCurrency(prediction.income)}</span>
                </div>
                <div className="prediction-item expenses">
                  <span>Gastos Previstos:</span>
                  <span>{formatCurrency(prediction.expenses)}</span>
                </div>
                <div
                  className={`prediction-item balance ${
                    prediction.balance >= 0 ? "positive" : "negative"
                  }`}>
                  <span>Saldo Previsto:</span>
                  <span>{formatCurrency(prediction.balance)}</span>
                </div>
              </div>
              <div className="trend-indicator">
                <i
                  className={`fas fa-arrow-${
                    prediction.balance >= 0 ? "up" : "down"
                  }`}></i>
                {prediction.balance >= 0 ? "Superávit" : "Déficit"}
              </div>
            </div>
          );
        })}
      </div>

      <div className="analysis-details">
        <div className="detail-item">
          <span>Tendência de gastos:</span>
          <span
            className={
              analysis.trends.expenses.slice(-1)[0] >
              analysis.trends.expenses.slice(-2)[0]
                ? "increasing"
                : "decreasing"
            }>
            {analysis.trends.expenses.slice(-1)[0] >
            analysis.trends.expenses.slice(-2)[0]
              ? "↗ Aumentando"
              : "↘ Diminuindo"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalysis;
