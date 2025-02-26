import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const LogoutButton = ({ className = "logout-button" }) => {
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      // O redirecionamento normalmente seria tratado no contexto de autenticação
      // ou em um componente de nível superior
    } catch (error) {
      console.error("Erro ao deslogar:", error);
      alert("Erro ao sair da conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleLogout} disabled={loading} className={className}>
      {loading ? "Saindo..." : "Sair"}
    </button>
  );
};

export default LogoutButton;
