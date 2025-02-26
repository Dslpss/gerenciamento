/**
 * Utilitários para gerenciar o localStorage
 */

// Verifica se o localStorage está disponível
export const isLocalStorageAvailable = () => {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

// Função para salvar dados no localStorage
export const saveToLocalStorage = (key, value) => {
  try {
    console.log(`Salvando ${key}:`, value);
    // Garantir que números sejam salvos como números
    const valueToSave = typeof value === "number" ? Number(value) : value;
    const serializedState = JSON.stringify(valueToSave);
    localStorage.setItem(key, serializedState);
    console.log(`${key} salvo com sucesso:`, localStorage.getItem(key));
  } catch (err) {
    console.error(`Erro ao salvar ${key} no localStorage:`, err);
  }
};

// Função para carregar dados do localStorage
export const loadFromLocalStorage = (key, defaultValue) => {
  try {
    console.log(`Carregando ${key}...`);
    const serializedState = localStorage.getItem(key);

    if (serializedState === null) {
      console.log(`${key} não encontrado, usando valor padrão:`, defaultValue);
      return defaultValue;
    }

    const parsedValue = JSON.parse(serializedState);

    // Garantir que números sejam retornados como números
    if (typeof defaultValue === "number") {
      const numValue = Number(parsedValue);
      return isNaN(numValue) ? defaultValue : numValue;
    }

    console.log(`${key} carregado:`, parsedValue);
    return parsedValue;
  } catch (err) {
    console.error(`Erro ao carregar ${key} do localStorage:`, err);
    return defaultValue;
  }
};

// Remove dados do localStorage
export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Erro ao remover ${key} do localStorage:`, error);
    return false;
  }
};

// Limpa todo o localStorage
export const clearLocalStorage = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error("Erro ao limpar o localStorage:", error);
    return false;
  }
};
