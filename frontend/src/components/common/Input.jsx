import React from 'react';
import styles from './Input.module.css';

/**
 * A reusable Input component with a label.
 */
const Input = ({ 
  label, 
  id, 
  type = 'text', 
  value, 
  onChange, 
  required = false, 
  autoComplete 
}) => {
  return (
    <div className={styles.inputGroup}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}
      <input
        type={type}
        id={id}
        className={styles.input}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
      />
    </div>
  );
};

export default Input;