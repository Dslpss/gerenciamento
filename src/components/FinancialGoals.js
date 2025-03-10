import React, { useState } from "react";
import { useFinancialGoals } from "../contexts/FinancialGoalsContext";
import "../styles/FinancialGoals.css";

// Componente Dialog personalizado
const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="dialog-actions">
          <button onClick={onConfirm} className="confirm-button">
            Confirmar
          </button>
          <button onClick={onCancel} className="cancel-button">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente GoalCard
const GoalCard = ({ goal, onUpdate, onRemove }) => {
  const deadline = new Date(goal.deadline);

  // Calcular progresso real baseado no valor atual vs valor alvo
  const calculateProgress = () => {
    const currentAmount = goal.currentAmount || 0;
    const targetAmount = goal.targetAmount || 1; // evitar divisão por zero
    return Math.min((currentAmount / targetAmount) * 100, 100);
  };

  const progress = calculateProgress();
  const isCompleted = progress >= 100;

  // Calcular dias restantes
  const today = new Date();
  const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
  const isOverdue = daysLeft < 0;

  return (
    <div className="goal-card">
      <div className="goal-info">
        <div>
          <h3>{goal.title}</h3>
          <p>{goal.description}</p>
          <div className="deadline-info">
            <span className={`days-left ${isOverdue ? "overdue" : ""}`}>
              {isOverdue
                ? `Meta vencida há ${Math.abs(daysLeft)} dias`
                : `${daysLeft} dias restantes`}
            </span>
          </div>
        </div>
        <span
          className={`goal-status ${
            isCompleted
              ? "status-completed"
              : isOverdue
              ? "status-overdue"
              : "status-active"
          }`}>
          {isCompleted ? "Concluído" : isOverdue ? "Vencida" : "Em andamento"}
        </span>
      </div>

      <div className="goal-details">
        <span>
          Meta:{" "}
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(goal.targetAmount)}
        </span>
        <span>Prazo: {deadline.toLocaleDateString("pt-BR")}</span>
        <span>Categoria: {goal.category}</span>
      </div>

      <div className="goal-progress-info">
        <div className="goal-amounts">
          <span>
            Progresso:{" "}
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(goal.currentAmount || 0)}
            de{" "}
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(goal.targetAmount)}
          </span>
          <span>{progress.toFixed(1)}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="goal-actions">
        <button onClick={() => onUpdate(goal)} className="edit-button">
          Editar
        </button>
        <button onClick={() => onRemove(goal.id)} className="delete-button">
          Excluir
        </button>
      </div>
    </div>
  );
};

const FinancialGoals = () => {
  const { goals, addGoal, updateGoal, removeGoal } = useFinancialGoals();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    targetAmount: "",
    deadline: "",
    category: "",
    description: "",
  });
  const [dialog, setDialog] = useState({
    isOpen: false,
    type: null,
    goal: null,
    title: "",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        // Se tiver ID, atualiza a meta existente
        await updateGoal(formData.id, {
          ...formData,
          targetAmount: parseFloat(formData.targetAmount),
          deadline: new Date(formData.deadline).toISOString(),
        });
      } else {
        // Se não tiver ID, cria nova meta
        await addGoal({
          ...formData,
          targetAmount: parseFloat(formData.targetAmount),
          deadline: new Date(formData.deadline).toISOString(),
        });
      }

      // Limpar formulário e fechar
      setFormData({
        title: "",
        targetAmount: "",
        deadline: "",
        category: "",
        description: "",
      });
      setShowForm(false);
    } catch (error) {
      console.error("Erro ao salvar meta:", error);
    }
  };

  const handleUpdateGoal = (goal) => {
    setDialog({
      isOpen: true,
      type: "edit",
      goal: goal,
      title: "Editar Meta",
      message: `Deseja editar a meta "${goal.title}"?`,
    });
  };

  const handleRemoveGoal = (goalId, goalTitle) => {
    setDialog({
      isOpen: true,
      type: "delete",
      goal: { id: goalId, title: goalTitle },
      title: "Excluir Meta",
      message: `Tem certeza que deseja excluir a meta "${goalTitle}"? Esta ação não pode ser desfeita.`,
    });
  };

  const handleDialogConfirm = async () => {
    try {
      if (dialog.type === "edit") {
        setFormData({
          id: dialog.goal.id,
          title: dialog.goal.title,
          targetAmount: dialog.goal.targetAmount.toString(),
          deadline: new Date(dialog.goal.deadline).toISOString().split("T")[0],
          category: dialog.goal.category,
          description: dialog.goal.description,
        });
        setShowForm(true);
      } else if (dialog.type === "delete") {
        await removeGoal(dialog.goal.id);
      }
    } catch (error) {
      console.error("Erro ao processar ação:", error);
    }
    setDialog({
      isOpen: false,
      type: null,
      goal: null,
      title: "",
      message: "",
    });
  };

  return (
    <div className="financial-goals">
      <div className="goals-header">
        <h2>Metas Financeiras</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="add-goal-button">
          {showForm ? "Cancelar" : "Nova Meta"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="goal-form">
          <div className="form-group">
            <label htmlFor="title">Título da Meta</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="targetAmount">Valor da Meta</label>
              <input
                type="number"
                id="targetAmount"
                value={formData.targetAmount}
                onChange={(e) =>
                  setFormData({ ...formData, targetAmount: e.target.value })
                }
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label htmlFor="deadline">Prazo</label>
              <input
                type="date"
                id="deadline"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="category">Categoria</label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required>
              <option value="">Selecione uma categoria</option>
              <option value="Poupança">Poupança</option>
              <option value="Investimento">Investimento</option>
              <option value="Viagem">Viagem</option>
              <option value="Educação">Educação</option>
              <option value="Imóvel">Imóvel</option>
              <option value="Veículo">Veículo</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="submit">
              {formData.id ? "Atualizar" : "Criar Meta"}
            </button>
          </div>
        </form>
      )}

      <div className="goals-list">
        {goals.length > 0 ? (
          goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onUpdate={handleUpdateGoal}
              onRemove={() => handleRemoveGoal(goal.id, goal.title)}
            />
          ))
        ) : (
          <div className="no-goals">
            <p>Você ainda não tem metas definidas.</p>
            <p>Comece criando sua primeira meta!</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        onConfirm={handleDialogConfirm}
        onCancel={() =>
          setDialog({
            isOpen: false,
            type: null,
            goal: null,
            title: "",
            message: "",
          })
        }
      />
    </div>
  );
};

export default FinancialGoals;
