import React from "react";

const FontAwesomeTest = () => {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h3>Teste de ícones do Font Awesome</h3>
      <div
        style={{
          fontSize: "24px",
          display: "flex",
          justifyContent: "center",
          gap: "20px",
        }}>
        <i className="fas fa-check"></i>
        <i className="fas fa-times"></i>
        <i className="fas fa-pencil-alt"></i>
        <i className="fas fa-trash"></i>
        <i className="fas fa-th-list"></i>
        <i className="fas fa-list"></i>
      </div>
      <p>
        Se você está vendo os ícones acima, o Font Awesome está funcionando
        corretamente.
      </p>
    </div>
  );
};

export default FontAwesomeTest;
