/**
 * Define cores para cada categoria de gastos
 */
export const CATEGORY_COLORS = {
  Alimentação: "#e74c3c", // vermelho
  Moradia: "#3498db", // azul
  Transporte: "#f39c12", // laranja
  Lazer: "#2ecc71", // verde
  Saúde: "#9b59b6", // roxo
  Educação: "#1abc9c", // verde água
  Vestuário: "#e67e22", // laranja escuro
  Outros: "#95a5a6", // cinza
};

/**
 * Retorna a cor para uma categoria específica
 * @param {string} category - Nome da categoria
 * @returns {string} Código de cor hexadecimal
 */
export const getCategoryColor = (category) => {
  return CATEGORY_COLORS[category] || "#95a5a6"; // Cor padrão se não encontrar
};

/**
 * Calcula uma cor contrastante (preto ou branco) para texto
 * @param {string} hexColor - Cor de fundo em hexadecimal (ex: #RRGGBB)
 * @returns {string} Cor contrastante (#000000 ou #FFFFFF)
 */
export const getContrastColor = (hexColor) => {
  // Converter hex para RGB
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);

  // Calcular luminância (fórmula padrão)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Retornar branco para cores escuras e preto para cores claras
  return luminance > 0.5 ? "#000000" : "#ffffff";
};

/**
 * Lista de categorias disponíveis para seleção
 */
export const AVAILABLE_CATEGORIES = [
  { value: "Alimentação", label: "Alimentação" },
  { value: "Moradia", label: "Moradia" },
  { value: "Transporte", label: "Transporte" },
  { value: "Lazer", label: "Lazer" },
  { value: "Saúde", label: "Saúde" },
  { value: "Educação", label: "Educação" },
  { value: "Vestuário", label: "Vestuário" },
  { value: "Outros", label: "Outros" },
];
