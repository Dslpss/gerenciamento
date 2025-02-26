import React from "react";

const Navbar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    {
      id: "dashboard",
      icon: "dashboard",
      label: "Início",
      color: "#6366f1", // primary
    },
    {
      id: "expenses",
      icon: "receipt_long",
      label: "Gastos",
      color: "#ef4444", // danger
    },
    {
      id: "reports",
      icon: "bar_chart",
      label: "Relatórios",
      color: "#10b981", // success
    },
    {
      id: "settings",
      icon: "settings",
      label: "Ajustes",
      color: "#0ea5e9", // info
    },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`nav-item ${activeTab === item.id ? "active" : ""}`}
          onClick={() => setActiveTab(item.id)}
          style={{
            color: activeTab === item.id ? item.color : "var(--text-secondary)",
          }}>
          <span className="material-icons">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default Navbar;
