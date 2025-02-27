import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { limparTodosDados } from "../firebase/firebaseUtils";
import {
  isLocalStorageAvailable,
  saveToLocalStorage,
  loadFromLocalStorage,
  clearLocalStorage,
} from "../utils/storage";
import { useExpenses } from "../contexts/ExpenseContext"; // Importando o contexto

const DataManager = () => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [importData, setImportData] = useState("");
  const [showImport, setShowImport] = useState(false);
  const { currentUser } = useAuth();
  const { clearExpenses } = useExpenses(); // Usando o método do contexto

  // Verificar se o localStorage está disponível
  const isStorageAvailable = isLocalStorageAvailable();

  // Exportar todos os dados
  const handleExportData = () => {
    try {
      const data = {
        expenses: loadFromLocalStorage("expenses", []),
        salary: loadFromLocalStorage("salary", 0),
        monthlySalaries: loadFromLocalStorage("monthlySalaries", {}),
        salaryHistory: loadFromLocalStorage("salaryHistory", []),
        exportDate: new Date().toISOString(),
      };

      // Criar arquivo para download
      const dataStr = JSON.stringify(data);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = `gerenciamento_gastos_backup_${new Date()
        .toLocaleDateString("pt-BR")
        .replace(/\//g, "-")}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      setMessage({ type: "success", text: "Dados exportados com sucesso!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      setMessage({
        type: "error",
        text: "Erro ao exportar dados. Tente novamente.",
      });
    }
  };

  // Importar dados
  const handleImportData = () => {
    try {
      if (!importData) {
        setMessage({ type: "error", text: "Nenhum dado para importar" });
        return;
      }

      const data = JSON.parse(importData);

      // Validar dados importados
      if (!data.expenses || !Array.isArray(data.expenses)) {
        setMessage({ type: "error", text: "Formato de arquivo inválido" });
        return;
      }

      // Salvar dados no localStorage
      saveToLocalStorage("expenses", data.expenses || []);
      saveToLocalStorage("salary", data.salary || 0);
      saveToLocalStorage("monthlySalaries", data.monthlySalaries || {});
      saveToLocalStorage("salaryHistory", data.salaryHistory || []);

      setMessage({
        type: "success",
        text: `Dados importados com sucesso! ${data.expenses.length} gastos recuperados.`,
      });
      setShowImport(false);
      setImportData("");

      // Recarregar a página para atualizar os dados
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error("Erro ao importar dados:", error);
      setMessage({
        type: "error",
        text: "Erro ao importar dados. Verifique o formato do arquivo.",
      });
    }
  };

  // Limpar todos os dados
  const handleClearData = async () => {
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: "info", text: "Excluindo dados..." });

      if (!currentUser) {
        throw new Error("Usuário não autenticado");
      }

      // 1. Limpar dados no Firebase
      await limparTodosDados(currentUser.uid);
      console.log("Dados do Firebase excluídos com sucesso");

      // 2. Limpar dados no localStorage
      clearLocalStorage("expenses");
      clearLocalStorage("salary");
      clearLocalStorage("monthlySalaries");
      clearLocalStorage("salaryHistory");
      console.log("Dados do localStorage excluídos com sucesso");

      // 3. Limpar estado no contexto
      if (clearExpenses) {
        clearExpenses();
        console.log("Estado do contexto de despesas limpo");
      }

      setMessage({
        type: "success",
        text: "Todos os dados foram excluídos com sucesso!",
      });

      // Recarregar a página após alguns segundos, agora com localStorage limpo
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Erro ao limpar dados:", error);

      setMessage({
        type: "error",
        text: "Erro ao excluir dados: " + error.message,
      });
    } finally {
      setLoading(false);
      setIsConfirming(false);
    }
  };

  const handleCancel = () => {
    setIsConfirming(false);
  };

  // Manipular seleção de arquivo
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setImportData(e.target.result);
    };
    reader.readAsText(file);
  };

  if (!isStorageAvailable) {
    return (
      <div className="data-manager">
        <div className="alert warning">
          O armazenamento local não está disponível no seu navegador. Os dados
          não serão salvos.
        </div>
      </div>
    );
  }

  return (
    <div className="data-manager">
      <h2>Gerenciamento de Dados</h2>

      {message && (
        <div
          className={`alert ${
            message.type === "success" ? "success" : "warning"
          }`}>
          {message.text}
        </div>
      )}

      <div className="data-manager-actions">
        <button onClick={handleExportData} className="primary">
          Exportar Dados
        </button>

        <button
          onClick={() => setShowImport(!showImport)}
          className="secondary">
          {showImport ? "Cancelar Importação" : "Importar Dados"}
        </button>

        {isConfirming ? (
          <div className="confirmation-section">
            <p className="warning-text">
              Esta ação irá excluir permanentemente todos os seus dados.
              <br />
              Esta ação não pode ser desfeita.
            </p>
            <div className="confirmation-buttons">
              <button
                className="danger"
                onClick={handleClearData}
                disabled={loading}>
                {loading ? "Excluindo..." : "Sim, excluir tudo"}
              </button>
              <button
                className="secondary"
                onClick={handleCancel}
                disabled={loading}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            className="danger"
            onClick={handleClearData}
            disabled={loading}>
            Limpar Todos os Dados
          </button>
        )}
      </div>

      {showImport && (
        <div className="import-section">
          <h3>Importar Dados</h3>
          <p>Selecione um arquivo de backup para restaurar seus dados:</p>

          <div className="form-group">
            <input type="file" accept=".json" onChange={handleFileSelect} />
          </div>

          {importData && (
            <button onClick={handleImportData} className="primary">
              Confirmar Importação
            </button>
          )}

          <div className="alert warning">
            <strong>Atenção:</strong> Importar dados irá substituir todos os
            dados existentes.
          </div>
        </div>
      )}

      <div className="storage-info">
        <p>
          <strong>Sobre o armazenamento local:</strong>
        </p>
        <ul>
          <li>Todos os seus dados são armazenados apenas no seu navegador.</li>
          <li>
            Se você limpar os dados do navegador, seus dados serão perdidos.
          </li>
          <li>Recomendamos que exporte seus dados regularmente como backup.</li>
        </ul>
      </div>
    </div>
  );
};

export default DataManager;
