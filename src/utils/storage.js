/**
 * Utilitários para gerenciar o localStorage
 */

// Função para verificar se o localStorage está disponível
export const isLocalStorageAvailable = () => {
  try {
    const test = "__test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

// Salvar no localStorage
export const saveToLocalStorage = (key, data) => {
  try {
    if (isLocalStorageAvailable()) {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    }
    return false;
  } catch (error) {
    console.error("Erro ao salvar no localStorage:", error);
    return false;
  }
};

// Carregar do localStorage
export const loadFromLocalStorage = (key, defaultValue = null) => {
  try {
    if (isLocalStorageAvailable()) {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    }
    return defaultValue;
  } catch (error) {
    console.error("Erro ao carregar do localStorage:", error);
    return defaultValue;
  }
};

// Limpar item do localStorage
export const clearLocalStorage = (key) => {
  try {
    if (isLocalStorageAvailable()) {
      localStorage.removeItem(key);
      console.log(`Item '${key}' removido do localStorage`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Erro ao limpar item '${key}' do localStorage:`, error);
    return false;
  }
};

// Limpar todo o localStorage
export const clearAllLocalStorage = () => {
  try {
    if (isLocalStorageAvailable()) {
      localStorage.clear();
      console.log("Todo o localStorage foi limpo");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Erro ao limpar todo o localStorage:", error);
    return false;
  }
};
