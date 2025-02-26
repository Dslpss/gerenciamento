import React from "react";

const ExpenseFilter = ({ filters, setFilters }) => {
  // Categorias disponíveis
  const categories = [
    "Alimentação",
    "Transporte",
    "Moradia",
    "Educação",
    "Lazer",
    "Saúde",
    "Outros",
  ];

  // Meses para filtro
  const months = [
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

  // Criar array de anos (últimos 5 anos)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  // Selecionar o mês atual
  const selectCurrentMonth = () => {
    const currentMonth = (new Date().getMonth() + 1).toString();
    setFilters({
      ...filters,
      month: currentMonth,
      year: currentYear.toString(),
    });
  };

  return (
    <div>
      <h2>Filtros</h2>
      <div className="filters">
        <div className="form-group">
          <label htmlFor="category">Categoria:</label>
          <select
            id="category"
            name="category"
            value={filters.category}
            onChange={handleFilterChange}>
            <option value="todas">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="month">Mês:</label>
          <select
            id="month"
            name="month"
            value={filters.month}
            onChange={handleFilterChange}>
            <option value="todos">Todos os meses</option>
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="year">Ano:</label>
          <select
            id="year"
            name="year"
            value={filters.year}
            onChange={handleFilterChange}>
            <option value="todos">Todos os anos</option>
            {years.map((year) => (
              <option key={year} value={year.toString()}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <button type="button" onClick={selectCurrentMonth}>
          Mostrar Mês Atual
        </button>
      </div>
    </div>
  );
};

export default ExpenseFilter;
