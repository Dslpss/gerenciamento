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
  // Usar currentItems em vez de filteredExpenses diretamente para paginação
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

  // Função para obter cor baseada na categoria
  const getCategoryColor = (category) => {
    const categoryColors = {
      Alimentação: "#e74c3c",
      Moradia: "#3498db",
      Transporte: "#f39c12",
      Lazer: "#2ecc71",
      Saúde: "#9b59b6",
      Educação: "#1abc9c",
      Vestuário: "#e67e22",
      Outros: "#95a5a6",
    };

    return categoryColors[category] || "#95a5a6"; // Cor padrão se não encontrar
  };

  // Função para calcular cor de texto contrastante
  const getContrastColor = (hexColor) => {
    // Converter hex para RGB
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);

    // Calcular luminância (fórmula padrão)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Retornar branco para cores escuras e preto para cores claras
    return luminance > 0.5 ? "#000000" : "#ffffff";
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

  // Função para renderizar cada despesa
  const renderExpenses = () => {
    // Usar um Set para monitorar IDs já renderizados
    const renderedIds = new Set();

    return currentItems
      .map((expense) => {
        // Se já renderizamos este ID, pular
        if (renderedIds.has(expense.id)) {
          console.warn(`Despesa duplicada detectada, ID: ${expense.id}`);
          return null;
        }

        // Adicionar ID ao conjunto de IDs renderizados
        renderedIds.add(expense.id);

        const categoryColor = getCategoryColor(expense.category);
        const textColor = getContrastColor(categoryColor);

        return (
          <div
            key={expense.id}
            className={`expense-item ${
              viewMode === "compact" ? "compact" : ""
            }`}
            data-category={expense.category}>
            <div className="expense-main-info">
              <div className="expense-description">{expense.description}</div>
              <div className="expense-amount">
                {formatAmount(expense.amount)}
              </div>
            </div>

            <div className="expense-details">
              <div className="expense-date">{formatDate(expense.date)}</div>
              <div
                className="expense-category"
                style={{ backgroundColor: categoryColor, color: textColor }}>
                {expense.category}
              </div>
            </div>

            <div className="expense-actions">
              <button
                onClick={() => handleEdit(expense)}
                className="edit-button"
                aria-label="Editar">
                <i className="fas fa-edit"></i>
              </button>
              <button
                onClick={() => handleDelete(expense.id)}
                className={`delete-button ${
                  confirmDelete === expense.id ? "confirm" : ""
                }`}
                aria-label="Excluir">
                {confirmDelete === expense.id ? (
                  <i className="fas fa-check"></i>
                ) : (
                  <i className="fas fa-trash"></i>
                )}
              </button>
            </div>
          </div>
        );
      })
      .filter(Boolean);
  };

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

      <div className="expense-list">
        {loading ? (
          <div className="loading-indicator">Carregando...</div>
        ) : filteredExpenses.length > 0 ? (
          renderExpenses()
        ) : (
          <div className="no-expenses">Nenhuma despesa encontrada.</div>
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
    </div>
  );
};

export default ExpenseList;
