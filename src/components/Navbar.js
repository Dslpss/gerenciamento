import React from "react";

const Navbar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: "dashboard", icon: "fas fa-chart-line", label: "Dashboard" },
    { id: "expenses", icon: "fas fa-wallet", label: "Gastos" },
    { id: "goals", icon: "fas fa-bullseye", label: "Metas" },
    { id: "reports", icon: "fas fa-chart-bar", label: "Relatórios" },
    { id: "settings", icon: "fas fa-cog", label: "Ajustes" },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`nav-item ${activeTab === item.id ? "active" : ""}`}
          onClick={() => setActiveTab(item.id)}>
          <i className={item.icon}></i>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default Navbar;
