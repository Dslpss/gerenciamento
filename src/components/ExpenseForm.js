import React, { useState, useEffect } from "react";

const ExpenseForm = ({ addExpense, editingExpense, updateExpense }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Categorias padrão
  const categories = [
    "Alimentação",
    "Transporte",
    "Moradia",
    "Educação",
    "Lazer",
    "Saúde",
    "Outros",
  ];

  // Carregar dados para edição, quando necessário
  useEffect(() => {
    if (editingExpense) {
      setDescription(editingExpense.description);
      setAmount(editingExpense.amount);
      // Formatar a data para o formato esperado pelo input date
      const formattedDate = new Date(editingExpense.date)
        .toISOString()
        .split("T")[0];
      setDate(formattedDate);
      setCategory(editingExpense.category);
      setIsEditing(true);
    } else {
      resetForm();
      setIsEditing(false);
    }
  }, [editingExpense]);

  // Limpar formulário
  const resetForm = () => {
    setDescription("");
    setAmount("");
    setDate("");
    setCategory("");
  };

  // Manipular o envio do formulário
  const handleSubmit = (e) => {
    e.preventDefault();

    const expenseData = {
      description,
      amount: parseFloat(amount),
      date,
      category,
    };

    if (isEditing) {
      updateExpense({ ...expenseData, id: editingExpense.id });
    } else {
      addExpense(expenseData);
    }

    resetForm();
  };

  return (
    <div>
      <h2>{isEditing ? "Editar Gasto" : "Adicionar Novo Gasto"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="description">Descrição:</label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Valor (R$):</label>
          <input
            type="number"
            id="amount"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Data:</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Categoria:</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required>
            <option value="">Selecione uma categoria</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <button type="submit">
          {isEditing ? "Atualizar Gasto" : "Adicionar Gasto"}
        </button>

        {isEditing && (
          <button type="button" onClick={() => resetForm()}>
            Cancelar
          </button>
        )}
      </form>
    </div>
  );
};

export default ExpenseForm;
