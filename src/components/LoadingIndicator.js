import React from "react";
import "../styles/Loading.css";

const LoadingIndicator = ({ message = "Carregando..." }) => {
  return (
    <div className="loading-indicator">
      <div className="spinner"></div>
      <span>{message}</span>
    </div>
  );
};

export default LoadingIndicator;
