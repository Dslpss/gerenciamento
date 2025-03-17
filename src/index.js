import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import logger from "./utils/logger";

// Importar estilos
import "./styles/global.css";
import "./styles/DashboardSummary.css"; // Adicione esta linha se não existir
import "@fortawesome/fontawesome-free/css/all.min.css";

// Verificação da configuração do Firebase
import { auth } from "./firebase/config";
logger.debug("Status inicial do Firebase Auth:", {
  initialized: !!auth,
  currentUser: null, // Não expor dados do usuário nos logs
});

// Suprimir warnings específicos em produção
if (process.env.NODE_ENV === "production") {
  const originalError = console.error;
  console.error = (...args) => {
    if (
      args[0]?.includes("downloadable font") ||
      args[0]?.includes("particionamento") ||
      args[0]?.includes("cookies")
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
