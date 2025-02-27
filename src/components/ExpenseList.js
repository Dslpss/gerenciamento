import React, { useState, useMemo } from "react";
import { useExpenses } from "../contexts/ExpenseContext";
import "../styles/ExpenseList.css";
import LoadingIndicator from "./LoadingIndicator";
import { parseLocalDate } from "../utils/dateUtils"; // Adicionar esta importação

const ExpenseList = ({ onEdit }) => {
  const { expenses, deleteExpense, loading } = useExpenses();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Padrão: 10 itens por página
  const [viewMode, setViewMode] = useState("normal"); // "normal" ou "compact"
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Ordenar e filtrar gastos
  const filteredExpenses = useMemo(() => {
    // Primeiro filtra por termo de busca
    let filtered = expenses;
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = expenses.filter(
        (expense) =>
          expense.description?.toLowerCase().includes(search) ||
          expense.category?.toLowerCase().includes(search)
      );
    }

    // Então ordena por data
    const sorted = [...filtered].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    // Detecta e corrige IDs duplicados
    const uniqueIds = new Set();
    const result = sorted.map((expense) => {
      // Se o ID já existe ou está ausente, gerar um novo
      if (!expense.id || uniqueIds.has(expense.id)) {
        const newId = `${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        console.log(
          `ID duplicado ou ausente detectado, substituindo por: ${newId}`
        );
        return { ...expense, id: newId };
      }

      // Adicionar ID ao conjunto de IDs vistos
      uniqueIds.add(expense.id);
      return expense;
    });

    return result;
  }, [expenses, searchTerm]);

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
