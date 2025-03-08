import React from "react";
import "../styles/ExpenseFilter.css";

const ExpenseFilter = ({ filters, setFilters }) => {
  const months = [
    { value: "todos", label: "Todos os Meses" },
    { value: "1", label: "Janeiro" },
    { value: "2", label: "Fevereiro" },
    { value: "3", label: "Março" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Maio" },
    { value: "6", label: "Junho" },
    { value: "7", label: "Julho" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
  ];

  const categories = [
    { value: "todas", label: "Todas as Categorias" },
    { value: "Alimentação", label: "Alimentação" },
    { value: "Transporte", label: "Transporte" },
    { value: "Moradia", label: "Moradia" },
    { value: "Lazer", label: "Lazer" },
    { value: "Saúde", label: "Saúde" },
    { value: "Educação", label: "Educação" },
    { value: "Vestuário", label: "Vestuário" },
    { value: "Outros", label: "Outros" },
  ];

  const years = [
    { value: "todos", label: "Todos os Anos" },
    { value: "2023", label: "2023" },
    { value: "2024", label: "2024" },
    { value: "2025", label: "2025" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      category: "todas",
      month: "todos",
      year: new Date().getFullYear().toString(),
    });
  };

  // Obter nomes descritivos para mostrar nos filtros ativos
  const getMonthName = (monthValue) => {
    const month = months.find((m) => m.value === monthValue);
    return month ? month.label : monthValue;
  };

  const getCategoryName = (categoryValue) => {
    const category = categories.find((c) => c.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  // Verificar se há filtros ativos
  const hasActiveFilters =
    filters.category !== "todas" ||
    filters.month !== "todos" ||
    filters.year !== "todos";

  return (
    <div className="expense-filter">
      <div className="filter-header">
        <h3>Filtrar Gastos</h3>
        {hasActiveFilters && (
          <button onClick={resetFilters} className="filter-reset">
            Limpar filtros
          </button>
        )}
      </div>

      <div className="filter-form">
        <div className="filter-group">
          <label htmlFor="category">Categoria</label>
          <select
            id="category"
            name="category"
            value={filters.category}
            onChange={handleChange}>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="month">Mês</label>
          <select
            id="month"
            name="month"
            value={filters.month}
            onChange={handleChange}>
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="year">Ano</label>
          <select
            id="year"
            name="year"
            value={filters.year}
            onChange={handleChange}>
            {years.map((year) => (
              <option key={year.value} value={year.value}>
                {year.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mostrar filtros ativos */}
      {hasActiveFilters && (
        <div className="active-filters">
          {filters.category !== "todas" && (
            <div className="filter-tag">
              <span className="filter-tag-text">Categoria:</span>
              <span className="filter-tag-value">
                {getCategoryName(filters.category)}
              </span>
              <button
                className="remove-filter"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, category: "todas" }))
                }
                aria-label="Remover filtro de categoria">
                ×
              </button>
            </div>
          )}
          {filters.month !== "todos" && (
            <div className="filter-tag">
              <span className="filter-tag-text">Mês:</span>
              <span className="filter-tag-value">
                {getMonthName(filters.month)}
              </span>
              <button
                className="remove-filter"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, month: "todos" }))
                }
                aria-label="Remover filtro de mês">
                ×
              </button>
            </div>
          )}
          {filters.year !== "todos" && (
            <div className="filter-tag">
              <span className="filter-tag-text">Ano:</span>
              <span className="filter-tag-value">{filters.year}</span>
              <button
                className="remove-filter"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, year: "todos" }))
                }
                aria-label="Remover filtro de ano">
                ×
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpenseFilter;
