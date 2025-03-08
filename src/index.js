import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";

// Importar estilos
import "./styles/global.css";
import "./styles/DashboardSummary.css"; // Adicione esta linha se não existir
import "@fortawesome/fontawesome-free/css/all.min.css";

// Verificação da configuração do Firebase
import { auth } from "./firebase/config";
console.log("Status inicial do Firebase Auth:", {
  initialized: !!auth,
  currentUser: auth.currentUser,
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
