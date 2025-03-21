/**
 * Converte uma string de data para o formato ISO
 *
 * @param {string} dateString - String de data para formatar (YYYY-MM-DD)
 * @returns {string|null} String de data no formato ISO ou null se inválida
 */
export const formatDateToISO = (dateString) => {
  try {
    if (!dateString) {
      return null;
    }

    // Se já for uma data ISO, retorna ela mesma
    if (dateString.includes("T")) {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : dateString;
    }

    // Converte YYYY-MM-DD para data ISO
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0); // Meio-dia para evitar problemas de timezone

    return isNaN(date.getTime()) ? null : date.toISOString();
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return null;
  }
};

/**
 * Normaliza uma data para o início do dia no fuso horário local
 * para evitar problemas de fuso horário.
 *
 * @param {Date|string} date - Data para normalizar
 * @returns {Date} Data normalizada no início do dia
 */
export const normalizeDate = (date) => {
  let dateObj;

  if (typeof date === "string") {
    // Se for string no formato ISO (YYYY-MM-DD)
    const [year, month, day] = date.split("-").map((num) => parseInt(num, 10));
    dateObj = new Date(year, month - 1, day);
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    return new Date(); // Data padrão se inválida
  }

  // Normalizar para meia-noite no fuso horário local
  return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
};

/**
 * Formata uma data no formato ISO (YYYY-MM-DD) para uso em inputs HTML
 *
 * @param {Date|string} date - Data para formatar
 * @returns {string} String de data formatada como YYYY-MM-DD
 */
export const formatDateForInput = (date) => {
  const parsedDate = parseLocalDate(date);
  return `${parsedDate.getFullYear()}-${String(
    parsedDate.getMonth() + 1
  ).padStart(2, "0")}-${String(parsedDate.getDate()).padStart(2, "0")}`;
};

/**
 * Compara duas datas considerando apenas o dia, mês e ano
 * (ignorando horas, minutos, segundos)
 *
 * @param {Date|string} date1 - Primeira data
 * @param {Date|string} date2 - Segunda data
 * @returns {boolean} True se as datas forem iguais (mesmo dia)
 */
export const isSameDay = (date1, date2) => {
  const d1 = normalizeDate(date1);
  const d2 = normalizeDate(date2);

  return d1.getTime() === d2.getTime();
};

/**
 * Formata uma data ISO para exibição no formato local (pt-BR)
 *
 * @param {string} isoString - String de data no formato ISO
 * @returns {string} Data formatada para exibição
 */
export const formatDateForDisplay = (date) => {
  const parsedDate = parseLocalDate(date);
  return parsedDate.toLocaleDateString("pt-BR");
};

/**
 * Garante que a data seja tratada no fuso horário local do Brasil (UTC-3)
 *
 * @param {string} dateStr - String de data no formato YYYY-MM-DD
 * @returns {string} Data formatada como YYYY-MM-DD no fuso horário local
 */
export const ensureLocalDate = (dateStr) => {
  if (!dateStr) return null;

  try {
    // Dividir a string de data em componentes
    const [year, month, day] = dateStr.split("-").map(Number);

    // Criar data usando componentes para evitar conversões de fuso horário
    const localDate = new Date(year, month - 1, day);

    // Formatar de volta para string YYYY-MM-DD
    return `${localDate.getFullYear()}-${String(
      localDate.getMonth() + 1
    ).padStart(2, "0")}-${String(localDate.getDate()).padStart(2, "0")}`;
  } catch (error) {
    console.error("Erro ao processar data local:", error);
    return dateStr;
  }
};

/**
 * Converte uma string de data para um objeto Date, garantindo compatibilidade com fusos horários
 * @param {string} dateString - String de data no formato ISO ou similar
 * @returns {Date} - Objeto Date
 */
export const parseLocalDate = (dateString) => {
  if (!dateString) return new Date();

  try {
    // Se já for um objeto Date, retornar o próprio objeto
    if (dateString instanceof Date) return dateString;

    // Verificar formato YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split("-").map(Number);
      return new Date(year, month - 1, day);
    }

    // Para outros formatos, tentar criar o objeto Date diretamente
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn("Data inválida:", dateString);
      return new Date(); // Fallback para data atual
    }
    return date;
  } catch (e) {
    console.error("Erro ao processar data:", e);
    return new Date();
  }
};
