import React, { useState, useEffect } from "react";
import { useFinancialGoals } from "../contexts/FinancialGoalsContext";
import "../styles/SalaryAdvanceManager.css";

const SalaryAdvanceManager = ({ salary }) => {
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [editingAdvance, setEditingAdvance] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const {
    addSalaryAdvance,
    confirmSalaryAdvance,
    salaryAdvances,
    updateSalaryAdvance,
    deleteSalaryAdvance,
  } = useFinancialGoals();

  // Efeito para carregar os vales
  useEffect(() => {
    console.log("Vales carregados:", salaryAdvances);
  }, [salaryAdvances]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addSalaryAdvance({
        amount: parseFloat(amount),
        expectedDate,
        requestedAt: new Date().toISOString(),
      });

      setFeedback({
        show: true,
        message: "Vale solicitado com sucesso!",
        type: "success",
      });

      resetForm();
    } catch (error) {
      console.error("Erro ao solicitar vale:", error);
      setFeedback({
        show: true,
        message: "Erro ao solicitar vale. Tente novamente.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
      // Limpar feedback após 3 segundos
      setTimeout(
        () => setFeedback({ show: false, message: "", type: "" }),
        3000
      );
    }
  };

  const handleEdit = (advance) => {
    setEditingAdvance(advance);
    setAmount(advance.amount.toString());
    setExpectedDate(advance.expectedDate);
    setShowForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateSalaryAdvance(editingAdvance.id, {
        amount: parseFloat(amount),
        expectedDate,
      });

      setFeedback({
        show: true,
        message: "Vale atualizado com sucesso!",
        type: "success",
      });

      resetForm();
    } catch (error) {
      console.error("Erro ao atualizar vale:", error);
      setFeedback({
        show: true,
        message: "Erro ao atualizar vale",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }

    try {
      await deleteSalaryAdvance(id);
      setFeedback({
        show: true,
        message: "Vale excluído com sucesso!",
        type: "success",
      });
    } catch (error) {
      console.error("Erro ao excluir vale:", error);
      setFeedback({
        show: true,
        message: "Erro ao excluir vale",
        type: "error",
      });
    } finally {
      setConfirmDelete(null);
    }
  };

  const resetForm = () => {
    setAmount("");
    setExpectedDate("");
    setShowForm(false);
    setEditingAdvance(null);
  };

  return (
    <div className="salary-advance-manager">
      <div className="advance-header">
        <h3>Gerenciamento de Vale</h3>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "Solicitar Vale"}
        </button>
      </div>

      {feedback.show && (
        <div className={`feedback-message ${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={editingAdvance ? handleUpdate : handleSubmit}
          className="advance-form">
          <div className="form-group">
            <label htmlFor="amount">
              Valor do Vale
              <span className="salary-reference">
                (Salário atual:{" "}
                {salary.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
                )
              </span>
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            {parseFloat(amount) > salary && (
              <div className="warning-message">
                ⚠️ O valor solicitado é maior que seu salário mensal
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="expectedDate">Data Prevista</label>
            <input
              type="date"
              id="expectedDate"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={isSubmitting}
              className={isSubmitting ? "submitting" : ""}>
              {isSubmitting
                ? "Processando..."
                : editingAdvance
                ? "Atualizar Vale"
                : "Confirmar Solicitação"}
            </button>
            {editingAdvance && (
              <button
                type="button"
                onClick={resetForm}
                className="cancel-button">
                Cancelar Edição
              </button>
            )}
          </div>
        </form>
      )}

      <div className="advances-list">
        {salaryAdvances && salaryAdvances.length > 0 ? (
          <>
            <div className="advances-sections">
              <div className="advances-section">
                <h4>Vales Pendentes</h4>
                {salaryAdvances
                  .filter((advance) => advance.status === "pending")
                  .map((advance) => (
                    <div key={advance.id} className="advance-item pending">
                      <div className="advance-info">
                        <strong>
                          {advance.amount.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </strong>
                        <span>
                          Previsto para:{" "}
                          {new Date(advance.expectedDate).toLocaleDateString()}
                        </span>
                        <span>Status: Pendente</span>
                      </div>
                      <div className="advance-actions">
                        <button
                          onClick={() => handleEdit(advance)}
                          className="action-button edit-button"
                          title="Editar vale">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(advance.id)}
                          className={`action-button delete-button ${
                            confirmDelete === advance.id ? "confirm" : ""
                          }`}
                          title={
                            confirmDelete === advance.id
                              ? "Confirmar exclusão"
                              : "Excluir vale"
                          }>
                          {confirmDelete === advance.id ? (
                            <i className="fas fa-check"></i>
                          ) : (
                            <i className="fas fa-trash"></i>
                          )}
                        </button>
                        <button
                          onClick={() => confirmSalaryAdvance(advance.id)}
                          className="action-button confirm-button"
                          title="Confirmar recebimento">
                          <i className="fas fa-money-bill-wave"></i>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="advances-section">
                <h4>Vales Recebidos</h4>
                {salaryAdvances
                  .filter((advance) => advance.status === "received")
                  .map((advance) => (
                    <div key={advance.id} className="advance-item received">
                      <div className="advance-info">
                        <strong>
                          {advance.amount.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </strong>
                        <span>
                          Recebido em:{" "}
                          {new Date(
                            advance.receivedAt?.toDate()
                          ).toLocaleDateString()}
                        </span>
                        <span>
                          Solicitado para:{" "}
                          {new Date(advance.expectedDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="advance-actions">
                        <button
                          onClick={() => handleDelete(advance.id)}
                          className={`action-button delete-button ${
                            confirmDelete === advance.id ? "confirm" : ""
                          }`}
                          title={
                            confirmDelete === advance.id
                              ? "Confirmar exclusão"
                              : "Excluir registro"
                          }>
                          {confirmDelete === advance.id ? (
                            <i className="fas fa-check"></i>
                          ) : (
                            <i className="fas fa-trash"></i>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        ) : (
          <div className="no-advances">Nenhum vale solicitado ainda.</div>
        )}
      </div>
    </div>
  );
};

export default SalaryAdvanceManager;
