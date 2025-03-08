import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useExpenses } from "../contexts/ExpenseContext";
import "../styles/Header.css";

const Header = () => {
  const { currentUser, logout } = useAuth();
  const { expenses } = useExpenses();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [totalThisMonth, setTotalThisMonth] = useState(0);
  const menuRef = useRef(null);

  // Atualizar data e hora a cada segundo em vez de a cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000); // Atualiza a cada 1 segundo
    return () => clearInterval(timer);
  }, []);

  // Calcular gastos do mês atual considerando apenas o mês atual
  useEffect(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthExpenses = expenses.filter((expense) => {
      try {
        const expenseDate = new Date(expense.date);
        return (
          expenseDate.getMonth() === currentMonth &&
          expenseDate.getFullYear() === currentYear
        );
      } catch (e) {
        console.error("Erro ao processar data da despesa:", e);
        return false;
      }
    });

    const total = thisMonthExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    setTotalThisMonth(total);
  }, [expenses]);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Formatar moeda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  // Formatar data - simplificada para economizar espaço em mobile
  const formatDate = (date) => {
    const isMobile = window.innerWidth <= 480;

    if (isMobile) {
      return date.toLocaleDateString("pt-BR", {
        weekday: "short", // Abreviação do dia
        day: "numeric",
        month: "short", // Abreviação do mês
      });
    }

    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  // Formatar hora incluindo segundos
  const formatTime = (date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit", // Adicionado para mostrar segundos
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-left">
          <div className="logo-container">
            <i className="fas fa-chart-line logo-icon"></i>
            <h1 className="app-title">FinanSmart</h1>
          </div>
        </div>

        <div className="header-center">
          <div className="datetime-display">
            <div className="date">{formatDate(currentDateTime)}</div>
            <div className="time">{formatTime(currentDateTime)}</div>
          </div>
        </div>

        <div className="header-right">
          <div className="monthly-summary">
            <div className="monthly-label">Total do mês:</div>
            <div className="monthly-amount">
              {formatCurrency(totalThisMonth)}
            </div>
          </div>

          <div
            className="user-profile"
            onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="Perfil"
                className="profile-photo"
              />
            ) : (
              <div className="profile-initial">
                {currentUser?.email?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <i
              className={`fas fa-chevron-${
                isMenuOpen ? "up" : "down"
              } dropdown-icon`}></i>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <>
          <div className="overlay" onClick={() => setIsMenuOpen(false)}></div>
          <div className="dropdown-menu" ref={menuRef}>
            <div className="user-info">
              <div className="user-email">{currentUser.email}</div>
              <div className="user-status">
                <span className="status-indicator"></span>
                Conectado
              </div>
            </div>
            <ul className="menu-options">
              <li
                onClick={() => {
                  /* Implementar página de perfil */
                }}>
                <i className="fas fa-user"></i> Meu Perfil
              </li>
              <li
                onClick={() => {
                  /* Implementar página de preferências */
                }}>
                <i className="fas fa-cog"></i> Preferências
              </li>
              <li className="menu-divider"></li>
              <li onClick={handleLogout} className="logout-option">
                <i className="fas fa-sign-out-alt"></i> Sair
              </li>
            </ul>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
