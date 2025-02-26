import React, { useState } from "react";
import Login from "./Login";
import SignUp from "./SignUp";
import ForgotPassword from "./ForgotPassword";

const AuthScreen = ({ onLoginSuccess }) => {
  const [currentView, setCurrentView] = useState("login");

  const handleLoginSuccess = (user) => {
    console.log("Login bem-sucedido:", user);
    onLoginSuccess(user);
  };

  const handleSignupSuccess = (user) => {
    console.log("Cadastro bem-sucedido:", user);
    // Você pode adicionar uma mensagem de boas-vindas ou inicialização
    onLoginSuccess(user);
  };

  const renderView = () => {
    switch (currentView) {
      case "signup":
        return (
          <SignUp
            onSuccess={handleSignupSuccess}
            onCancel={() => setCurrentView("login")}
          />
        );
      case "forgot-password":
        return <ForgotPassword onBack={() => setCurrentView("login")} />;
      case "login":
      default:
        return (
          <Login
            onSuccess={handleLoginSuccess}
            onCreateAccount={() => setCurrentView("signup")}
            onForgotPassword={() => setCurrentView("forgot-password")}
          />
        );
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <div className="logo-container">
          <h1>Gerenciamento de Gastos</h1>
          <p>Controle suas finanças de forma simples e eficiente</p>
        </div>

        {renderView()}
      </div>
    </div>
  );
};

export default AuthScreen;
