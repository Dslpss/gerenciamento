import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const ForgotPassword = ({ onBack }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Por favor, insira um email válido");
      return;
    }

    try {
      setMessage("");
      setError("");
      setLoading(true);

      await resetPassword(email);
      setMessage("Instruções de recuperação enviadas para seu email");
    } catch (error) {
      console.error("Erro ao recuperar senha:", error);

      switch (error.code) {
        case "auth/user-not-found":
          setError("Email não encontrado");
          break;
        case "auth/invalid-email":
          setError("Email inválido");
          break;
        default:
          setError("Erro ao recuperar senha. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-form">
      <h2>Recuperar Senha</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Recuperar Senha"}
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={onBack}
            disabled={loading}>
            Voltar para Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
