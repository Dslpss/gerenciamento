import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const Login = ({ onSuccess, onCreateAccount, onForgotPassword }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      const userCredential = await login(email, password);
      onSuccess(userCredential.user);
    } catch (error) {
      console.error("Erro ao fazer login:", error);

      switch (error.code) {
        case "auth/wrong-password":
          setError("Senha incorreta");
          break;
        case "auth/user-not-found":
          setError("Email não encontrado");
          break;
        case "auth/invalid-email":
          setError("Email inválido");
          break;
        default:
          setError("Falha ao fazer login. Verifique seus dados.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form">
      <h2>Entrar</h2>

      {error && <div className="alert alert-danger">{error}</div>}

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

        <div className="form-group">
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="forgot-password-link">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-button">
              Esqueceu a senha?
            </button>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>
      </form>

      <div className="create-account">
        <p>Não tem uma conta?</p>
        <button type="button" className="text-button" onClick={onCreateAccount}>
          Criar uma conta
        </button>
      </div>
    </div>
  );
};

export default Login;
