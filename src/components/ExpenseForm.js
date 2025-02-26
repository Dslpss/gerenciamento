import React, { useState, useEffect } from "react";
import { formatDateForInput } from "../utils/dateUtils";
import { useExpenses } from "../contexts/ExpenseContext";

const ExpenseForm = ({ editingExpense, onClose }) => {
  const { addExpense, updateExpense } = useExpenses();

  // Estado único para os dados do formulário
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: "Outros",
  });

  // Validação de formulário
  const [errors, setErrors] = useState({});

  // Carregar dados de edição
  useEffect(() => {
    try {
      if (editingExpense && editingExpense.id) {
        const date = editingExpense.date
          ? formatDateForInput(editingExpense.date)
          : new Date().toISOString().split("T")[0];

        setFormData({
          description: editingExpense.description || "",
          amount: editingExpense.amount?.toString() || "",
          date,
          category: editingExpense.category || "Outros",
        });
      } else {
        // Reset form para novo gasto
        resetForm();
      }
    } catch (error) {
      console.error("Erro ao carregar dados do formulário:", error);
      resetForm();
    }
  }, [editingExpense]);

  // Reset do formulário
  const resetForm = () => {
    setFormData({
      description: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      category: "Outros",
    });
    setErrors({});
  };

  // Atualizar campo do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpar erro deste campo
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Validar formulário antes de enviar
  const validateForm = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória";
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      newErrors.amount = "Valor deve ser maior que zero";
    }

    try {
      const date = new Date(formData.date);
      if (isNaN(date.getTime())) {
        newErrors.date = "Data inválida";
      }
    } catch {
      newErrors.date = "Data inválida";
    }

    if (!formData.category) {
      newErrors.category = "Categoria é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const expenseData = {
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        date: formData.date,
        category: formData.category,
      };

      if (editingExpense && editingExpense.id) {
        await updateExpense(editingExpense.id, expenseData);
      } else {
        await addExpense(expenseData);
      }

      resetForm();
      if (onClose) onClose();
    } catch (error) {
      console.error("Erro ao submeter formulário:", error);
      setErrors((prev) => ({
        ...prev,
        form: "Erro ao salvar. Tente novamente.",
      }));
    }
  };

  // Categorias
  const categories = [
    "Alimentação",
    "Transporte",
    "Moradia",
    "Lazer",
    "Saúde",
    "Educação",
    "Vestuário",
    "Outros",
  ];

  return (
    <div className="expense-form">
      <h2>
        {editingExpense && editingExpense.id ? "Editar Gasto" : "Novo Gasto"}
      </h2>

      {errors.form && <div className="alert warning">{errors.form}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="description">Descrição:</label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={errors.description ? "has-error" : ""}
          />
          {errors.description && (
            <div className="error-message">{errors.description}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="amount">Valor (R$):</label>
          <input
            type="number"
            id="amount"
            name="amount"
            step="0.01"
            min="0.01"
            value={formData.amount}
            onChange={handleChange}
            className={errors.amount ? "has-error" : ""}
          />
          {errors.amount && (
            <div className="error-message">{errors.amount}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="date">Data:</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={errors.date ? "has-error" : ""}
          />
          {errors.date && <div className="error-message">{errors.date}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="category">Categoria:</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={errors.category ? "has-error" : ""}>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <div className="error-message">{errors.category}</div>
          )}
        </div>

        <div className="form-buttons">
          <button type="submit" className="primary">
            {editingExpense && editingExpense.id ? "Atualizar" : "Adicionar"}
          </button>
          <button type="button" className="secondary" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
