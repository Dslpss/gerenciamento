import React, { useState, useEffect } from "react";
import Login from "./Login";
import SignUp from "./SignUp";
import ForgotPassword from "./ForgotPassword";
import "../styles/AuthScreen.css";

const AuthScreen = ({ onLoginSuccess }) => {
  const [currentView, setCurrentView] = useState("login");

  // Adicionar elementos numéricos dinâmicos
  useEffect(() => {
    const createRandomElements = () => {
      const container = document.querySelector(".auth-screen");
      if (!container) return;

      // Limpar elementos anteriores
      const oldElements = container.querySelector(".number-elements");
      if (oldElements) container.removeChild(oldElements);

      // Criar container para elementos numéricos
      const numbersContainer = document.createElement("div");
      numbersContainer.className = "number-elements";

      // Adicionar números estáticos definidos no CSS
      const staticNumbers = ["1234.56", "987.65", "45.67", "8901.23", "34.56"];
      staticNumbers.forEach((num, index) => {
        const element = document.createElement("div");
        element.className = `number-element number-${index + 1}`;
        element.textContent = num;
        numbersContainer.appendChild(element);
      });

      // Adicionar gráfico estilizado
      const chartElement = document.createElement("div");
      chartElement.className = "chart-element";
      numbersContainer.appendChild(chartElement);

      container.appendChild(numbersContainer);
    };

    createRandomElements();
  }, []);

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
        <div className="auth-logo-container">
          <h1 className="auth-screen-title">Gerenciamento de Gastos</h1>
          <p className="auth-screen-subtitle">
            Controle suas finanças de forma simples e eficiente
          </p>
        </div>

        {renderView()}
      </div>
    </div>
  );
};

export default AuthScreen;
