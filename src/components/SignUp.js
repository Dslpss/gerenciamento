import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const SignUp = ({ onSuccess, onCancel }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup, updateUserProfile } = useAuth();

  const validateForm = () => {
    // Limpar erros anteriores
    setError("");

    // Validar email
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Email inválido. Por favor, digite um email válido.");
      return false;
    }

    // Validar nome
    if (!name.trim()) {
      setError("Por favor, digite seu nome.");
      return false;
    }

    // Validar senha
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return false;
    }

    // Confirmar senha
    if (password !== confirmPassword) {
      setError("As senhas não correspondem.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setError("");
      console.log("Iniciando processo de cadastro:", { email, name });

      // Criar o usuário no Firebase
      const userCredential = await signup(email, password);
      console.log("Usuário criado:", userCredential.user.uid);

      // Atualizar o nome de exibição do usuário
      if (userCredential.user) {
        try {
          await updateUserProfile({
            displayName: name,
          });
          console.log("Perfil atualizado com sucesso");

          // Notificar sucesso
          onSuccess && onSuccess(userCredential.user);
        } catch (profileError) {
          console.error("Erro ao atualizar perfil:", profileError);
          setError("Conta criada, mas houve um erro ao salvar o nome.");
        }
      }
    } catch (error) {
      console.error("Erro detalhado ao criar conta:", {
        code: error.code,
        message: error.message,
        email,
      });

      switch (error.code) {
        case "auth/email-already-in-use":
          setError("Este email já está em uso.");
          break;
        case "auth/invalid-email":
          setError("Email inválido.");
          break;
        case "auth/operation-not-allowed":
          setError("O cadastro por email/senha não está habilitado.");
          break;
        case "auth/weak-password":
          setError("A senha é muito fraca.");
          break;
        default:
          setError(`Erro ao criar conta: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-form">
      <h2>Criar Nova Conta</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nome</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>

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
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirm-password">Confirmar Senha</label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Criando conta..." : "Criar Conta"}
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={onCancel}
            disabled={loading}>
            Voltar
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
