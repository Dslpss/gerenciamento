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

export const formatDateForInput = (isoString) => {
  if (!isoString) return new Date().toISOString().split("T")[0];

  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split("T")[0];
    }
    return date.toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
};

export const formatDateForDisplay = (isoString) => {
  if (!isoString) return "";

  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("pt-BR");
  } catch {
    return "";
  }
};
