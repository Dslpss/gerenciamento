import React from "react";

const CustomCheckbox = ({ id, checked, onChange, label, className = "" }) => {
  // Função para garantir que o clique no label também acione o checkbox
  const handleLabelClick = (e) => {
    // Previne comportamento padrão para garantir controle total
    e.preventDefault();

    // Inverte o estado atual do checkbox
    onChange({ target: { checked: !checked } });
  };

  return (
    <div className={`form-check ${className}`}>
      <input type="checkbox" id={id} checked={checked} onChange={onChange} />
      <label htmlFor={id} onClick={handleLabelClick}>
        {label}
      </label>
    </div>
  );
};

export default CustomCheckbox;
