import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";

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
