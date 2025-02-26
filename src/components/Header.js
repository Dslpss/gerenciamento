import React from "react";

const Header = ({ activeTab }) => {
  const getTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Visão Geral";
      case "expenses":
        return "Meus Gastos";
      case "reports":
        return "Relatórios";
      case "settings":
        return "Configurações";
      default:
        return "Gerenciamento";
    }
  };

  return (
    <header className="app-header">
      <h1>{getTitle()}</h1>
      <div className="header-actions">
        <button className="icon-button">
          <span className="material-icons">notifications</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
