import React from "react";

const Card = ({ children, variant = "default", className = "", onClick }) => {
  const variantClasses = {
    default: "card",
    highlight: "card card-highlight",
    success: "card card-success",
    warning: "card card-warning",
    danger: "card card-danger",
  };

  return (
    <div
      className={`${variantClasses[variant]} ${className}`}
      onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
