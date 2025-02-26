import React from "react";
import LogoutButton from "./LogoutButton";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Header.css";

const Header = () => {
  const { currentUser } = useAuth();

  return (
    <header className="app-header">
      <div className="logo">
        <h1>Sistema de Gerenciamento</h1>
      </div>

      {currentUser && (
        <div className="user-actions">
          <div className="user-info">
            <span>Olá, {currentUser.email}</span>
            <LogoutButton className="logout-btn" />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
