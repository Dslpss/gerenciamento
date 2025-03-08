import React, { useState, useMemo } from "react";
import { useExpenses } from "../contexts/ExpenseContext";
import "../styles/ExpenseList.css";
import LoadingIndicator from "./LoadingIndicator";
import { parseLocalDate } from "../utils/dateUtils";

const ExpenseList = ({ onEdit, filters }) => {
  const { expenses, deleteExpense, loading } = useExpenses();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState("normal");
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Filtrar e ordenar despesas
  const filteredExpenses = useMemo(() => {
    // Aplicar filtro de busca
    let result = expenses;

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (expense) =>
          expense.description?.toLowerCase().includes(search) ||
          expense.category?.toLowerCase().includes(search)
      );
    }

    // Aplicar filtros de categoria, mês e ano
    result = result.filter((expense) => {
      // Verificar se a despesa tem uma data válida
      if (!expense.date) return false;

      // Converter a string de data em objeto Date
      const expenseDate = parseLocalDate(expense.date);
      if (isNaN(expenseDate.getTime())) return false;

      // Extrair mês (1-12) e ano da despesa
      const expenseMonth = expenseDate.getMonth() + 1; // getMonth() retorna 0-11
      const expenseYear = expenseDate.getFullYear().toString();

      // Aplicar filtro de categoria
      const categoryMatch =
        filters.category === "todas" || expense.category === filters.category;

      // Aplicar filtro de mês (converter para string para comparação)
      const monthMatch =
        filters.month === "todos" || expenseMonth.toString() === filters.month;

      // Aplicar filtro de ano
      const yearMatch =
        filters.year === "todos" || expenseYear === filters.year;

      return categoryMatch && monthMatch && yearMatch;
    });

    // Ordenar por data (mais recente primeiro)
    return [...result].sort((a, b) => {
      const dateA = parseLocalDate(a.date);
      const dateB = parseLocalDate(b.date);
      return dateB - dateA;
    });
  }, [expenses, searchTerm, filters]);

  // Calcular paginação
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredExpenses.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Formatar data para exibição
  const formatDate = (dateString) => {
    // Usar a função parseLocalDate para garantir o tratamento correto do fuso horário
    const date = parseLocalDate(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  // Formatar valor para exibição
  const formatAmount = (amount) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const confirmDeleteExpense = (id) => {
    setConfirmDelete(id);
  };

  const handleDelete = async (id) => {
    if (confirmDelete !== id) {
      confirmDeleteExpense(id);
      return;
    }

    try {
      await deleteExpense(id);
      setConfirmDelete(null);
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir o item");
    }
  };

  const handleEdit = (expense) => {
    if (onEdit) {
      onEdit(expense);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset para primeira página ao mudar qtd
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset para primeira página ao buscar
  };

  // Renderizar controles de paginação
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="pagination-controls">
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="page-button">
          &laquo;
        </button>

        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="page-button">
          &lsaquo;
        </button>

        <span className="page-info">
          Página {currentPage} de {totalPages}
        </span>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="page-button">
          &rsaquo;
        </button>

        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="page-button">
          &raquo;
        </button>
      </div>
    );
  };

  // Renderizar item de despesa no modo compacto
  const renderCompactItem = (expense) => (
    <div
      key={expense.id}
      className={`expense-item compact ${
        confirmDelete === expense.id ? "confirm-delete" : ""
      }`}>
      <div className="expense-content">
        <div className="expense-info">
          <strong>{expense.description}</strong>
          <div className="meta-info">
            {formatAmount(expense.amount)} • {expense.category} •{" "}
            {formatDate(expense.date)}
          </div>
        </div>
        <div className="expense-actions">
          <button
            className="action-button edit-button"
            onClick={() => handleEdit(expense)}
            aria-label="Editar">
            ✎
          </button>
          <button
            className="action-button delete-button"
            onClick={() => handleDelete(expense.id)}
            aria-label="Excluir">
            {confirmDelete === expense.id ? "✓" : "X"}
          </button>
        </div>
      </div>
    </div>
  );

  // Renderizar item de despesa no modo normal
  const renderNormalItem = (expense) => (
    <div
      key={expense.id}
      className={`expense-item ${
        confirmDelete === expense.id ? "confirm-delete" : ""
      }`}>
      <div className="expense-details">
        <h3>{expense.description}</h3>
        <p>
          <span className="category-tag">{expense.category}</span>
          <span className="date-info">{formatDate(expense.date)}</span>
        </p>
      </div>
      <div className="expense-amount-actions">
        <div className="amount">{formatAmount(expense.amount)}</div>
        <div className="actions">
          <button className="edit" onClick={() => handleEdit(expense)}>
            Editar
          </button>
          <button className="delete" onClick={() => handleDelete(expense.id)}>
            {confirmDelete === expense.id ? "Confirmar" : "Excluir"}
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="expense-list-container">
      <div className="list-header">
        <h2>Lista de Gastos</h2>
        <div className="list-meta">
          {filteredExpenses.length} gastos • Total:{" "}
          {formatAmount(
            filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
          )}
        </div>
      </div>

      <div className="list-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar gastos..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          {searchTerm && (
            <button
              className="clear-search"
              onClick={() => setSearchTerm("")}
              aria-label="Limpar busca">
              &times;
            </button>
          )}
        </div>

        <div className="view-controls">
          <div className="view-mode-toggle">
            <button
              className={`view-button ${viewMode === "normal" ? "active" : ""}`}
              onClick={() => handleViewModeChange("normal")}
              aria-label="Visualização normal">
              ☰
            </button>
            <button
              className={`view-button ${
                viewMode === "compact" ? "active" : ""
              }`}
              onClick={() => handleViewModeChange("compact")}
              aria-label="Visualização compacta">
              ≡
            </button>
          </div>

          <select
            value={itemsPerPage}
            onChange={handlePerPageChange}
            className="items-per-page"
            aria-label="Itens por página">
            <option value="5">5 por página</option>
            <option value="10">10 por página</option>
            <option value="20">20 por página</option>
            <option value="50">50 por página</option>
          </select>
        </div>
      </div>

      {filteredExpenses.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum gasto encontrado.</p>
          {searchTerm && (
            <p>Tente ajustar sua pesquisa ou limpar os filtros.</p>
          )}
        </div>
      ) : (
        <>
          <div className={`expenses-list ${viewMode}`}>
            {currentItems.map((expense) =>
              viewMode === "compact"
                ? renderCompactItem(expense)
                : renderNormalItem(expense)
            )}
          </div>

          {renderPagination()}

          <div className="list-footer">
            <div className="showing-info">
              Mostrando {indexOfFirstItem + 1} a{" "}
              {Math.min(indexOfLastItem, filteredExpenses.length)} de{" "}
              {filteredExpenses.length} gastos
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExpenseList;
